#!/usr/bin/env node
// ============================================================================
// CMS Open Payments — Stream Download + Import
// Downloads CSVs from CMS and streams directly into SQLite
// Usage: node scripts/download-and-import.mjs [--years 2018,2019,...] [--types general,research]
// ============================================================================

import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import { fileURLToPath } from 'url';
import { Writable } from 'stream';
import { pipeline } from 'stream/promises';
import initSqlJs from 'sql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const RAW_DIR = path.join(PROJECT_ROOT, 'data', 'raw');
const DB_PATH = path.join(PROJECT_ROOT, 'data', 'db', 'payments.sqlite');

// Current CMS publication suffix (as of Jan 2026)
const PUB = 'P01232026_01102026';

// CSV download URLs by year and type
function getCsvUrl(year, type) {
  const prefix = type === 'general' ? 'GNRL' : type === 'research' ? 'RSRCH' : 'OWNRSHP';
  return `https://download.cms.gov/openpayments/PGYR${year}_${PUB}/OP_DTL_${prefix}_PGYR${year}_${PUB}.csv`;
}

// Column name mapping — CMS changed headers across years
const COLUMN_CANDIDATES = {
  firstName: [
    'Covered_Recipient_First_Name', 'covered_recipient_first_name',
    'Covered_Recipient_Profile_First_Name', 'Physician_First_Name', 'physician_first_name',
  ],
  lastName: [
    'Covered_Recipient_Last_Name', 'covered_recipient_last_name',
    'Covered_Recipient_Profile_Last_Name', 'Physician_Last_Name', 'physician_last_name',
  ],
  npi: [
    'Covered_Recipient_NPI', 'covered_recipient_npi',
    'Covered_Recipient_Profile_NPI', 'Physician_NPI', 'physician_npi',
  ],
  specialty: [
    'Covered_Recipient_Specialty_1', 'covered_recipient_specialty_1',
    'Covered_Recipient_Profile_Specialty', 'Physician_Specialty', 'physician_specialty',
  ],
  state: [
    'Recipient_State', 'recipient_state', 'Covered_Recipient_Profile_State',
    'Physician_State', 'physician_state',
  ],
  city: [
    'Recipient_City', 'recipient_city', 'Covered_Recipient_Profile_City',
    'Physician_City', 'physician_city',
  ],
  zip: ['Recipient_Zip_Code', 'recipient_zip_code', 'Covered_Recipient_Profile_Zipcode'],
  paymentAmount: [
    'Total_Amount_of_Payment_USDollars', 'total_amount_of_payment_usdollars',
  ],
  paymentDate: ['Date_of_Payment', 'date_of_payment'],
  natureOfPayment: [
    'Nature_of_Payment_or_Transfer_of_Value', 'nature_of_payment_or_transfer_of_value',
  ],
  companyName: [
    'Applicable_Manufacturer_or_Applicable_GPO_Making_Payment_Name',
    'applicable_manufacturer_or_applicable_gpo_making_payment_name',
    'Submitting_Applicable_Manufacturer_or_Applicable_GPO_Name',
  ],
  companyId: [
    'Applicable_Manufacturer_or_Applicable_GPO_Making_Payment_ID',
    'applicable_manufacturer_or_applicable_gpo_making_payment_id',
  ],
  drug1: [
    'Name_of_Drug_or_Biological_or_Device_or_Medical_Supply_1',
    'name_of_drug_or_biological_or_device_or_medical_supply_1',
  ],
  drug2: [
    'Name_of_Drug_or_Biological_or_Device_or_Medical_Supply_2',
    'name_of_drug_or_biological_or_device_or_medical_supply_2',
  ],
  drug3: [
    'Name_of_Drug_or_Biological_or_Device_or_Medical_Supply_3',
    'name_of_drug_or_biological_or_device_or_medical_supply_3',
  ],
  formOfPayment: [
    'Form_of_Payment_or_Transfer_of_Value', 'form_of_payment_or_transfer_of_value',
  ],
  recordId: ['Record_ID', 'record_id'],
  programYear: ['Program_Year', 'program_year'],
};

function resolveColumn(headers, candidates) {
  for (const c of candidates) {
    if (headers.includes(c)) return c;
  }
  return null;
}

function buildFieldMap(headers) {
  const map = {};
  for (const [canonical, candidates] of Object.entries(COLUMN_CANDIDATES)) {
    map[canonical] = resolveColumn(headers, candidates);
  }
  return map;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let years = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
  let types = ['general', 'research'];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--years' && args[i + 1]) {
      years = args[++i].split(',').map(Number);
    } else if (args[i] === '--types' && args[i + 1]) {
      types = args[++i].split(',');
    }
  }
  return { years, types };
}

async function main() {
  const { years, types } = parseArgs();

  console.log('=== CMS Open Payments — Stream Download + Import ===');
  console.log(`Years: ${years.join(', ')}`);
  console.log(`Types: ${types.join(', ')}`);

  // Ensure directories exist
  if (!existsSync(path.dirname(DB_PATH))) {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }

  // Initialize SQLite
  const SQL = await initSqlJs();
  let db;

  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log(`Existing database loaded: ${(buffer.length / 1024 / 1024).toFixed(1)} MB`);
  } else {
    db = new SQL.Database();
    console.log('Creating new database');
  }

  // Create table
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      physician_first TEXT,
      physician_last TEXT,
      physician_npi TEXT,
      specialty TEXT,
      state TEXT,
      city TEXT,
      zip TEXT,
      payment_amount REAL,
      payment_date TEXT,
      payment_year INTEGER,
      payment_type TEXT,
      nature_of_payment TEXT,
      company_name TEXT,
      company_id TEXT,
      drug_or_device_1 TEXT,
      drug_or_device_2 TEXT,
      drug_or_device_3 TEXT,
      form_of_payment TEXT,
      record_id TEXT
    )
  `);

  // Create indexes
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_npi ON payments(physician_npi)',
    'CREATE INDEX IF NOT EXISTS idx_specialty ON payments(specialty)',
    'CREATE INDEX IF NOT EXISTS idx_state ON payments(state)',
    'CREATE INDEX IF NOT EXISTS idx_year ON payments(payment_year)',
    'CREATE INDEX IF NOT EXISTS idx_company ON payments(company_name)',
    'CREATE INDEX IF NOT EXISTS idx_type ON payments(payment_type)',
    'CREATE INDEX IF NOT EXISTS idx_record ON payments(record_id)',
  ];
  for (const idx of indexes) {
    try { db.run(idx); } catch (e) { /* ignore */ }
  }

  const insertStmt = db.prepare(`
    INSERT INTO payments (physician_first, physician_last, physician_npi, specialty,
      state, city, zip, payment_amount, payment_date, payment_year, payment_type,
      nature_of_payment, company_name, company_id, drug_or_device_1, drug_or_device_2,
      drug_or_device_3, form_of_payment, record_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalImported = 0;

  for (const year of years.sort()) {
    // Check if this year already has data
    const existing = db.exec(`SELECT COUNT(*) FROM payments WHERE payment_year = ${year}`);
    const existingCount = existing[0]?.values[0]?.[0] || 0;
    if (existingCount > 0) {
      console.log(`\n=== ${year}: Already has ${existingCount.toLocaleString()} records, skipping ===`);
      continue;
    }

    for (const type of types) {
      const url = getCsvUrl(year, type);
      console.log(`\n=== Downloading ${year} ${type} ===`);
      console.log(`URL: ${url}`);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`  ERROR: HTTP ${response.status}`);
          continue;
        }

        // Save to file first (streaming parse from network is unreliable)
        if (!existsSync(RAW_DIR)) mkdirSync(RAW_DIR, { recursive: true });
        const csvPath = path.join(RAW_DIR, `OP_DTL_${type.toUpperCase()}_PGYR${year}.csv`);

        console.log(`  Saving to: ${path.basename(csvPath)}`);
        const writer = createWriteStream(csvPath);
        const reader = response.body.getReader();
        let downloadedBytes = 0;
        const startTime = Date.now();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          writer.write(Buffer.from(value));
          downloadedBytes += value.length;

          // Progress every 50MB
          if (downloadedBytes % (50 * 1024 * 1024) < value.length) {
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = (downloadedBytes / 1024 / 1024 / elapsed).toFixed(1);
            process.stderr.write(`  Downloaded: ${(downloadedBytes / 1024 / 1024).toFixed(0)} MB @ ${speed} MB/s\r`);
          }
        }

        writer.end();
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        const sizeMB = (downloadedBytes / 1024 / 1024).toFixed(1);
        console.log(`  Downloaded: ${sizeMB} MB`);

        // Now import the CSV
        console.log(`  Importing into SQLite...`);
        let count = 0;
        let fieldMap = null;

        db.run('BEGIN TRANSACTION');

        await new Promise((resolve, reject) => {
          const parser = createReadStream(csvPath)
            .pipe(parse({
              columns: true,
              skip_empty_lines: true,
              relax_column_count: true,
              quote: '"',
              escape: '"',
              trim: true,
              bom: true,
            }));

          parser.on('data', (row) => {
            if (!fieldMap) {
              const headers = Object.keys(row);
              fieldMap = buildFieldMap(headers);
              console.log(`  Columns mapped. NPI: ${fieldMap.npi || 'MISSING'}, Amount: ${fieldMap.paymentAmount || 'MISSING'}`);
            }

            const npi = fieldMap.npi ? (row[fieldMap.npi] || '').trim() : '';
            const amount = parseFloat(fieldMap.paymentAmount ? row[fieldMap.paymentAmount] : '0') || 0;

            // Skip if no NPI (can't identify physician)
            if (!npi) return;

            const programYear = fieldMap.programYear ? parseInt(row[fieldMap.programYear]) || year : year;

            insertStmt.run([
              fieldMap.firstName ? (row[fieldMap.firstName] || '').trim() : '',
              fieldMap.lastName ? (row[fieldMap.lastName] || '').trim() : '',
              npi,
              fieldMap.specialty ? (row[fieldMap.specialty] || '').trim() : '',
              fieldMap.state ? (row[fieldMap.state] || '').trim() : '',
              fieldMap.city ? (row[fieldMap.city] || '').trim() : '',
              fieldMap.zip ? (row[fieldMap.zip] || '').trim() : '',
              amount,
              fieldMap.paymentDate ? (row[fieldMap.paymentDate] || '').trim() : '',
              programYear,
              type,
              fieldMap.natureOfPayment ? (row[fieldMap.natureOfPayment] || '').trim() : '',
              fieldMap.companyName ? (row[fieldMap.companyName] || '').trim() : '',
              fieldMap.companyId ? (row[fieldMap.companyId] || '').trim() : '',
              fieldMap.drug1 ? (row[fieldMap.drug1] || '').trim() : '',
              fieldMap.drug2 ? (row[fieldMap.drug2] || '').trim() : '',
              fieldMap.drug3 ? (row[fieldMap.drug3] || '').trim() : '',
              fieldMap.formOfPayment ? (row[fieldMap.formOfPayment] || '').trim() : '',
              fieldMap.recordId ? (row[fieldMap.recordId] || '').trim() : '',
            ]);

            count++;
            if (count % 100000 === 0) {
              process.stderr.write(`  Imported: ${count.toLocaleString()} records\r`);
            }
          });

          parser.on('end', resolve);
          parser.on('error', reject);
        });

        db.run('COMMIT');
        console.log(`  Imported: ${count.toLocaleString()} records for ${year} ${type}`);
        totalImported += count;

        // Save database after each file
        const dbBuffer = db.export();
        writeFileSync(DB_PATH, Buffer.from(dbBuffer));
        console.log(`  Database saved: ${(dbBuffer.length / 1024 / 1024).toFixed(1)} MB`);

      } catch (err) {
        console.error(`  ERROR processing ${year} ${type}: ${err.message}`);
        try { db.run('ROLLBACK'); } catch (e) { /* ignore */ }
      }
    }
  }

  // Final save
  const finalBuffer = db.export();
  writeFileSync(DB_PATH, Buffer.from(finalBuffer));

  console.log(`\n=== Import Complete ===`);
  console.log(`Total new records imported: ${totalImported.toLocaleString()}`);
  console.log(`Database size: ${(finalBuffer.length / 1024 / 1024).toFixed(1)} MB`);
  console.log(`\nNext step: npm run aggregate`);

  insertStmt.free();
  db.close();
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
