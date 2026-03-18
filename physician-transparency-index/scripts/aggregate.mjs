#!/usr/bin/env node
// ============================================================================
// Aggregation Engine — Builds 5 summary types + physician profiles
// Uses better-sqlite3 for on-disk operation (handles large datasets)
// Usage: node scripts/aggregate.mjs [--db data/db/payments.sqlite]
// ============================================================================

import { existsSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB = path.join(__dirname, '..', 'data', 'db', 'payments.sqlite');

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dbPath: args.find((_, i) => args[i - 1] === '--db') || DEFAULT_DB,
  };
}

function createAggTables(db) {
  console.log('Building aggregation tables...\n');

  // ─── 1. PHYSICIAN PROFILES ───────────────────────────────────────────
  console.log('1/6 Physician profiles...');
  db.exec('DROP TABLE IF EXISTS physician_profiles');
  db.exec(`
    CREATE TABLE physician_profiles AS
    SELECT
      physician_npi,
      MAX(physician_first) as physician_first,
      MAX(physician_last) as physician_last,
      MAX(specialty) as specialty,
      MAX(state) as state,
      MAX(city) as city,
      ROUND(SUM(CASE WHEN payment_type='general' THEN payment_amount ELSE 0 END), 2) as general_total,
      ROUND(SUM(CASE WHEN payment_type='research' THEN payment_amount ELSE 0 END), 2) as research_total,
      ROUND(SUM(CASE WHEN payment_type='ownership' THEN payment_amount ELSE 0 END), 2) as ownership_total,
      ROUND(SUM(payment_amount), 2) as grand_total,
      COUNT(*) as total_records,
      COUNT(DISTINCT payment_year) as years_active,
      COUNT(DISTINCT CASE WHEN company_name != '' THEN company_name END) as company_count,
      MIN(payment_year) as first_year,
      MAX(payment_year) as last_year,
      GROUP_CONCAT(DISTINCT CASE WHEN company_name != '' THEN company_name END) as companies,
      GROUP_CONCAT(DISTINCT CASE WHEN drug_or_device_1 != '' THEN drug_or_device_1 END) as drugs
    FROM payments
    WHERE physician_npi IS NOT NULL AND physician_npi != ''
    GROUP BY physician_npi
  `);
  db.exec('CREATE INDEX IF NOT EXISTS idx_prof_npi ON physician_profiles(physician_npi)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_prof_state ON physician_profiles(state)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_prof_specialty ON physician_profiles(specialty)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_prof_total ON physician_profiles(grand_total)');

  const profCount = db.prepare('SELECT COUNT(*) as cnt FROM physician_profiles').get().cnt;
  console.log(`  → ${profCount.toLocaleString()} physician profiles\n`);

  // ─── 2. BY SPECIALTY ─────────────────────────────────────────────────
  console.log('2/6 By Specialty...');
  db.exec('DROP TABLE IF EXISTS agg_specialty');
  db.exec(`
    CREATE TABLE agg_specialty AS
    SELECT
      specialty,
      payment_year,
      COUNT(DISTINCT physician_npi) as physician_count,
      ROUND(SUM(payment_amount), 2) as total_payments,
      ROUND(AVG(payment_amount), 2) as avg_payment,
      COUNT(*) as payment_count
    FROM payments
    WHERE specialty IS NOT NULL AND specialty != ''
    GROUP BY specialty, payment_year
    ORDER BY total_payments DESC
  `);
  const specCount = db.prepare('SELECT COUNT(DISTINCT specialty) as cnt FROM agg_specialty').get().cnt;
  console.log(`  → ${specCount} specialties\n`);

  // ─── 3. BY GEOGRAPHY ─────────────────────────────────────────────────
  console.log('3/6 By Geography...');
  db.exec('DROP TABLE IF EXISTS agg_geography');
  db.exec(`
    CREATE TABLE agg_geography AS
    SELECT
      state,
      city,
      payment_year,
      COUNT(DISTINCT physician_npi) as physician_count,
      ROUND(SUM(payment_amount), 2) as total_payments,
      COUNT(*) as payment_count,
      COUNT(DISTINCT specialty) as specialty_count
    FROM payments
    WHERE state IS NOT NULL AND state != ''
    GROUP BY state, city, payment_year
    ORDER BY total_payments DESC
  `);
  const geoStates = db.prepare('SELECT COUNT(DISTINCT state) as cnt FROM agg_geography').get().cnt;
  console.log(`  → ${geoStates} states\n`);

  // ─── 4. BY COMPANY ───────────────────────────────────────────────────
  console.log('4/6 By Company...');
  db.exec('DROP TABLE IF EXISTS agg_company');
  db.exec(`
    CREATE TABLE agg_company AS
    SELECT
      company_name,
      payment_year,
      payment_type,
      COUNT(DISTINCT physician_npi) as physician_count,
      ROUND(SUM(payment_amount), 2) as total_payments,
      COUNT(*) as payment_count,
      COUNT(DISTINCT state) as state_count
    FROM payments
    WHERE company_name IS NOT NULL AND company_name != ''
    GROUP BY company_name, payment_year, payment_type
    ORDER BY total_payments DESC
  `);
  const compCount = db.prepare('SELECT COUNT(DISTINCT company_name) as cnt FROM agg_company').get().cnt;
  console.log(`  → ${compCount.toLocaleString()} companies\n`);

  // ─── 5. BY YEAR (TRENDS) ─────────────────────────────────────────────
  console.log('5/6 By Year (trends)...');
  db.exec('DROP TABLE IF EXISTS agg_year');
  db.exec(`
    CREATE TABLE agg_year AS
    SELECT
      payment_year,
      payment_type,
      COUNT(DISTINCT physician_npi) as physician_count,
      ROUND(SUM(payment_amount), 2) as total_payments,
      COUNT(*) as payment_count,
      ROUND(AVG(payment_amount), 2) as avg_payment,
      ROUND(MAX(payment_amount), 2) as max_payment
    FROM payments
    GROUP BY payment_year, payment_type
    ORDER BY payment_year, payment_type
  `);
  const yearCount = db.prepare('SELECT COUNT(DISTINCT payment_year) as cnt FROM agg_year').get().cnt;
  console.log(`  → ${yearCount} years\n`);

  // ─── 6. TOP EARNERS LEADERBOARD ──────────────────────────────────────
  console.log('6/6 Top Earners leaderboard...');
  db.exec('DROP TABLE IF EXISTS agg_top_earners');
  db.exec(`
    CREATE TABLE agg_top_earners AS
    SELECT
      physician_npi,
      MAX(physician_first) as physician_first,
      MAX(physician_last) as physician_last,
      MAX(specialty) as specialty,
      MAX(state) as state,
      MAX(city) as city,
      ROUND(SUM(payment_amount), 2) as total_payments,
      COUNT(*) as payment_count,
      COUNT(DISTINCT CASE WHEN company_name != '' THEN company_name END) as company_count,
      COUNT(DISTINCT payment_year) as years_active,
      GROUP_CONCAT(DISTINCT CASE WHEN company_name != '' THEN company_name END) as companies,
      MIN(payment_year) as first_year,
      MAX(payment_year) as last_year
    FROM payments
    WHERE physician_npi IS NOT NULL AND physician_npi != ''
    GROUP BY physician_npi
    ORDER BY total_payments DESC
  `);
  const topCount = db.prepare('SELECT COUNT(*) as cnt FROM agg_top_earners').get().cnt;
  console.log(`  → ${topCount.toLocaleString()} physicians ranked\n`);
}

function exportSummaryJSON(db, outputDir) {
  console.log('Exporting summary JSON files...\n');
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  function writeJSON(filename, data) {
    const filePath = path.join(outputDir, filename);
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    const size = (JSON.stringify(data).length / 1024).toFixed(1);
    console.log(`  ${filename} (${size} KB)`);
  }

  writeJSON('year-trends.json', db.prepare(`
    SELECT payment_year, payment_type, physician_count, total_payments, payment_count, avg_payment
    FROM agg_year ORDER BY payment_year
  `).all());

  writeJSON('top-earners.json', db.prepare(`
    SELECT physician_npi, physician_first, physician_last, specialty, state, city,
           total_payments, payment_count, company_count, years_active, companies, first_year, last_year
    FROM agg_top_earners LIMIT 500
  `).all());

  writeJSON('specialty-summary.json', db.prepare(`
    SELECT specialty,
           SUM(physician_count) as total_physicians,
           SUM(total_payments) as total_payments,
           ROUND(AVG(avg_payment), 2) as avg_payment,
           SUM(payment_count) as total_records
    FROM agg_specialty GROUP BY specialty ORDER BY total_payments DESC LIMIT 100
  `).all());

  writeJSON('geography-summary.json', db.prepare(`
    SELECT state,
           SUM(physician_count) as total_physicians,
           ROUND(SUM(total_payments), 2) as total_payments,
           SUM(payment_count) as total_records
    FROM agg_geography GROUP BY state ORDER BY total_payments DESC
  `).all());

  writeJSON('company-summary.json', db.prepare(`
    SELECT company_name,
           SUM(physician_count) as total_physicians,
           ROUND(SUM(total_payments), 2) as total_payments,
           SUM(payment_count) as total_records,
           MAX(state_count) as state_count
    FROM agg_company GROUP BY company_name ORDER BY total_payments DESC LIMIT 200
  `).all());

  const stats = {
    totalPayments: db.prepare('SELECT ROUND(SUM(payment_amount), 2) as v FROM payments').get().v,
    totalRecords: db.prepare('SELECT COUNT(*) as v FROM payments').get().v,
    totalPhysicians: db.prepare("SELECT COUNT(DISTINCT physician_npi) as v FROM payments WHERE physician_npi != ''").get().v,
    totalCompanies: db.prepare("SELECT COUNT(DISTINCT company_name) as v FROM payments WHERE company_name != ''").get().v,
    totalStates: db.prepare("SELECT COUNT(DISTINCT state) as v FROM payments WHERE state != ''").get().v,
    yearRange: {
      min: db.prepare('SELECT MIN(payment_year) as v FROM payments').get().v,
      max: db.prepare('SELECT MAX(payment_year) as v FROM payments').get().v,
    },
  };
  writeJSON('dashboard-stats.json', stats);

  console.log('JSON export complete.\n');
}

async function main() {
  const { dbPath } = parseArgs();

  if (!existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    console.log('Run "npm run import" first.');
    process.exit(1);
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  const startTime = Date.now();

  createAggTables(db);

  const jsonDir = path.join(__dirname, '..', 'site', 'data');
  exportSummaryJSON(db, jsonDir);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`=== Aggregation complete in ${elapsed}s ===`);

  db.close();
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
