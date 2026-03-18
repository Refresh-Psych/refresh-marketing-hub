#!/usr/bin/env node
// ============================================================================
// Export full physician records as clean JSON (requested output format)
// Outputs: physicianName, specialty, state, city, totalPayments,
//          paymentsByType, companies[], paymentYear, notes
// Usage: node scripts/export-json.mjs [--db data/db/payments.sqlite] [--limit 1000]
// ============================================================================

import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB = path.join(__dirname, '..', 'data', 'db', 'payments.sqlite');

async function main() {
  const args = process.argv.slice(2);
  const dbPath = args.find((_, i) => args[i - 1] === '--db') || DEFAULT_DB;
  const limit = parseInt(args.find((_, i) => args[i - 1] === '--limit') || '0');

  if (!existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    process.exit(1);
  }

  const SQL = await initSqlJs();
  const buffer = readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  console.log('=== Exporting Physician JSON (requested schema) ===\n');

  // Check if physician_profiles table exists
  const tableCheck = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='physician_profiles'");
  if (tableCheck.length === 0 || tableCheck[0].values.length === 0) {
    console.error('physician_profiles table not found. Run "npm run aggregate" first.');
    process.exit(1);
  }

  const limitClause = limit > 0 ? `LIMIT ${limit}` : '';
  const result = db.exec(`
    SELECT physician_npi, physician_first, physician_last, specialty,
           state, city, general_total, research_total, ownership_total,
           grand_total, total_records, years_active, company_count,
           first_year, last_year, companies
    FROM physician_profiles
    ORDER BY grand_total DESC
    ${limitClause}
  `);

  if (result.length === 0) {
    console.log('No physician profiles found.');
    process.exit(0);
  }

  const { columns, values } = result[0];
  const physicians = values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });

    const companies = (obj.companies || '').split(',').filter(Boolean).map(c => c.trim());

    return {
      physicianName: `${(obj.physician_first || '').trim()} ${(obj.physician_last || '').trim()}`.trim(),
      specialty: obj.specialty || '',
      state: obj.state || '',
      city: obj.city || '',
      totalPayments: Number((obj.grand_total || 0).toFixed(2)),
      paymentsByType: {
        general: Number((obj.general_total || 0).toFixed(2)),
        research: Number((obj.research_total || 0).toFixed(2)),
        ownership: Number((obj.ownership_total || 0).toFixed(2)),
      },
      companies: companies.slice(0, 20),
      paymentYear: `${obj.first_year || ''}-${obj.last_year || ''}`,
      notes: `${obj.total_records} payment records across ${obj.years_active} years. ${obj.company_count} companies.`,
    };
  });

  // Write output
  const outputPath = path.join(__dirname, '..', 'data', 'physician-transparency-index.json');
  writeFileSync(outputPath, JSON.stringify(physicians, null, 2));

  console.log(`Exported ${physicians.length.toLocaleString()} physicians`);
  console.log(`Output: ${outputPath}`);
  console.log(`Size: ${(JSON.stringify(physicians).length / 1024 / 1024).toFixed(1)} MB`);

  // Sample first record
  console.log('\nSample record:');
  console.log(JSON.stringify(physicians[0], null, 2));

  db.close();
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
