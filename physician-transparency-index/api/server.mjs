#!/usr/bin/env node
// ============================================================================
// Physician Transparency Index — API Server
// Lightweight Express server querying SQLite for search, filter, leaderboard
// Uses better-sqlite3 for on-disk database access (handles large datasets)
// Usage: node api/server.mjs [--port 8766] [--db data/db/payments.sqlite]
// ============================================================================

import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    port: parseInt(args.find((_, i) => args[i - 1] === '--port') || '8766'),
    dbPath: args.find((_, i) => args[i - 1] === '--db') || path.join(PROJECT_ROOT, 'data', 'db', 'payments.sqlite'),
  };
}

async function main() {
  const { port, dbPath } = parseArgs();

  if (!existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    console.log('Run "npm run import" and "npm run aggregate" first.');
    process.exit(1);
  }

  // Open on-disk SQLite database
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('cache_size = -32000'); // 32MB cache
  console.log(`Database opened: ${dbPath}`);

  // Note: category queries use existing idx_payments_npi_year index via physician_npi

  const app = express();
  app.use(cors());

  // Serve static site files
  app.use(express.static(path.join(PROJECT_ROOT, 'site')));

  // Helper: query with params returning array of objects
  function query(sql, params = []) {
    try {
      return db.prepare(sql).all(...params);
    } catch (err) {
      console.error(`Query error: ${err.message}\nSQL: ${sql}`);
      return [];
    }
  }

  function queryOne(sql, params = []) {
    try {
      return db.prepare(sql).get(...params) || null;
    } catch (err) {
      console.error(`Query error: ${err.message}\nSQL: ${sql}`);
      return null;
    }
  }

  // ─── PRE-COMPUTE HEAVY QUERIES AT STARTUP ──────────────────────────────
  // Aggregations on 1.6M+ rows block the event loop, so cache them at startup
  console.log('Pre-computing cached data (this may take a moment)...');
  const t0 = Date.now();

  const cachedStats = db.prepare(`
    SELECT
      (SELECT SUM(total_records) FROM physician_profiles) as totalRecords,
      (SELECT ROUND(SUM(grand_total), 2) FROM physician_profiles) as totalPayments,
      (SELECT COUNT(*) FROM physician_profiles) as totalPhysicians,
      (SELECT COUNT(DISTINCT company_name) FROM agg_company) as totalCompanies,
      (SELECT COUNT(DISTINCT state) FROM agg_geography) as totalStates,
      (SELECT MIN(payment_year) FROM agg_year) as minYear,
      (SELECT MAX(payment_year) FROM agg_year) as maxYear
  `).get() || {};

  const cachedFilters = {
    states: db.prepare(`SELECT DISTINCT state FROM physician_profiles WHERE state != '' ORDER BY state`).all().map(r => r.state),
    specialties: db.prepare(`SELECT DISTINCT specialty FROM physician_profiles WHERE specialty != '' ORDER BY specialty`).all().map(r => r.specialty),
    years: db.prepare(`SELECT DISTINCT payment_year FROM agg_year ORDER BY payment_year DESC`).all().map(r => r.payment_year),
  };

  const cachedGeography = db.prepare(`
    SELECT state,
           SUM(physician_count) as total_physicians,
           ROUND(SUM(total_payments), 2) as total_payments,
           SUM(payment_count) as total_records
    FROM agg_geography
    GROUP BY state
    ORDER BY total_payments DESC
  `).all();

  const cachedSpecialty = db.prepare(`
    SELECT specialty,
           SUM(physician_count) as total_physicians,
           ROUND(SUM(total_payments), 2) as total_payments,
           ROUND(AVG(avg_payment), 2) as avg_payment,
           SUM(payment_count) as total_records
    FROM agg_specialty
    GROUP BY specialty
    ORDER BY total_payments DESC
    LIMIT 200
  `).all();

  const cachedTrends = db.prepare(`
    SELECT payment_year, payment_type,
           physician_count, total_payments, payment_count, avg_payment, max_payment
    FROM agg_year
    ORDER BY payment_year, payment_type
  `).all();

  // Pre-cache top companies (default view, no year filter)
  const cachedCompany = db.prepare(`
    SELECT company_name,
           SUM(physician_count) as total_physicians,
           ROUND(SUM(total_payments), 2) as total_payments,
           SUM(payment_count) as total_records,
           MAX(state_count) as state_count
    FROM agg_company
    GROUP BY company_name
    ORDER BY total_payments DESC
    LIMIT 100
  `).all();

  // Specialty company cache — populated lazily after server starts
  const cachedSpecialtyCompanies = {};

  // Pre-compute year-based leaderboards (top 500 per year)
  console.log('Pre-computing year leaderboards...');
  const cachedYearLeaderboards = {};
  const yearList = cachedFilters.years; // e.g. [2024, 2023, ..., 2018]
  for (const yr of yearList) {
    cachedYearLeaderboards[yr] = db.prepare(`
      SELECT physician_npi, physician_first, physician_last, specialty,
             state, city,
             ROUND(SUM(payment_amount), 2) as total_payments,
             COUNT(*) as payment_count,
             COUNT(DISTINCT company_name) as company_count,
             1 as years_active,
             GROUP_CONCAT(DISTINCT company_name) as companies,
             ${yr} as first_year, ${yr} as last_year
      FROM payments
      WHERE payment_year = ?
      GROUP BY physician_npi
      ORDER BY total_payments DESC
      LIMIT 500
    `).all(yr);
    console.log(`  Year ${yr}: ${cachedYearLeaderboards[yr].length} physicians cached`);
  }

  console.log(`Cached data ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  app.get('/api/stats', (req, res) => {
    res.json(cachedStats);
  });

  // ─── SEARCH PHYSICIANS ────────────────────────────────────────────────
  app.get('/api/search', (req, res) => {
    const { q, state, specialty, year, type, minAmount, maxAmount, page = 1, limit = 50, skipCategories } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let where = ['1=1'];
    let params = [];

    if (q) {
      where.push("(physician_first LIKE ? OR physician_last LIKE ? OR (physician_first || ' ' || physician_last) LIKE ?)");
      const wildcard = `%${q}%`;
      params.push(wildcard, wildcard, wildcard);
    }
    if (state) { where.push('state = ?'); params.push(state.toUpperCase()); }
    if (specialty) { where.push('specialty LIKE ?'); params.push(`%${specialty}%`); }
    if (year) { where.push('first_year <= ? AND last_year >= ?'); params.push(parseInt(year), parseInt(year)); }
    if (minAmount) { where.push('grand_total >= ?'); params.push(parseFloat(minAmount)); }
    if (maxAmount) { where.push('grand_total <= ?'); params.push(parseFloat(maxAmount)); }

    const table = 'physician_profiles';
    const whereClause = where.join(' AND ');

    const total = queryOne(
      `SELECT COUNT(*) as total FROM ${table} WHERE ${whereClause}`, params
    )?.total || 0;

    const results = query(`
      SELECT physician_npi, physician_first, physician_last, specialty,
             state, city, general_total, research_total, ownership_total,
             grand_total, total_records, years_active, company_count,
             first_year, last_year
      FROM ${table}
      WHERE ${whereClause}
      ORDER BY grand_total DESC
      LIMIT ? OFFSET ?
    `, [...params, limitNum, offset]);

    // When a year is selected, fetch year-specific totals and categories from payments table
    if (results.length > 0 && year && !skipCategories) {
      const npis = results.map(r => r.physician_npi);
      const placeholders = npis.map(() => '?').join(',');
      const catParams = [...npis, parseInt(year)];

      // Get year-specific total payments, record count, company count, AND category breakdowns in one query
      const yearData = query(`
        SELECT physician_npi,
          ROUND(SUM(payment_amount), 2) as year_total,
          COUNT(*) as year_records,
          COUNT(DISTINCT CASE WHEN company_name != '' THEN company_name END) as year_companies,
          ROUND(SUM(CASE WHEN nature_of_payment LIKE '%royalt%' THEN payment_amount ELSE 0 END), 2) as royalty,
          SUM(CASE WHEN nature_of_payment LIKE '%royalt%' THEN 1 ELSE 0 END) as royalty_n,
          ROUND(SUM(CASE WHEN nature_of_payment LIKE '%speaker%' OR nature_of_payment LIKE '%faculty%' THEN payment_amount ELSE 0 END), 2) as speaking,
          SUM(CASE WHEN nature_of_payment LIKE '%speaker%' OR nature_of_payment LIKE '%faculty%' THEN 1 ELSE 0 END) as speaking_n,
          ROUND(SUM(CASE WHEN nature_of_payment LIKE '%consult%' THEN payment_amount ELSE 0 END), 2) as consulting,
          SUM(CASE WHEN nature_of_payment LIKE '%consult%' THEN 1 ELSE 0 END) as consulting_n,
          ROUND(SUM(CASE WHEN nature_of_payment LIKE '%travel%' OR nature_of_payment LIKE '%lodging%' THEN payment_amount ELSE 0 END), 2) as travel,
          SUM(CASE WHEN nature_of_payment LIKE '%travel%' OR nature_of_payment LIKE '%lodging%' THEN 1 ELSE 0 END) as travel_n,
          ROUND(SUM(CASE WHEN nature_of_payment LIKE '%food%' OR nature_of_payment LIKE '%beverage%' THEN payment_amount ELSE 0 END), 2) as food,
          SUM(CASE WHEN nature_of_payment LIKE '%food%' OR nature_of_payment LIKE '%beverage%' THEN 1 ELSE 0 END) as food_n
        FROM payments
        WHERE physician_npi IN (${placeholders}) AND payment_year = ?
        GROUP BY physician_npi
      `, catParams);

      const yearMap = {};
      yearData.forEach(d => { yearMap[d.physician_npi] = d; });
      results.forEach(r => {
        const d = yearMap[r.physician_npi] || {};
        // Override totals with year-specific values
        r.grand_total = d.year_total || 0;
        r.total_records = d.year_records || 0;
        r.company_count = d.year_companies || 0;
        r.royalty = d.royalty || 0;
        r.royalty_n = d.royalty_n || 0;
        r.speaking = d.speaking || 0;
        r.speaking_n = d.speaking_n || 0;
        r.consulting = d.consulting || 0;
        r.consulting_n = d.consulting_n || 0;
        r.travel = d.travel || 0;
        r.travel_n = d.travel_n || 0;
        r.food = d.food || 0;
        r.food_n = d.food_n || 0;
      });

      // Re-sort by year-specific total
      results.sort((a, b) => b.grand_total - a.grand_total);
    }

    // Fetch category breakdowns when no year filter (all-time view)
    if (results.length > 0 && !year && !skipCategories) {
      const npis = results.map(r => r.physician_npi);
      const placeholders = npis.map(() => '?').join(',');
      const categories = query(`
        SELECT physician_npi,
          ROUND(SUM(CASE WHEN nature_of_payment LIKE '%royalt%' THEN payment_amount ELSE 0 END), 2) as royalty,
          SUM(CASE WHEN nature_of_payment LIKE '%royalt%' THEN 1 ELSE 0 END) as royalty_n,
          ROUND(SUM(CASE WHEN nature_of_payment LIKE '%speaker%' OR nature_of_payment LIKE '%faculty%' THEN payment_amount ELSE 0 END), 2) as speaking,
          SUM(CASE WHEN nature_of_payment LIKE '%speaker%' OR nature_of_payment LIKE '%faculty%' THEN 1 ELSE 0 END) as speaking_n,
          ROUND(SUM(CASE WHEN nature_of_payment LIKE '%consult%' THEN payment_amount ELSE 0 END), 2) as consulting,
          SUM(CASE WHEN nature_of_payment LIKE '%consult%' THEN 1 ELSE 0 END) as consulting_n,
          ROUND(SUM(CASE WHEN nature_of_payment LIKE '%travel%' OR nature_of_payment LIKE '%lodging%' THEN payment_amount ELSE 0 END), 2) as travel,
          SUM(CASE WHEN nature_of_payment LIKE '%travel%' OR nature_of_payment LIKE '%lodging%' THEN 1 ELSE 0 END) as travel_n,
          ROUND(SUM(CASE WHEN nature_of_payment LIKE '%food%' OR nature_of_payment LIKE '%beverage%' THEN payment_amount ELSE 0 END), 2) as food,
          SUM(CASE WHEN nature_of_payment LIKE '%food%' OR nature_of_payment LIKE '%beverage%' THEN 1 ELSE 0 END) as food_n
        FROM payments
        WHERE physician_npi IN (${placeholders})
        GROUP BY physician_npi
      `, npis);

      const catMap = {};
      categories.forEach(c => { catMap[c.physician_npi] = c; });
      results.forEach(r => {
        const c = catMap[r.physician_npi] || {};
        r.royalty = c.royalty || 0;
        r.royalty_n = c.royalty_n || 0;
        r.speaking = c.speaking || 0;
        r.speaking_n = c.speaking_n || 0;
        r.consulting = c.consulting || 0;
        r.consulting_n = c.consulting_n || 0;
        r.travel = c.travel || 0;
        r.travel_n = c.travel_n || 0;
        r.food = c.food || 0;
        r.food_n = c.food_n || 0;
      });
    }

    res.json({
      results,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  });

  // ─── PHYSICIAN PROFILE ────────────────────────────────────────────────
  app.get('/api/physician/:npi', (req, res) => {
    const { npi } = req.params;
    const { year } = req.query;

    const profile = queryOne(
      'SELECT * FROM physician_profiles WHERE physician_npi = ?', [npi]
    );

    if (!profile) {
      return res.status(404).json({ error: 'Physician not found' });
    }

    const yearFilter = year ? ' AND payment_year = ?' : '';
    const yearParam = year ? [npi, parseInt(year)] : [npi];

    const byYear = query(`
      SELECT payment_year, payment_type,
             ROUND(SUM(payment_amount), 2) as total,
             COUNT(*) as count
      FROM payments WHERE physician_npi = ?
      GROUP BY payment_year, payment_type
      ORDER BY payment_year
    `, [npi]);

    const availableYears = query(`
      SELECT DISTINCT payment_year FROM payments
      WHERE physician_npi = ?
      ORDER BY payment_year DESC
    `, [npi]).map(r => r.payment_year);

    const yearStats = queryOne(`
      SELECT COUNT(*) as payment_count,
             ROUND(SUM(payment_amount), 2) as total_amount,
             COUNT(DISTINCT CASE WHEN company_name != '' THEN company_name END) as company_count
      FROM payments WHERE physician_npi = ?${yearFilter}
    `, yearParam) || {};

    const topCompanies = query(`
      SELECT company_name,
             ROUND(SUM(payment_amount), 2) as total,
             COUNT(*) as count
      FROM payments WHERE physician_npi = ?${yearFilter} AND company_name != ''
      GROUP BY company_name
      ORDER BY total DESC LIMIT 20
    `, yearParam);

    const topDrugs = query(`
      SELECT drug_or_device_1 as drug,
             ROUND(SUM(payment_amount), 2) as total,
             COUNT(*) as count
      FROM payments WHERE physician_npi = ?${yearFilter} AND drug_or_device_1 != ''
      GROUP BY drug_or_device_1
      ORDER BY total DESC LIMIT 20
    `, yearParam);

    const paymentCategories = query(`
      SELECT nature_of_payment as category,
             COUNT(*) as count,
             ROUND(SUM(payment_amount), 2) as total
      FROM payments WHERE physician_npi = ?${yearFilter} AND nature_of_payment != ''
      GROUP BY nature_of_payment
      ORDER BY total DESC
    `, yearParam);

    const calendarData = []; // Removed for performance

    const paymentDetails = query(`
      SELECT payment_date, payment_amount, nature_of_payment,
             company_name, drug_or_device_1, drug_or_device_2,
             form_of_payment, payment_type
      FROM payments WHERE physician_npi = ?${yearFilter}
      ORDER BY payment_amount DESC
      LIMIT 500
    `, yearParam);

    res.json({
      profile,
      paymentsByYear: byYear,
      availableYears,
      yearStats,
      topCompanies,
      topDrugs,
      paymentCategories,
      calendarData,
      paymentDetails,
    });
  });

  // ─── PHYSICIAN PAYMENTS BY CATEGORY ───────────────────────────────────
  app.get('/api/physician/:npi/category', (req, res) => {
    const { npi } = req.params;
    const { category, year } = req.query;
    if (!category) return res.status(400).json({ error: 'category required' });

    const yearFilter = year ? ' AND payment_year = ?' : '';
    const params = year ? [npi, category, parseInt(year)] : [npi, category];

    const results = query(`
      SELECT payment_date, payment_amount, nature_of_payment,
             company_name, drug_or_device_1, drug_or_device_2,
             form_of_payment, payment_type, payment_year
      FROM payments
      WHERE physician_npi = ? AND nature_of_payment = ?${yearFilter}
      ORDER BY payment_date DESC, payment_amount DESC
      LIMIT 500
    `, params);

    res.json(results);
  });

  // ─── LEADERBOARD ──────────────────────────────────────────────────────
  app.get('/api/leaderboard', (req, res) => {
    const { specialty, state, year, limit = 100 } = req.query;
    const limitNum = Math.min(500, Math.max(1, parseInt(limit)));

    // If a specific year is requested
    if (year && year !== 'all') {
      const yearInt = parseInt(year);
      const hasFilters = (specialty && specialty !== 'all') || (state && state !== 'all');

      // If no specialty/state filter, use the pre-cached top 500
      if (!hasFilters) {
        const cached = cachedYearLeaderboards[yearInt] || [];
        res.json(cached.slice(0, limitNum));
        return;
      }

      // With specialty/state filters, query live to get full results (not just top 500 overall)
      let where = ['payment_year = ?'];
      let params = [yearInt];

      if (specialty && specialty !== 'all') {
        where.push('specialty LIKE ?');
        params.push(`%${specialty}%`);
      }
      if (state && state !== 'all') {
        where.push('state = ?');
        params.push(state.toUpperCase());
      }

      const results = query(`
        SELECT physician_npi, physician_first, physician_last, specialty,
               state, city,
               ROUND(SUM(payment_amount), 2) as total_payments,
               COUNT(*) as payment_count,
               COUNT(DISTINCT company_name) as company_count,
               1 as years_active,
               GROUP_CONCAT(DISTINCT company_name) as companies,
               ${yearInt} as first_year, ${yearInt} as last_year
        FROM payments
        WHERE ${where.join(' AND ')}
        GROUP BY physician_npi
        ORDER BY total_payments DESC
        LIMIT ?
      `, [...params, limitNum]);

      res.json(results);
      return;
    }

    // All years — use pre-aggregated table
    let where = ['1=1'];
    let params = [];

    if (specialty && specialty !== 'all') {
      where.push('specialty LIKE ?');
      params.push(`%${specialty}%`);
    }
    if (state && state !== 'all') {
      where.push('state = ?');
      params.push(state.toUpperCase());
    }

    const results = query(`
      SELECT physician_npi, physician_first, physician_last, specialty,
             state, city, total_payments, payment_count, company_count,
             years_active, companies, first_year, last_year
      FROM agg_top_earners
      WHERE ${where.join(' AND ')}
      ORDER BY total_payments DESC
      LIMIT ?
    `, [...params, limitNum]);

    res.json(results);
  });

  // ─── AGGREGATES: SPECIALTY ─────────────────────────────────────────────
  app.get('/api/aggregates/specialty', (req, res) => {
    res.json(cachedSpecialty);
  });

  // ─── AGGREGATES: SPECIALTY TOP COMPANIES ──────────────────────────────
  app.get('/api/aggregates/specialty/companies', (req, res) => {
    const { specialty } = req.query;
    if (!specialty) return res.status(400).json({ error: 'specialty required' });

    // Return cached data if available, otherwise query and cache
    if (cachedSpecialtyCompanies[specialty]) {
      return res.json(cachedSpecialtyCompanies[specialty]);
    }

    const results = query(`
      SELECT company_name,
             ROUND(SUM(payment_amount), 2) as total_payments,
             COUNT(*) as payment_count
      FROM payments
      WHERE specialty = ? AND company_name != ''
      GROUP BY company_name
      ORDER BY total_payments DESC
      LIMIT 10
    `, [specialty]);

    cachedSpecialtyCompanies[specialty] = results;
    res.json(results);
  });

  // ─── AGGREGATES: GEOGRAPHY ─────────────────────────────────────────────
  app.get('/api/aggregates/geography', (req, res) => {
    const { state } = req.query;

    if (state) {
      res.json(query(`
        SELECT city, state,
               SUM(physician_count) as total_physicians,
               ROUND(SUM(total_payments), 2) as total_payments,
               SUM(payment_count) as total_records
        FROM agg_geography
        WHERE state = ?
        GROUP BY city
        ORDER BY total_payments DESC
        LIMIT 100
      `, [state.toUpperCase()]));
    } else {
      res.json(cachedGeography);
    }
  });

  // ─── AGGREGATES: COMPANY ───────────────────────────────────────────────
  app.get('/api/aggregates/company', (req, res) => {
    const { year, limit = 100 } = req.query;
    const limitNum = Math.min(500, parseInt(limit));

    // Return cached data for default view (no year filter, limit 100)
    if (!year && limitNum === 100) {
      return res.json(cachedCompany);
    }

    let where = ['1=1'];
    let params = [];
    if (year) { where.push('payment_year = ?'); params.push(parseInt(year)); }

    res.json(query(`
      SELECT company_name,
             SUM(physician_count) as total_physicians,
             ROUND(SUM(total_payments), 2) as total_payments,
             SUM(payment_count) as total_records,
             MAX(state_count) as state_count
      FROM agg_company
      WHERE ${where.join(' AND ')}
      GROUP BY company_name
      ORDER BY total_payments DESC
      LIMIT ?
    `, [...params, limitNum]));
  });

  // ─── AGGREGATES: YEAR TRENDS ───────────────────────────────────────────
  app.get('/api/aggregates/trends', (req, res) => {
    res.json(cachedTrends);
  });

  // ─── FILTER OPTIONS ────────────────────────────────────────────────────
  app.get('/api/filters', (req, res) => {
    res.json(cachedFilters);
  });

  // ─── EXPORT: Physician JSON ──────────────────────────────────────────────
  app.get('/api/export/physician/:npi', (req, res) => {
    const { npi } = req.params;
    const p = queryOne(
      'SELECT * FROM physician_profiles WHERE physician_npi = ?', [npi]
    );
    if (!p) return res.status(404).json({ error: 'Not found' });

    const companies = (p.companies || '').split(',').filter(Boolean);

    res.json({
      physicianName: `${p.physician_first} ${p.physician_last}`.trim(),
      specialty: p.specialty,
      state: p.state,
      city: p.city,
      totalPayments: p.grand_total,
      paymentsByType: {
        general: p.general_total,
        research: p.research_total,
        ownership: p.ownership_total,
      },
      companies: companies.slice(0, 20),
      paymentYear: `${p.first_year}-${p.last_year}`,
      notes: `${p.total_records} payment records across ${p.years_active} years. ${p.company_count} companies.`,
    });
  });

  // ─── RISK SCORING ENGINE ────────────────────────────────────────────────
  app.get('/api/risk', (req, res) => {
    const { state, minScore = 0, limit = 100 } = req.query;
    const limitNum = Math.min(500, parseInt(limit));
    const minScoreNum = parseInt(minScore);

    const specStats = query(`
      SELECT specialty,
             AVG(grand_total) as mean_total,
             COUNT(*) as physician_count,
             SUM(grand_total) as sum_total
      FROM physician_profiles
      WHERE specialty != ''
      GROUP BY specialty
    `);
    const specMap = {};
    for (const s of specStats) specMap[s.specialty] = s;

    const overallMean = queryOne(
      'SELECT AVG(grand_total) as mean_total FROM physician_profiles'
    )?.mean_total || 1;

    let where = ['grand_total > 0'];
    let params = [];
    if (state && state !== 'all') {
      where.push('state = ?');
      params.push(state.toUpperCase());
    }

    const physicians = query(`
      SELECT physician_npi, physician_first, physician_last, specialty,
             state, city, general_total, research_total, ownership_total,
             grand_total, total_records, years_active, company_count,
             first_year, last_year
      FROM physician_profiles
      WHERE ${where.join(' AND ')}
      ORDER BY grand_total DESC
      LIMIT 2000
    `, params);

    const allTotals = physicians.map(p => p.grand_total).sort((a, b) => a - b);
    function percentileOf(val) {
      const idx = allTotals.findIndex(v => v >= val);
      return idx >= 0 ? (idx / allTotals.length) * 100 : 100;
    }

    const scored = physicians.map(p => {
      const specMean = specMap[p.specialty]?.mean_total || overallMean;
      const pctile = percentileOf(p.grand_total);

      const volumeScore = Math.min(25, Math.round(pctile / 4));
      const concentrationScore = p.company_count === 0
        ? Math.min(15, Math.round(pctile / 8))
        : p.company_count === 1 ? 25
        : Math.min(25, Math.round(25 / Math.sqrt(p.company_count)));
      const consistencyScore = Math.min(20, p.years_active * 5);
      const ratio = p.grand_total / Math.max(specMean, 1);
      const outlierScore = ratio > 100 ? 20 : ratio > 50 ? 18 : ratio > 20 ? 15 :
                           ratio > 10 ? 12 : ratio > 5 ? 8 : ratio > 2 ? 5 : ratio > 1 ? 2 : 0;
      const generalRatio = p.grand_total > 0 ? (p.general_total / p.grand_total) : 0;
      const typeScore = Math.round(generalRatio * 10);

      const totalScore = volumeScore + concentrationScore + consistencyScore + outlierScore + typeScore;
      const clampedScore = Math.min(100, Math.max(0, totalScore));

      const factors = [
        { name: 'Payment Volume', score: volumeScore },
        { name: 'Company Concentration', score: concentrationScore },
        { name: 'Consistency', score: consistencyScore },
        { name: 'Outlier Status', score: outlierScore },
        { name: 'Payment Type', score: typeScore },
      ].sort((a, b) => b.score - a.score);

      return {
        ...p,
        riskScore: clampedScore,
        riskLevel: clampedScore >= 75 ? 'Critical' : clampedScore >= 50 ? 'High' :
                   clampedScore >= 25 ? 'Elevated' : 'Low',
        topFactor: factors[0].name,
        breakdown: {
          volume: volumeScore, concentration: concentrationScore,
          consistency: consistencyScore, outlier: outlierScore, typeMix: typeScore,
        },
      };
    });

    const filtered = scored
      .filter(p => p.riskScore >= minScoreNum)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limitNum);

    res.json({
      results: filtered,
      meta: {
        totalAnalyzed: physicians.length,
        totalFlagged: filtered.length,
        specStatsCount: specStats.length,
      },
    });
  });

  // Start server
  app.listen(port, () => {
    console.log(`\nPhysician Transparency Index API running on http://localhost:${port}`);
    console.log(`Website: http://localhost:${port}/index.html`);
    console.log(`API: http://localhost:${port}/api/stats`);
  });
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
