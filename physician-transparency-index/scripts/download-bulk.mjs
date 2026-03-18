#!/usr/bin/env node
// ============================================================================
// CMS Open Payments Bulk CSV Downloader
// Downloads General, Research, and Ownership payment CSVs for 2013-2024
// Usage: node scripts/download-bulk.mjs [--years 2021,2022,2023,2024] [--types general,research,ownership]
// ============================================================================

import { createWriteStream, existsSync, mkdirSync, statSync } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DIR = path.join(__dirname, '..', 'data', 'raw');

// CMS Open Payments bulk download URLs by year
// Format changes: 2013-2015 used older naming, 2016+ use current naming
// The publication date suffix changes each year (e.g., P01302025 = Jan 30, 2025 publication)
const DOWNLOAD_CATALOG = {
  2024: {
    publication: 'P01302025',
    general:   'https://download.cms.gov/openpayments/PGYR2024_P01302025.ZIP',
    research:  'https://download.cms.gov/openpayments/PGYR2024_P01302025_RSRCH.ZIP',
    ownership: 'https://download.cms.gov/openpayments/PGYR2024_P01302025_OWNRSHP.ZIP',
  },
  2023: {
    publication: 'P01302025',
    general:   'https://download.cms.gov/openpayments/PGYR2023_P01302025.ZIP',
    research:  'https://download.cms.gov/openpayments/PGYR2023_P01302025_RSRCH.ZIP',
    ownership: 'https://download.cms.gov/openpayments/PGYR2023_P01302025_OWNRSHP.ZIP',
  },
  2022: {
    publication: 'P01302025',
    general:   'https://download.cms.gov/openpayments/PGYR2022_P01302025.ZIP',
    research:  'https://download.cms.gov/openpayments/PGYR2022_P01302025_RSRCH.ZIP',
    ownership: 'https://download.cms.gov/openpayments/PGYR2022_P01302025_OWNRSHP.ZIP',
  },
  2021: {
    publication: 'P01302025',
    general:   'https://download.cms.gov/openpayments/PGYR2021_P01302025.ZIP',
    research:  'https://download.cms.gov/openpayments/PGYR2021_P01302025_RSRCH.ZIP',
    ownership: 'https://download.cms.gov/openpayments/PGYR2021_P01302025_OWNRSHP.ZIP',
  },
  2020: {
    publication: 'P01302025',
    general:   'https://download.cms.gov/openpayments/PGYR2020_P01302025.ZIP',
    research:  'https://download.cms.gov/openpayments/PGYR2020_P01302025_RSRCH.ZIP',
    ownership: 'https://download.cms.gov/openpayments/PGYR2020_P01302025_OWNRSHP.ZIP',
  },
  2019: {
    publication: 'P01302025',
    general:   'https://download.cms.gov/openpayments/PGYR2019_P01302025.ZIP',
    research:  'https://download.cms.gov/openpayments/PGYR2019_P01302025_RSRCH.ZIP',
    ownership: 'https://download.cms.gov/openpayments/PGYR2019_P01302025_OWNRSHP.ZIP',
  },
  2018: {
    publication: 'P01302025',
    general:   'https://download.cms.gov/openpayments/PGYR2018_P01302025.ZIP',
    research:  'https://download.cms.gov/openpayments/PGYR2018_P01302025_RSRCH.ZIP',
    ownership: 'https://download.cms.gov/openpayments/PGYR2018_P01302025_OWNRSHP.ZIP',
  },
  2017: {
    publication: 'P01302025',
    general:   'https://download.cms.gov/openpayments/PGYR2017_P01302025.ZIP',
    research:  'https://download.cms.gov/openpayments/PGYR2017_P01302025_RSRCH.ZIP',
    ownership: 'https://download.cms.gov/openpayments/PGYR2017_P01302025_OWNRSHP.ZIP',
  },
  2016: {
    publication: 'P01302025',
    general:   'https://download.cms.gov/openpayments/PGYR2016_P01302025.ZIP',
    research:  'https://download.cms.gov/openpayments/PGYR2016_P01302025_RSRCH.ZIP',
    ownership: 'https://download.cms.gov/openpayments/PGYR2016_P01302025_OWNRSHP.ZIP',
  },
  2015: {
    publication: 'P01302025',
    general:   'https://download.cms.gov/openpayments/PGYR2015_P01302025.ZIP',
    research:  'https://download.cms.gov/openpayments/PGYR2015_P01302025_RSRCH.ZIP',
    ownership: 'https://download.cms.gov/openpayments/PGYR2015_P01302025_OWNRSHP.ZIP',
  },
  2014: {
    publication: 'P01302025',
    general:   'https://download.cms.gov/openpayments/PGYR2014_P01302025.ZIP',
    research:  'https://download.cms.gov/openpayments/PGYR2014_P01302025_RSRCH.ZIP',
    ownership: 'https://download.cms.gov/openpayments/PGYR2014_P01302025_OWNRSHP.ZIP',
  },
  2013: {
    publication: 'P01302025',
    general:   'https://download.cms.gov/openpayments/PGYR2013_P01302025.ZIP',
    research:  'https://download.cms.gov/openpayments/PGYR2013_P01302025_RSRCH.ZIP',
    ownership: 'https://download.cms.gov/openpayments/PGYR2013_P01302025_OWNRSHP.ZIP',
  },
};

// CMS API dataset UUIDs (for incremental/targeted queries — not used in bulk download)
export const DATASET_UUIDS = {
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

function parseArgs() {
  const args = process.argv.slice(2);
  let years = Object.keys(DOWNLOAD_CATALOG).map(Number);
  let types = ['general', 'research', 'ownership'];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--years' && args[i + 1]) {
      years = args[++i].split(',').map(Number);
    } else if (args[i] === '--types' && args[i + 1]) {
      types = args[++i].split(',');
    }
  }
  return { years, types };
}

async function downloadFile(url, destPath) {
  // Skip if already downloaded
  if (existsSync(destPath)) {
    const size = statSync(destPath).size;
    if (size > 1000) {
      console.log(`  SKIP (exists, ${(size / 1024 / 1024).toFixed(1)} MB): ${path.basename(destPath)}`);
      return true;
    }
  }

  console.log(`  Downloading: ${url}`);
  console.log(`  Destination: ${path.basename(destPath)}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`  ERROR: HTTP ${response.status} for ${url}`);
      return false;
    }

    const totalBytes = parseInt(response.headers.get('content-length') || '0');
    const writer = createWriteStream(destPath);
    let downloadedBytes = 0;
    const startTime = Date.now();

    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      writer.write(Buffer.from(value));
      downloadedBytes += value.length;

      // Progress every 10MB
      if (downloadedBytes % (10 * 1024 * 1024) < value.length) {
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = (downloadedBytes / 1024 / 1024 / elapsed).toFixed(1);
        const pct = totalBytes > 0 ? ((downloadedBytes / totalBytes) * 100).toFixed(1) : '?';
        process.stderr.write(`  Progress: ${(downloadedBytes / 1024 / 1024).toFixed(0)} MB (${pct}%) @ ${speed} MB/s\r`);
      }
    }

    writer.end();
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const finalSize = (downloadedBytes / 1024 / 1024).toFixed(1);
    console.log(`  DONE: ${finalSize} MB downloaded`);
    return true;
  } catch (err) {
    console.error(`  ERROR downloading ${url}: ${err.message}`);
    return false;
  }
}

async function main() {
  const { years, types } = parseArgs();

  console.log('=== CMS Open Payments Bulk CSV Downloader ===');
  console.log(`Years: ${years.join(', ')}`);
  console.log(`Types: ${types.join(', ')}`);
  console.log(`Output: ${RAW_DIR}\n`);

  if (!existsSync(RAW_DIR)) {
    mkdirSync(RAW_DIR, { recursive: true });
  }

  const results = { success: 0, failed: 0, skipped: 0 };

  for (const year of years.sort()) {
    const catalog = DOWNLOAD_CATALOG[year];
    if (!catalog) {
      console.log(`\nWARN: No download URLs for year ${year}, skipping`);
      continue;
    }

    console.log(`\n=== ${year} ===`);

    for (const type of types) {
      const url = catalog[type];
      if (!url) {
        console.log(`  No ${type} dataset URL for ${year}`);
        continue;
      }

      const filename = `PGYR${year}_${type.toUpperCase()}.ZIP`;
      const destPath = path.join(RAW_DIR, filename);

      const ok = await downloadFile(url, destPath);
      if (ok) results.success++; else results.failed++;

      // Delay between downloads
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log('\n=== Download Summary ===');
  console.log(`Success: ${results.success}`);
  console.log(`Failed:  ${results.failed}`);
  console.log(`\nNext step: Unzip CSVs and run: npm run import`);
  console.log('Unzip command: for f in data/raw/*.ZIP; do unzip -o "$f" -d data/raw/; done');
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
