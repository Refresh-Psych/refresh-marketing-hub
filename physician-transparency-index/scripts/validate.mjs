#!/usr/bin/env node
// ============================================================================
// Data Quality Validation — Flags issues in the payments database
// Usage: node scripts/validate.mjs [--db data/db/payments.sqlite]
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

  if (!existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    process.exit(1);
  }

  const SQL = await initSqlJs();
  const buffer = readFileSync(dbPath);
  const db = new SQL.Database(buffer);

  console.log('=== Data Quality Validation Report ===\n');

  const issues = {};

  // 1. Missing NPI
  const missingNPI = db.exec(`
    SELECT COUNT(*) as cnt FROM payments
    WHERE physician_npi IS NULL OR physician_npi = ''
  `);
  const npiCount = missingNPI[0].values[0][0];
  issues.missingNPI = {
    count: npiCount,
    severity: npiCount > 1000 ? 'high' : 'medium',
    description: 'Records without NPI — cannot be reliably deduplicated or linked to physician profiles',
  };
  console.log(`1. Missing NPI: ${npiCount.toLocaleString()} records`);

  // 2. Missing specialty
  const missingSpec = db.exec(`
    SELECT COUNT(*) FROM payments
    WHERE specialty IS NULL OR specialty = ''
  `);
  const specCount = missingSpec[0].values[0][0];
  issues.missingSpecialty = {
    count: specCount,
    severity: specCount > 5000 ? 'high' : 'low',
    description: 'Records without specialty designation',
  };
  console.log(`2. Missing specialty: ${specCount.toLocaleString()} records`);

  // 3. Extreme outliers (single payments > $1M)
  const outliers = db.exec(`
    SELECT physician_first, physician_last, physician_npi, state,
           payment_amount, payment_year, company_name, payment_type
    FROM payments
    WHERE payment_amount > 1000000
    ORDER BY payment_amount DESC
    LIMIT 20
  `);
  const outlierRows = outliers.length > 0 ? outliers[0].values : [];
  issues.extremeOutliers = {
    count: outlierRows.length,
    severity: 'info',
    description: 'Single payments exceeding $1,000,000 — legitimate but worth reviewing',
    samples: outlierRows.map(r => ({
      name: `${r[0]} ${r[1]}`,
      npi: r[2],
      state: r[3],
      amount: r[4],
      year: r[5],
      company: r[6],
      type: r[7],
    })),
  };
  console.log(`3. Extreme outliers (>$1M): ${outlierRows.length} records`);

  // 4. Negative payments (reversals)
  const negatives = db.exec(`
    SELECT COUNT(*), ROUND(SUM(payment_amount), 2)
    FROM payments WHERE payment_amount < 0
  `);
  const negCount = negatives[0].values[0][0];
  const negTotal = negatives[0].values[0][1] || 0;
  issues.negativePayments = {
    count: negCount,
    totalAmount: negTotal,
    severity: 'info',
    description: 'Payment reversals recorded as negative amounts',
  };
  console.log(`4. Negative payments: ${negCount.toLocaleString()} (total: $${negTotal.toLocaleString()})`);

  // 5. Zero-dollar payments
  const zeroes = db.exec(`
    SELECT COUNT(*) FROM payments WHERE payment_amount = 0
  `);
  const zeroCount = zeroes[0].values[0][0];
  issues.zeroPayments = {
    count: zeroCount,
    severity: 'low',
    description: 'Records with $0 payment amount — often food/beverage or travel',
  };
  console.log(`5. Zero-dollar payments: ${zeroCount.toLocaleString()}`);

  // 6. Missing location data
  const missingLocation = db.exec(`
    SELECT COUNT(*) FROM payments
    WHERE (state IS NULL OR state = '') AND (city IS NULL OR city = '')
  `);
  const locCount = missingLocation[0].values[0][0];
  issues.missingLocation = {
    count: locCount,
    severity: locCount > 1000 ? 'medium' : 'low',
    description: 'Records with no state or city information',
  };
  console.log(`6. Missing location: ${locCount.toLocaleString()} records`);

  // 7. Missing company info
  const missingCompany = db.exec(`
    SELECT COUNT(*) FROM payments
    WHERE company_name IS NULL OR company_name = ''
  `);
  const compCount = missingCompany[0].values[0][0];
  issues.missingCompany = {
    count: compCount,
    severity: compCount > 1000 ? 'medium' : 'low',
    description: 'Records without company/manufacturer name',
  };
  console.log(`7. Missing company: ${compCount.toLocaleString()} records`);

  // 8. Duplicate record IDs
  const dupes = db.exec(`
    SELECT COUNT(*) FROM (
      SELECT record_id FROM payments
      WHERE record_id IS NOT NULL AND record_id != ''
      GROUP BY record_id HAVING COUNT(*) > 1
    )
  `);
  const dupeCount = dupes[0].values[0][0];
  issues.duplicateRecords = {
    count: dupeCount,
    severity: dupeCount > 100 ? 'high' : 'low',
    description: 'Records sharing the same CMS record ID — possible re-published corrections',
  };
  console.log(`8. Duplicate record IDs: ${dupeCount.toLocaleString()}`);

  // 9. NPI with inconsistent names
  const nameConflicts = db.exec(`
    SELECT COUNT(*) FROM (
      SELECT physician_npi,
             COUNT(DISTINCT physician_last) as name_variants
      FROM payments
      WHERE physician_npi != '' AND physician_last != ''
      GROUP BY physician_npi
      HAVING name_variants > 1
    )
  `);
  const nameCount = nameConflicts[0].values[0][0];
  issues.inconsistentNames = {
    count: nameCount,
    severity: nameCount > 100 ? 'medium' : 'low',
    description: 'Same NPI mapped to different last names across records',
  };
  console.log(`9. Inconsistent names (same NPI): ${nameCount.toLocaleString()}`);

  // 10. NPI with inconsistent specialties
  const specConflicts = db.exec(`
    SELECT COUNT(*) FROM (
      SELECT physician_npi,
             COUNT(DISTINCT specialty) as spec_variants
      FROM payments
      WHERE physician_npi != '' AND specialty != ''
      GROUP BY physician_npi
      HAVING spec_variants > 1
    )
  `);
  const specConflictCount = specConflicts[0].values[0][0];
  issues.inconsistentSpecialties = {
    count: specConflictCount,
    severity: 'info',
    description: 'Same NPI mapped to different specialties — may indicate multi-specialty providers',
  };
  console.log(`10. Inconsistent specialties (same NPI): ${specConflictCount.toLocaleString()}`);

  // Overall summary
  const totalRecords = db.exec('SELECT COUNT(*) FROM payments')[0].values[0][0];
  const totalAmount = db.exec('SELECT ROUND(SUM(payment_amount), 2) FROM payments')[0].values[0][0];

  const report = {
    generatedAt: new Date().toISOString(),
    databaseStats: {
      totalRecords,
      totalAmount,
      totalPhysicians: db.exec('SELECT COUNT(DISTINCT physician_npi) FROM payments WHERE physician_npi != ""')[0].values[0][0],
      totalCompanies: db.exec('SELECT COUNT(DISTINCT company_name) FROM payments WHERE company_name != ""')[0].values[0][0],
      yearRange: db.exec('SELECT MIN(payment_year), MAX(payment_year) FROM payments')[0].values[0],
    },
    issues,
  };

  // Write report
  const reportPath = path.join(__dirname, '..', 'data', 'data_quality_report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved: ${reportPath}`);

  db.close();
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
