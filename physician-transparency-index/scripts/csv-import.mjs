#!/usr/bin/env node
// ============================================================================
// CMS Open Payments CSV → SQLite Bulk Import
// Uses better-sqlite3 for high-performance on-disk import
// Handles multi-GB CSV files with streaming parser
// Usage: node scripts/csv-import.mjs [--dir data/raw] [--fresh]
// ============================================================================

import { createReadStream, existsSync, readdirSync, unlinkSync, mkdirSync } from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(PROJECT_ROOT, 'data', 'db', 'payments.sqlite');
const DEFAULT_RAW = path.join(PROJECT_ROOT, 'data', 'raw');

// Publication suffix for current CMS downloads
const PUB = 'P01232026_01102026';

function getCsvUrl(year, type) {
  const prefix = type === 'general' ? 'GNRL' : type === 'research' ? 'RSRCH' : 'OWNRSHP';
  return `https://download.cms.gov/openpayments/PGYR${year}_${PUB}/OP_DTL_${prefix}_PGYR${year}_${PUB}.csv`;
}

function getCsvFilename(year, type) {
  return `OP_DTL_${type.toUpperCase()}_PGYR${year}.csv`;
}

// Column resolution (handles CMS header changes across years)
const COLUMN_CANDIDATES = {
  firstName: ['Covered_Recipient_First_Name', 'Covered_Recipient_Profile_First_Name', 'Physician_First_Name'],
  lastName: ['Covered_Recipient_Last_Name', 'Covered_Recipient_Profile_Last_Name', 'Physician_Last_Name'],
  npi: ['Covered_Recipient_NPI', 'Covered_Recipient_Profile_NPI', 'Physician_NPI'],
  specialty: ['Covered_Recipient_Specialty_1', 'Covered_Recipient_Profile_Specialty', 'Physician_Specialty'],
  state: ['Recipient_State', 'Covered_Recipient_Profile_State', 'Physician_State'],
  city: ['Recipient_City', 'Covered_Recipient_Profile_City', 'Physician_City'],
  zip: ['Recipient_Zip_Code', 'Covered_Recipient_Profile_Zipcode'],
  paymentAmount: ['Total_Amount_of_Payment_USDollars'],
  paymentDate: ['Date_of_Payment'],
  natureOfPayment: ['Nature_of_Payment_or_Transfer_of_Value'],
  companyName: ['Applicable_Manufacturer_or_Applicable_GPO_Making_Payment_Name', 'Submitting_Applicable_Manufacturer_or_Applicable_GPO_Name'],
  companyId: ['Applicable_Manufacturer_or_Applicable_GPO_Making_Payment_ID'],
  drug1: ['Name_of_Drug_or_Biological_or_Device_or_Medical_Supply_1'],
  drug2: ['Name_of_Drug_or_Biological_or_Device_or_Medical_Supply_2'],
  drug3: ['Name_of_Drug_or_Biological_or_Device_or_Medical_Supply_3'],
  formOfPayment: ['Form_of_Payment_or_Transfer_of_Value'],
  recordId: ['Record_ID'],
  programYear: ['Program_Year'],
};

function buildFieldMap(headers) {
  const map = {};
  for (const [canonical, candidates] of Object.entries(COLUMN_CANDIDATES)) {
    for (const c of candidates) {
      if (headers.includes(c)) { map[canonical] = c; break; }
      // Try case-insensitive
      const lower = headers.find(h => h.toLowerCase() === c.toLowerCase());
      if (lower) { map[canonical] = lower; break; }
    }
    if (!map[canonical]) map[canonical] = null;
  }
  return map;
}

function detectType(filename) {
  const upper = filename.toUpperCase();
  if (upper.includes('RSRCH') || upper.includes('RESEARCH')) return 'research';
  if (upper.includes('OWNRSHP') || upper.includes('OWNERSHIP')) return 'ownership';
  return 'general';
}

function detectYear(filename) {
  const match = filename.match(/PGYR(\d{4})/i) || filename.match(/(\d{4})/);
  return match ? parseInt(match[1]) : null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let rawDir = DEFAULT_RAW;
  let fresh = false;
  let download = false;
  let years = null;
  let types = ['general', 'research'];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir' && args[i + 1]) rawDir = args[++i];
    else if (args[i] === '--fresh') fresh = true;
    else if (args[i] === '--download') download = true;
    else if (args[i] === '--years' && args[i + 1]) years = args[++i].split(',').map(Number);
    else if (args[i] === '--types' && args[i + 1]) types = args[++i].split(',');
  }
  return { rawDir, fresh, download, years, types };
}

async function downloadCsv(url, destPath) {
  if (existsSync(destPath)) {
    const { statSync } = await import('fs');
    const size = statSync(destPath).size;
    if (size > 10000) {
      console.log(`  SKIP (exists, ${(size / 1024 / 1024).toFixed(0)} MB)`);
      return true;
    }
  }

  console.log(`  Downloading: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`  HTTP ${response.status}`);
    return false;
  }

  const { createWriteStream: cws } = await import('fs');
  const writer = cws(destPath);
  const reader = response.body.getReader();
  let bytes = 0;
  const start = Date.now();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    writer.write(Buffer.from(value));
    bytes += value.length;
    if (bytes % (50 * 1024 * 1024) < value.length) {
      const speed = (bytes / 1024 / 1024 / ((Date.now() - start) / 1000)).toFixed(1);
      process.stderr.write(`  ${(bytes / 1024 / 1024).toFixed(0)} MB @ ${speed} MB/s\r`);
    }
  }

  writer.end();
  await new Promise((res, rej) => { writer.on('finish', res); writer.on('error', rej); });
  console.log(`  Downloaded: ${(bytes / 1024 / 1024).toFixed(0)} MB`);
  return true;
}

async function importCsv(db, csvPath, paymentType, year) {
  return new Promise((resolve, reject) => {
    const insertStmt = db.prepare(`
      INSERT INTO payments (physician_first, physician_last, physician_npi, specialty,
        state, city, zip, payment_amount, payment_date, payment_year, payment_type,
        nature_of_payment, company_name, company_id, drug_or_device_1, drug_or_device_2,
        drug_or_device_3, form_of_payment, record_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertBatch = db.transaction((rows) => {
      for (const row of rows) insertStmt.run(...row);
    });

    let fieldMap = null;
    let count = 0;
    let batch = [];
    const BATCH_SIZE = 10000;
    const startTime = Date.now();

    const parser = createReadStream(csvPath).pipe(parse({
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
      bom: true,
    }));

    parser.on('data', (row) => {
      if (!fieldMap) {
        const headers = Object.keys(row);
        fieldMap = buildFieldMap(headers);
        console.log(`  Mapped: NPI=${fieldMap.npi || 'MISS'} Company=${fieldMap.companyName || 'MISS'} Date=${fieldMap.paymentDate || 'MISS'}`);
      }

      const get = (field) => {
        const col = fieldMap[field];
        return col ? (row[col] || '').trim() : '';
      };

      const npi = get('npi');
      if (!npi) return; // Skip non-physician records

      batch.push([
        get('firstName'), get('lastName'), npi, get('specialty'),
        get('state'), get('city'), get('zip'),
        parseFloat(get('paymentAmount') || '0') || 0,
        get('paymentDate'),
        parseInt(get('programYear')) || year,
        paymentType,
        get('natureOfPayment'), get('companyName'), get('companyId'),
        get('drug1'), get('drug2'), get('drug3'),
        get('formOfPayment'), get('recordId'),
      ]);

      if (batch.length >= BATCH_SIZE) {
        insertBatch(batch);
        count += batch.length;
        batch = [];
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const rate = Math.round(count / ((Date.now() - startTime) / 1000));
        process.stderr.write(`  ${count.toLocaleString()} rows (${elapsed}s, ${rate}/s)   \r`);
      }
    });

    parser.on('end', () => {
      if (batch.length > 0) {
        insertBatch(batch);
        count += batch.length;
      }
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`\n  Imported ${count.toLocaleString()} rows in ${elapsed}s`);
      resolve(count);
    });

    parser.on('error', reject);
  });
}

async function main() {
  const { rawDir, fresh, download, years, types } = parseArgs();

  console.log('=== CMS Open Payments CSV → SQLite Import ===');
  console.log(`Raw dir: ${rawDir}`);
  console.log(`Database: ${DB_PATH}\n`);

  // Ensure directories
  if (!existsSync(rawDir)) mkdirSync(rawDir, { recursive: true });
  const dbDir = path.dirname(DB_PATH);
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

  // Optionally download CSVs first
  if (download) {
    const dlYears = years || [2018, 2019, 2020, 2021, 2022, 2023, 2024];
    console.log(`Downloading CSVs for years: ${dlYears.join(', ')}\n`);

    for (const year of dlYears) {
      for (const type of types) {
        const url = getCsvUrl(year, type);
        const dest = path.join(rawDir, getCsvFilename(year, type));
        console.log(`${year} ${type}:`);
        try {
          await downloadCsv(url, dest);
        } catch (err) {
          console.error(`  ERROR: ${err.message}`);
        }
      }
    }
    console.log('\nDownloads complete. Now importing...\n');
  }

  // Initialize DB
  if (fresh && existsSync(DB_PATH)) { unlinkSync(DB_PATH); console.log('Fresh database'); }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = -128000'); // 128MB cache

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

  // Find CSV files
  const csvFiles = readdirSync(rawDir)
    .filter(f => f.toLowerCase().endsWith('.csv'))
    .sort();

  if (csvFiles.length === 0) {
    console.log('No CSV files found. Use --download to fetch them first.');
    db.close();
    process.exit(1);
  }

  console.log(`Found ${csvFiles.length} CSV files\n`);

  let grandTotal = 0;

  for (const file of csvFiles) {
    const fullPath = path.join(rawDir, file);
    const type = detectType(file);
    const year = detectYear(file);

    if (!year) { console.log(`SKIP: ${file} — can't detect year`); continue; }
    if (years && !years.includes(year)) { console.log(`SKIP: ${file} — year ${year} not requested`); continue; }

    // Check if already imported
    const existing = db.prepare(
      'SELECT COUNT(*) as cnt FROM payments WHERE payment_year = ? AND payment_type = ?'
    ).get(year, type).cnt;

    if (existing > 0) {
      console.log(`SKIP: ${file} — ${existing.toLocaleString()} records already in DB`);
      continue;
    }

    console.log(`\n=== ${file} (${type}, ${year}) ===`);
    const count = await importCsv(db, fullPath, type, year);
    grandTotal += count;
  }

  // Create indexes (after bulk insert for speed)
  console.log('\nCreating indexes...');
  for (const idx of [
    'CREATE INDEX IF NOT EXISTS idx_npi ON payments(physician_npi)',
    'CREATE INDEX IF NOT EXISTS idx_specialty ON payments(specialty)',
    'CREATE INDEX IF NOT EXISTS idx_state ON payments(state)',
    'CREATE INDEX IF NOT EXISTS idx_year ON payments(payment_year)',
    'CREATE INDEX IF NOT EXISTS idx_company ON payments(company_name)',
    'CREATE INDEX IF NOT EXISTS idx_type ON payments(payment_type)',
    'CREATE INDEX IF NOT EXISTS idx_record ON payments(record_id)',
  ]) db.exec(idx);

  const totalRows = db.prepare('SELECT COUNT(*) as cnt FROM payments').get().cnt;
  const totalNPIs = db.prepare("SELECT COUNT(DISTINCT physician_npi) as cnt FROM payments WHERE physician_npi != ''").get().cnt;

  console.log(`\n=== Import Complete ===`);
  console.log(`New: ${grandTotal.toLocaleString()}`);
  console.log(`Total: ${totalRows.toLocaleString()} records, ${totalNPIs.toLocaleString()} physicians`);
  console.log('\nNext: npm run aggregate');

  db.close();
}

main().catch(err => { console.error(`Fatal: ${err.message}`); process.exit(1); });
