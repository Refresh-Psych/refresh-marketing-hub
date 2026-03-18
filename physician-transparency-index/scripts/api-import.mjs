#!/usr/bin/env node
// ============================================================================
// CMS Open Payments — API Import (Full Detail)
// Queries CMS SODA API — max 500 records per page
// Uses better-sqlite3 for on-disk storage
// Usage: node scripts/api-import.mjs [--years 2024] [--types general,research]
//        [--fresh] [--batch 500]
// Note: API is rate-limited ~180 rec/s. For full import use csv-import.mjs instead.
// ============================================================================

import { existsSync, mkdirSync, unlinkSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(PROJECT_ROOT, 'data', 'db', 'payments.sqlite');

const DATASET_UUIDS = {
  general: {
    2024: 'e6b17c6a-2534-4207-a4a1-6746a14911ff',
    2023: 'fb3a65aa-c901-4a38-a813-b04b00dfa2a9',
    2022: 'df01c2f8-dc1f-4e79-96cb-8208beaf143c',
    2021: '0380bbeb-aea1-58b6-b708-829f92a48202',
    2020: 'a08c4b30-5cf3-4948-ad40-36f404619019',
    2019: '4e54dd6c-30f8-4f86-86a7-3c109a89528e',
    2018: 'f003634c-c103-568f-876c-73017fa83be0',
  },
  research: {
    2024: '252e3786-fabc-4b65-804c-e0a197e8d6f5',
    2023: '8e3bfb43-0764-4e5b-b0ba-09a1378d7858',
    2022: '88e1af38-b0c4-4d24-b3b1-0d2b39c92c17',
    2021: '2861ff5c-4b4e-515f-a024-9f1d8b0e2ce0',
  },
};

const API_BASE = 'https://openpaymentsdata.cms.gov/api/1/datastore/query';

function parseArgs() {
  const args = process.argv.slice(2);
  let years = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
  let types = ['general', 'research'];
  let batchSize = 500; // API max
  let fresh = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--years' && args[i + 1]) years = args[++i].split(',').map(Number);
    else if (args[i] === '--types' && args[i + 1]) types = args[++i].split(',');
    else if (args[i] === '--batch' && args[i + 1]) batchSize = Math.min(500, parseInt(args[++i]));
    else if (args[i] === '--fresh') fresh = true;
  }
  return { years, types, batchSize, fresh };
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPage(uuid, offset, limit) {
  const url = `${API_BASE}/${uuid}/0?limit=${limit}&offset=${offset}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (err) {
      if (attempt < 2) { await delay(2000 * (attempt + 1)); continue; }
      throw err;
    }
  }
}

function initDB(fresh) {
  const dbDir = path.dirname(DB_PATH);
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });
  if (fresh && existsSync(DB_PATH)) { unlinkSync(DB_PATH); console.log('Fresh start'); }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = -64000');

  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      physician_first TEXT, physician_last TEXT, physician_npi TEXT,
      specialty TEXT, state TEXT, city TEXT, zip TEXT,
      payment_amount REAL, payment_date TEXT, payment_year INTEGER,
      payment_type TEXT, nature_of_payment TEXT,
      company_name TEXT, company_id TEXT,
      drug_or_device_1 TEXT, drug_or_device_2 TEXT, drug_or_device_3 TEXT,
      form_of_payment TEXT, record_id TEXT
    )
  `);

  for (const idx of [
    'CREATE INDEX IF NOT EXISTS idx_npi ON payments(physician_npi)',
    'CREATE INDEX IF NOT EXISTS idx_specialty ON payments(specialty)',
    'CREATE INDEX IF NOT EXISTS idx_state ON payments(state)',
    'CREATE INDEX IF NOT EXISTS idx_year ON payments(payment_year)',
    'CREATE INDEX IF NOT EXISTS idx_company ON payments(company_name)',
    'CREATE INDEX IF NOT EXISTS idx_type ON payments(payment_type)',
    'CREATE INDEX IF NOT EXISTS idx_record ON payments(record_id)',
  ]) db.exec(idx);

  return db;
}

async function main() {
  const { years, types, batchSize, fresh } = parseArgs();

  console.log('=== CMS Open Payments — API Import ===');
  console.log(`Years: ${years.join(', ')} | Types: ${types.join(', ')} | Batch: ${batchSize}\n`);

  const db = initDB(fresh);

  const insertStmt = db.prepare(`
    INSERT INTO payments (physician_first, physician_last, physician_npi, specialty,
      state, city, zip, payment_amount, payment_date, payment_year, payment_type,
      nature_of_payment, company_name, company_id, drug_or_device_1, drug_or_device_2,
      drug_or_device_3, form_of_payment, record_id)
    VALUES (@physician_first, @physician_last, @physician_npi, @specialty,
      @state, @city, @zip, @payment_amount, @payment_date, @payment_year, @payment_type,
      @nature_of_payment, @company_name, @company_id, @drug_or_device_1, @drug_or_device_2,
      @drug_or_device_3, @form_of_payment, @record_id)
  `);

  const insertMany = db.transaction((rows) => { for (const row of rows) insertStmt.run(row); });

  let grandTotal = 0;

  for (const year of years.sort()) {
    for (const type of types) {
      const uuid = DATASET_UUIDS[type]?.[year];
      if (!uuid) { console.log(`No ${type} UUID for ${year}`); continue; }

      const existing = db.prepare(
        'SELECT COUNT(*) as cnt FROM payments WHERE payment_year = ? AND payment_type = ?'
      ).get(year, type).cnt;
      if (existing > 0) { console.log(`${year} ${type}: ${existing.toLocaleString()} records exist, skipping`); continue; }

      const firstPage = await fetchPage(uuid, 0, 1);
      const total = firstPage.count || 0;
      console.log(`\n${year} ${type}: ${total.toLocaleString()} records`);

      let offset = 0, imported = 0;
      const startTime = Date.now();

      while (true) {
        try {
          const data = await fetchPage(uuid, offset, batchSize);
          const results = data.results || [];
          if (results.length === 0) break;

          const rows = results
            .filter(r => (r.covered_recipient_npi || '').trim())
            .map(r => ({
              physician_first: (r.covered_recipient_first_name || '').trim(),
              physician_last: (r.covered_recipient_last_name || '').trim(),
              physician_npi: (r.covered_recipient_npi || '').trim(),
              specialty: (r.covered_recipient_specialty_1 || '').trim(),
              state: (r.recipient_state || '').trim(),
              city: (r.recipient_city || '').trim(),
              zip: (r.recipient_zip_code || '').trim(),
              payment_amount: parseFloat(r.total_amount_of_payment_usdollars || '0') || 0,
              payment_date: (r.date_of_payment || '').trim(),
              payment_year: parseInt(r.program_year) || year,
              payment_type: type,
              nature_of_payment: (r.nature_of_payment_or_transfer_of_value || '').trim(),
              company_name: (r.applicable_manufacturer_or_applicable_gpo_making_payment_name || '').trim(),
              company_id: (r.applicable_manufacturer_or_applicable_gpo_making_payment_id || '').trim(),
              drug_or_device_1: (r.name_of_drug_or_biological_or_device_or_medical_supply_1 || '').trim(),
              drug_or_device_2: (r.name_of_drug_or_biological_or_device_or_medical_supply_2 || '').trim(),
              drug_or_device_3: (r.name_of_drug_or_biological_or_device_or_medical_supply_3 || '').trim(),
              form_of_payment: (r.form_of_payment_or_transfer_of_value || '').trim(),
              record_id: (r.record_id || '').trim(),
            }));

          if (rows.length > 0) insertMany(rows);
          imported += rows.length;
          offset += results.length;

          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
          const rate = Math.round(imported / ((Date.now() - startTime) / 1000));
          const pct = total > 0 ? ((offset / total) * 100).toFixed(1) : '?';
          process.stderr.write(`  ${imported.toLocaleString()} (${pct}%) ${elapsed}s ${rate}/s   \r`);

          if (results.length < batchSize) break;
        } catch (err) {
          console.error(`\n  Error at offset ${offset}: ${err.message}`);
          await delay(5000);
        }
      }

      grandTotal += imported;
      console.log(`\n  → ${imported.toLocaleString()} records imported`);
    }
  }

  const totalRows = db.prepare('SELECT COUNT(*) as cnt FROM payments').get().cnt;
  console.log(`\n=== Done: ${grandTotal.toLocaleString()} new, ${totalRows.toLocaleString()} total ===`);
  console.log('Next: npm run aggregate');
  db.close();
}

main().catch(err => { console.error(`Fatal: ${err.message}`); process.exit(1); });
