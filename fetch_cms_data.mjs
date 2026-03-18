// CMS Open Payments API - Fetch top psychiatrist speakers by state
// Uses 3-part specialty filter + speaking fee nature of payment

const DATASET_UUIDS = {
  2024: 'e6b17c6a-2534-4207-a4a1-6746a14911ff',
  2023: 'fb3a65aa-c901-4a38-a813-b04b00dfa2a9',
  2022: 'df01c2f8-dc1f-4e79-96cb-8208beaf143c',
  2021: '0380bbeb-aea1-58b6-b708-829f92a48202',
  2020: 'a08c4b30-5cf3-4948-ad40-36f404619019',
  2019: '4e54dd6c-30f8-4f86-86a7-3c109a89528e',
  2018: 'f003634c-c103-568f-876c-73017fa83be0'
};

const SPECIALTY = 'Allopathic & Osteopathic Physicians|Psychiatry & Neurology|Psychiatry';
const SPEAKING_FEE = 'Compensation for services other than consulting, including serving as faculty or as a speaker at a venue other than a continuing education program';

const ALL_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY'
];

// Parse command line - which states to fetch
const args = process.argv.slice(2);
const statesToFetch = args.length > 0 ? args[0].split(',') : ALL_STATES;
const yearsToFetch = args.length > 1 ? args[1].split(',').map(Number) : [2024, 2023, 2022, 2021];

async function fetchPage(uuid, state, offset = 0) {
  const params = new URLSearchParams();
  params.set('conditions[0][property]', 'recipient_state');
  params.set('conditions[0][value]', state);
  params.set('conditions[0][operator]', '=');
  params.set('conditions[1][property]', 'covered_recipient_specialty_1');
  params.set('conditions[1][value]', SPECIALTY);
  params.set('conditions[1][operator]', '=');
  params.set('conditions[2][property]', 'nature_of_payment_or_transfer_of_value');
  params.set('conditions[2][value]', SPEAKING_FEE);
  params.set('conditions[2][operator]', '=');
  params.set('limit', '500');
  params.set('offset', String(offset));
  params.set('format', 'json');

  const url = `https://openpaymentsdata.cms.gov/api/1/datastore/query/${uuid}/0?${params.toString()}`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${state} offset ${offset}`);
  return resp.json();
}

async function fetchAllForStateYear(state, year) {
  const uuid = DATASET_UUIDS[year];
  if (!uuid) return [];

  let allRecords = [];
  let offset = 0;

  while (true) {
    try {
      const data = await fetchPage(uuid, state, offset);
      const results = data.results || [];
      allRecords = allRecords.concat(results);

      const count = data.count || 0;
      process.stderr.write(`  ${state} ${year} offset=${offset} got=${results.length} total=${count}\n`);

      if (results.length < 500 || offset + 500 >= count) break;
      offset += 500;

      // Small delay to be nice to API
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      process.stderr.write(`  ERROR ${state} ${year} offset=${offset}: ${e.message}\n`);
      break;
    }
  }

  return allRecords;
}

async function processState(state) {
  const physicians = {}; // key: "FIRST LAST" -> aggregated data

  for (const year of yearsToFetch) {
    const records = await fetchAllForStateYear(state, year);

    for (const rec of records) {
      const first = (rec.covered_recipient_first_name || '').trim();
      const last = (rec.covered_recipient_last_name || '').trim();
      if (!first || !last) continue;

      const key = `${first}|${last}`.toUpperCase();
      const amount = parseFloat(rec.total_amount_of_payment_usdollars || '0');
      const company = (rec.applicable_manufacturer_or_applicable_gpo_making_payment_name || '').trim();
      const drug = (rec.name_of_drug_or_biological_or_device_or_medical_supply_1 || '').trim();
      const city = (rec.recipient_city || '').trim();

      if (!physicians[key]) {
        physicians[key] = {
          first, last, city, state,
          totalFee: 0,
          yearTotals: {},
          sponsors: new Set(),
          drugs: new Set(),
          paymentCount: 0
        };
      }

      const p = physicians[key];
      p.totalFee += amount;
      p.paymentCount++;
      if (city) p.city = city; // update to latest
      if (!p.yearTotals[year]) p.yearTotals[year] = 0;
      p.yearTotals[year] += amount;
      if (company) p.sponsors.add(company);
      if (drug) p.drugs.add(drug);
    }
  }

  // Sort by total fee descending, take top 50
  const sorted = Object.values(physicians)
    .sort((a, b) => b.totalFee - a.totalFee)
    .slice(0, 50);

  return sorted;
}

function titleCase(s) {
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function shortenCompany(name) {
  return name
    .replace(/,?\s*(Inc\.?|LLC|Ltd\.?|Corp\.?|Co\.?|Pharmaceuticals?|Pharmaceutical|America|USA|U\.S\.?|North America)/gi, '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatEntry(p) {
  const name = `${titleCase(p.first)} ${titleCase(p.last)}, MD`;
  const city = titleCase(p.city);
  const annual = Math.round(p.totalFee / yearsToFetch.length);
  const yearRange = `${Math.min(...yearsToFetch)}-${Math.max(...yearsToFetch)}`;
  const sponsors = [...p.sponsors].map(shortenCompany).filter(s => s.length > 0).slice(0, 5);
  const drugs = [...p.drugs].filter(d => d.length > 0).slice(0, 5);

  const fee = Math.round(p.totalFee);

  return `{name:"${name}",st:"${p.state}",city:"${city}",totalFee:${fee},annual:${annual},years:"${yearRange}",sponsors:${JSON.stringify(sponsors)},drugs:${JSON.stringify(drugs)},verified:true,notes:"CMS verified. ${p.paymentCount} payments across ${Object.keys(p.yearTotals).length} years."},`;
}

async function main() {
  process.stderr.write(`Fetching data for states: ${statesToFetch.join(', ')}\n`);
  process.stderr.write(`Years: ${yearsToFetch.join(', ')}\n\n`);

  const allResults = [];

  // Process states sequentially to avoid hammering the API
  for (const state of statesToFetch) {
    process.stderr.write(`\n=== Processing ${state} ===\n`);
    const results = await processState(state);
    allResults.push({ state, results });

    // Output results for this state immediately
    if (results.length > 0) {
      console.log(`    // === ${state} CMS VERIFIED (${results.length} physicians) ===`);
      for (const p of results) {
        console.log(`    ${formatEntry(p)}`);
      }
    }

    process.stderr.write(`  ${state}: ${results.length} physicians found\n`);
  }

  // Summary
  const totalPhysicians = allResults.reduce((s, r) => s + r.results.length, 0);
  process.stderr.write(`\n=== COMPLETE: ${totalPhysicians} physicians across ${allResults.length} states ===\n`);
}

main().catch(e => {
  process.stderr.write(`Fatal: ${e.message}\n`);
  process.exit(1);
});
