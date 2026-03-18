#!/usr/bin/env node
// ============================================================================
// CMS Open Payments CSV → SQLite Import Pipeline
// Handles field normalization across 2013-2024 CSV format changes
// Usage: node scripts/import-csv.mjs [--dir data/raw] [--db data/db/payments.sqlite]
//        node scripts/import-csv.mjs --existing-csv  (import from existing project CSVs)
// ============================================================================

import { createReadStream, existsSync, readdirSync, readFileSync } from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const PARENT_DIR = path.join(PROJECT_ROOT, '..');
const DEFAULT_RAW = path.join(PROJECT_ROOT, 'data', 'raw');
const DEFAULT_DB = path.join(PROJECT_ROOT, 'data', 'db', 'payments.sqlite');

// ============================================================================
// Column name mapping — CMS changed headers across years
// Maps canonical field names to possible CSV column headers
// ============================================================================
const COLUMN_MAPS = {
  // 2016+ column names (current format)
  modern: {
    firstName:       ['Covered_Recipient_First_Name', 'covered_recipient_first_name',
                      'Covered_Recipient_Profile_First_Name'],
    lastName:        ['Covered_Recipient_Last_Name', 'covered_recipient_last_name',
                      'Covered_Recipient_Profile_Last_Name'],
    npi:             ['Covered_Recipient_NPI', 'covered_recipient_npi',
                      'Covered_Recipient_Profile_NPI'],
    specialty:       ['Covered_Recipient_Specialty_1', 'covered_recipient_specialty_1',
                      'Covered_Recipient_Profile_Specialty'],
    state:           ['Recipient_State', 'recipient_state',
                      'Covered_Recipient_Profile_State'],
    city:            ['Recipient_City', 'recipient_city',
                      'Covered_Recipient_Profile_City'],
    zip:             ['Recipient_Zip_Code', 'recipient_zip_code',
                      'Covered_Recipient_Profile_Zipcode'],
    paymentAmount:   ['Total_Amount_of_Payment_USDollars', 'total_amount_of_payment_usdollars',
                      'General_Total_Payment', 'Research_Total_Payment'],
    paymentDate:     ['Date_of_Payment', 'date_of_payment'],
    natureOfPayment: ['Nature_of_Payment_or_Transfer_of_Value',
                      'nature_of_payment_or_transfer_of_value'],
    companyName:     ['Applicable_Manufacturer_or_Applicable_GPO_Making_Payment_Name',
                      'applicable_manufacturer_or_applicable_gpo_making_payment_name',
                      'Submitting_Applicable_Manufacturer_or_Applicable_GPO_Name'],
    companyId:       ['Applicable_Manufacturer_or_Applicable_GPO_Making_Payment_ID',
                      'applicable_manufacturer_or_applicable_gpo_making_payment_id'],
    drug1:           ['Name_of_Drug_or_Biological_or_Device_or_Medical_Supply_1',
                      'name_of_drug_or_biological_or_device_or_medical_supply_1'],
    drug2:           ['Name_of_Drug_or_Biological_or_Device_or_Medical_Supply_2',
                      'name_of_drug_or_biological_or_device_or_medical_supply_2'],
    drug3:           ['Name_of_Drug_or_Biological_or_Device_or_Medical_Supply_3',
                      'name_of_drug_or_biological_or_device_or_medical_supply_3'],
    formOfPayment:   ['Form_of_Payment_or_Transfer_of_Value',
                      'form_of_payment_or_transfer_of_value'],
    recordId:        ['Record_ID', 'record_id'],
    programYear:     ['Program_Year', 'program_year'],
  },
  // 2013-2015 column names (legacy format)
  legacy: {
    firstName:       ['Physician_First_Name', 'physician_first_name'],
    lastName:        ['Physician_Last_Name', 'physician_last_name'],
    npi:             ['Physician_NPI', 'physician_npi'],
    specialty:       ['Physician_Specialty', 'physician_specialty'],
    state:           ['Recipient_State', 'recipient_state',
                      'Physician_State', 'physician_state'],
    city:            ['Recipient_City', 'recipient_city',
                      'Physician_City', 'physician_city'],
    zip:             ['Recipient_Zip_Code', 'recipient_zip_code'],
    paymentAmount:   ['Total_Amount_of_Payment_USDollars', 'total_amount_of_payment_usdollars'],
    paymentDate:     ['Date_of_Payment', 'date_of_payment'],
    natureOfPayment: ['Nature_of_Payment_or_Transfer_of_Value',
                      'nature_of_payment_or_transfer_of_value'],
    companyName:     ['Applicable_Manufacturer_or_Applicable_GPO_Making_Payment_Name',
                      'applicable_manufacturer_or_applicable_gpo_making_payment_name'],
    companyId:       ['Applicable_Manufacturer_or_Applicable_GPO_Making_Payment_ID',
                      'applicable_manufacturer_or_applicable_gpo_making_payment_id'],
    drug1:           ['Name_of_Drug_or_Biological_or_Device_or_Medical_Supply_1',
                      'name_of_drug_or_biological_or_device_or_medical_supply_1'],
    drug2:           ['Name_of_Drug_or_Biological_or_Device_or_Medical_Supply_2',
                      'name_of_drug_or_biological_or_device_or_medical_supply_2'],
    drug3:           ['Name_of_Drug_or_Biological_or_Device_or_Medical_Supply_3',
                      'name_of_drug_or_biological_or_device_or_medical_supply_3'],
    formOfPayment:   ['Form_of_Payment_or_Transfer_of_Value',
                      'form_of_payment_or_transfer_of_value'],
    recordId:        ['Record_ID', 'record_id'],
    programYear:     ['Program_Year', 'program_year'],
  },
};

function resolveColumn(headers, candidates) {
  for (const candidate of candidates) {
    if (headers.includes(candidate)) return candidate;
  }
  return null;
}

function buildFieldMap(headers, year) {
  const maps = year < 2016 ? COLUMN_MAPS.legacy : COLUMN_MAPS.modern;
  const allCandidates = { ...COLUMN_MAPS.modern, ...COLUMN_MAPS.legacy };
  const fieldMap = {};

  for (const [canonical, candidates] of Object.entries(maps)) {
    fieldMap[canonical] = resolveColumn(headers, candidates);
  }

  // Fallback: try all known column names if primary mapping failed
  for (const [canonical, col] of Object.entries(fieldMap)) {
    if (!col && allCandidates[canonical]) {
      fieldMap[canonical] = resolveColumn(headers, allCandidates[canonical]);
    }
  }

  return fieldMap;
}

function detectPaymentType(filename) {
  const upper = filename.toUpperCase();
  if (upper.includes('RSRCH') || upper.includes('RESEARCH')) return 'research';
  if (upper.includes('OWNRSHP') || upper.includes('OWNERSHIP')) return 'ownership';
  return 'general';
}

function detectYear(filename) {
  const match = filename.match(/PGYR(\d{4})/i) || filename.match(/(\d{4})/);
  return match ? parseInt(match[1]) : null;
}

function initDatabase(db) {
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

  db.run('CREATE INDEX IF NOT EXISTS idx_npi ON payments(physician_npi)');
  db.run('CREATE INDEX IF NOT EXISTS idx_specialty ON payments(specialty)');
  db.run('CREATE INDEX IF NOT EXISTS idx_state ON payments(state)');
  db.run('CREATE INDEX IF NOT EXISTS idx_year ON payments(payment_year)');
  db.run('CREATE INDEX IF NOT EXISTS idx_company ON payments(company_name)');
  db.run('CREATE INDEX IF NOT EXISTS idx_type ON payments(payment_type)');
  db.run('CREATE INDEX IF NOT EXISTS idx_record ON payments(record_id)');
}

async function importCSV(db, csvPath, paymentType, year) {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(csvPath, { encoding: 'utf-8' });
    let fieldMap = null;
    let rowCount = 0;
    let errorCount = 0;
    const startTime = Date.now();
    let stmt = null;
    let batchCount = 0;
    const BATCH_SIZE = 5000;

    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
      bom: true,
    });

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        // Build field map from first record's headers
        if (!fieldMap) {
          const headers = Object.keys(record);
          fieldMap = buildFieldMap(headers, year);
          console.log(`  Field mapping for ${path.basename(csvPath)}:`);
          for (const [key, col] of Object.entries(fieldMap)) {
            if (col) console.log(`    ${key} → ${col}`);
          }

          stmt = db.prepare(`
            INSERT INTO payments (
              physician_first, physician_last, physician_npi, specialty,
              state, city, zip, payment_amount, payment_date, payment_year,
              payment_type, nature_of_payment, company_name, company_id,
              drug_or_device_1, drug_or_device_2, drug_or_device_3,
              form_of_payment, record_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          db.run('BEGIN TRANSACTION');
        }

        try {
          const get = (field) => {
            const col = fieldMap[field];
            return col ? (record[col] || '').trim() : '';
          };

          const amount = parseFloat(get('paymentAmount') || '0');
          const recordYear = parseInt(get('programYear')) || year;

          stmt.run([
            get('firstName'),
            get('lastName'),
            get('npi'),
            get('specialty'),
            get('state'),
            get('city'),
            get('zip'),
            isNaN(amount) ? 0 : amount,
            get('paymentDate'),
            recordYear,
            paymentType,
            get('natureOfPayment'),
            get('companyName'),
            get('companyId'),
            get('drug1'),
            get('drug2'),
            get('drug3'),
            get('formOfPayment'),
            get('recordId'),
          ]);

          rowCount++;
          batchCount++;

          // Commit in batches
          if (batchCount >= BATCH_SIZE) {
            db.run('COMMIT');
            db.run('BEGIN TRANSACTION');
            batchCount = 0;
          }

          // Progress every 50k rows
          if (rowCount % 50000 === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const rate = Math.round(rowCount / (Date.now() - startTime) * 1000);
            process.stderr.write(`  ${rowCount.toLocaleString()} rows (${elapsed}s, ${rate}/s)\r`);
          }
        } catch (err) {
          errorCount++;
          if (errorCount <= 5) {
            console.error(`  Row error: ${err.message}`);
          }
        }
      }
    });

    parser.on('end', () => {
      if (batchCount > 0) {
        db.run('COMMIT');
      }
      if (stmt) stmt.free();

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  Imported ${rowCount.toLocaleString()} rows in ${elapsed}s (${errorCount} errors)`);
      resolve(rowCount);
    });

    parser.on('error', (err) => {
      console.error(`  Parse error: ${err.message}`);
      if (batchCount > 0) {
        try { db.run('COMMIT'); } catch (e) {}
      }
      if (stmt) stmt.free();
      reject(err);
    });

    stream.pipe(parser);
  });
}

async function importExistingCSVs(db) {
  console.log('\n=== Importing existing project CSVs ===\n');

  // Import all_psychiatrists.csv (aggregated data with General + Research totals)
  const allPsychPath = path.join(PARENT_DIR, 'all_psychiatrists.csv');
  if (existsSync(allPsychPath)) {
    console.log('Importing all_psychiatrists.csv...');
    await importAggregatedCSV(db, allPsychPath);
  }

  // Import psychiatry_speakers_2021_2024.csv
  const speakersPath = path.join(PARENT_DIR, 'psychiatry_speakers_2021_2024.csv');
  if (existsSync(speakersPath)) {
    console.log('Importing psychiatry_speakers_2021_2024.csv...');
    await importCSV(db, speakersPath, 'general', 2024);
  }
}

async function importAggregatedCSV(db, csvPath) {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(csvPath, { encoding: 'utf-8' });
    let rowCount = 0;

    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });

    const stmt = db.prepare(`
      INSERT INTO payments (
        physician_first, physician_last, physician_npi, specialty,
        state, city, payment_amount, payment_year, payment_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.run('BEGIN TRANSACTION');
    let batchCount = 0;

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        const firstName = record.Covered_Recipient_Profile_First_Name || record.covered_recipient_first_name || '';
        const lastName = record.Covered_Recipient_Profile_Last_Name || record.covered_recipient_last_name || '';
        const npi = record.Covered_Recipient_NPI || record.covered_recipient_npi || '';
        const state = record.Covered_Recipient_Profile_State || record.recipient_state || '';
        const city = record.Covered_Recipient_Profile_City || record.recipient_city || '';
        const generalTotal = parseFloat(record.General_Total_Payment || '0');
        const researchTotal = parseFloat(record.Research_Total_Payment || '0');

        // Insert general payment record
        if (generalTotal > 0) {
          stmt.run([firstName.trim(), lastName.trim(), npi.trim(),
            'Psychiatry', state.trim(), city.trim(), generalTotal, 2024, 'general']);
          rowCount++;
          batchCount++;
        }

        // Insert research payment record
        if (researchTotal > 0) {
          stmt.run([firstName.trim(), lastName.trim(), npi.trim(),
            'Psychiatry', state.trim(), city.trim(), researchTotal, 2024, 'research']);
          rowCount++;
          batchCount++;
        }

        if (batchCount >= 5000) {
          db.run('COMMIT');
          db.run('BEGIN TRANSACTION');
          batchCount = 0;
        }
      }
    });

    parser.on('end', () => {
      if (batchCount > 0) db.run('COMMIT');
      stmt.free();
      console.log(`  Imported ${rowCount.toLocaleString()} records from aggregated CSV`);
      resolve(rowCount);
    });

    parser.on('error', reject);
    stream.pipe(parser);
  });
}

async function importFromJSON(db) {
  console.log('\n=== Importing open-payments-data.json ===\n');
  const jsonPath = path.join(PARENT_DIR, 'open-payments-data.json');
  if (!existsSync(jsonPath)) {
    console.log('No open-payments-data.json found, skipping');
    return 0;
  }

  const raw = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  // This JSON has stateAverages with top earners — skip (aggregated data)
  // Focus on any raw records if present
  if (raw.physicians) {
    const stmt = db.prepare(`
      INSERT INTO payments (
        physician_first, physician_last, physician_npi, specialty,
        state, city, payment_amount, payment_year, payment_type, company_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.run('BEGIN TRANSACTION');
    let count = 0;
    for (const p of raw.physicians) {
      stmt.run([
        p.first || '', p.last || '', p.npi || '',
        'Psychiatry', p.state || '', p.city || '',
        p.totalFee || 0, 2024, 'general',
        Array.isArray(p.sponsors) ? p.sponsors.join('; ') : '',
      ]);
      count++;
    }
    db.run('COMMIT');
    stmt.free();
    console.log(`  Imported ${count} physicians from JSON`);
    return count;
  }

  console.log('  JSON structure not recognized for direct import (aggregate-only data)');
  return 0;
}

async function main() {
  const args = process.argv.slice(2);
  const useExisting = args.includes('--existing-csv');
  const rawDir = args.find((_, i) => args[i - 1] === '--dir') || DEFAULT_RAW;
  const dbPath = args.find((_, i) => args[i - 1] === '--db') || DEFAULT_DB;

  console.log('=== CMS Open Payments Import Pipeline ===');
  console.log(`Database: ${dbPath}\n`);

  // Initialize sql.js
  const SQL = await initSqlJs();
  let db;

  // Load existing DB or create new
  if (existsSync(dbPath)) {
    console.log('Loading existing database...');
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    console.log('Creating new database...');
    db = new SQL.Database();
  }

  initDatabase(db);

  let totalImported = 0;

  if (useExisting) {
    // Import from existing project CSVs
    totalImported += await importExistingCSVs(db) || 0;
    totalImported += await importFromJSON(db) || 0;
  } else {
    // Import from bulk-downloaded CSVs
    if (!existsSync(rawDir)) {
      console.error(`Raw directory not found: ${rawDir}`);
      console.log('Run "npm run download" first, or use --existing-csv to import project CSVs');
      process.exit(1);
    }

    const csvFiles = readdirSync(rawDir)
      .filter(f => f.toLowerCase().endsWith('.csv'))
      .sort();

    if (csvFiles.length === 0) {
      console.log('No CSV files found in raw directory.');
      console.log('Use --existing-csv to import from existing project CSVs instead.');
      process.exit(1);
    }

    console.log(`Found ${csvFiles.length} CSV files\n`);

    for (const file of csvFiles) {
      const fullPath = path.join(rawDir, file);
      const paymentType = detectPaymentType(file);
      const year = detectYear(file);

      console.log(`\n--- ${file} (${paymentType}, ${year || 'unknown year'}) ---`);

      if (!year) {
        console.log('  SKIP: cannot determine year');
        continue;
      }

      const count = await importCSV(db, fullPath, paymentType, year);
      totalImported += count;
    }
  }

  // Print summary
  const countResult = db.exec('SELECT COUNT(*) as cnt FROM payments');
  const totalRows = countResult[0]?.values[0]?.[0] || 0;

  const stateResult = db.exec('SELECT COUNT(DISTINCT state) FROM payments WHERE state != ""');
  const stateCount = stateResult[0]?.values[0]?.[0] || 0;

  const npiResult = db.exec('SELECT COUNT(DISTINCT physician_npi) FROM payments WHERE physician_npi != ""');
  const npiCount = npiResult[0]?.values[0]?.[0] || 0;

  console.log('\n=== Import Summary ===');
  console.log(`Total records: ${totalRows.toLocaleString()}`);
  console.log(`Unique physicians (by NPI): ${npiCount.toLocaleString()}`);
  console.log(`States: ${stateCount}`);
  console.log(`Imported this run: ${totalImported.toLocaleString()}`);

  // Save database to disk
  const data = db.export();
  const buffer = Buffer.from(data);
  const { writeFileSync, mkdirSync: mkdirSyncFS } = await import('fs');
  const dbDir = path.dirname(dbPath);
  if (!existsSync(dbDir)) mkdirSyncFS(dbDir, { recursive: true });
  writeFileSync(dbPath, buffer);
  console.log(`\nDatabase saved: ${dbPath} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);

  db.close();
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
