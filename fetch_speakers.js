const https = require('https');

const DATASETS = {
  2024: 'e6b17c6a-2534-4207-a4a1-6746a14911ff',
  2023: 'fb3a65aa-c901-4a38-a813-b04b00dfa2a9',
  2022: 'df01c2f8-dc1f-4e79-96cb-8208beaf143c',
  2021: '0380bbeb-aea1-58b6-b708-829f92a48202',
};

const STATES = ['FL', 'CA', 'NY', 'TX'];
const LIMIT = 500;
const NATURE = 'Compensation for services other than consulting, including serving as faculty or as a speaker at a venue other than a continuing education program';

function buildUrl(uuid, state, offset) {
  const base = `https://openpaymentsdata.cms.gov/api/1/datastore/query/${uuid}/0`;
  const params = new URLSearchParams();
  params.set('conditions[0][property]', 'recipient_state');
  params.set('conditions[0][value]', state);
  params.set('conditions[0][operator]', '=');
  params.set('conditions[1][property]', 'product_category_or_therapeutic_area_1');
  params.set('conditions[1][value]', 'PSYCHIATRY');
  params.set('conditions[1][operator]', '=');
  params.set('conditions[2][property]', 'nature_of_payment_or_transfer_of_value');
  params.set('conditions[2][value]', NATURE);
  params.set('conditions[2][operator]', '=');
  params.set('limit', String(LIMIT));
  params.set('offset', String(offset));
  params.set('format', 'json');
  params.set('count', 'true');
  return `${base}?${params.toString()}`;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 30000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error: ${e.message}\nBody: ${data.slice(0,200)}`)); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchAllForStateYear(state, year) {
  const uuid = DATASETS[year];
  let offset = 0;
  let allResults = [];
  let totalCount = null;

  while (true) {
    const url = buildUrl(uuid, state, offset);
    const resp = await fetchJson(url);
    if (totalCount === null) {
      totalCount = resp.count || 0;
      process.stderr.write(`  ${state} ${year}: ${totalCount} records\n`);
    }
    if (!resp.results || resp.results.length === 0) break;
    allResults = allResults.concat(resp.results);
    if (allResults.length >= totalCount) break;
    offset += LIMIT;
    await sleep(300);
  }
  return allResults;
}

function titleCase(s) {
  if (!s) return '';
  return s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function getDrugs(record) {
  const drugs = new Set();
  for (let i = 1; i <= 5; i++) {
    const d = record[`name_of_drug_or_biological_or_device_or_medical_supply_${i}`];
    if (d && d.trim()) drugs.add(d.trim().toUpperCase());
  }
  return drugs;
}

async function processState(state) {
  process.stderr.write(`\nProcessing ${state}...\n`);
  const physicians = {};

  for (const year of [2021, 2022, 2023, 2024]) {
    let records;
    try {
      records = await fetchAllForStateYear(state, year);
    } catch (e) {
      process.stderr.write(`  ERROR ${state} ${year}: ${e.message}\n`);
      continue;
    }

    for (const r of records) {
      const first = (r.covered_recipient_first_name || '').trim();
      const last = (r.covered_recipient_last_name || '').trim();
      if (!first || !last) continue;

      const key = `${first.toUpperCase()}|${last.toUpperCase()}`;
      const amount = parseFloat(r.total_amount_of_payment_usdollars) || 0;

      if (!physicians[key]) {
        physicians[key] = {
          first: titleCase(first),
          last: titleCase(last),
          city: titleCase(r.recipient_city || ''),
          state: state,
          totalFee: 0,
          sponsors: new Set(),
          drugs: new Set(),
          years: new Set(),
          specialty: r.covered_recipient_specialty_1 || '',
          type: r.covered_recipient_primary_type_1 || '',
        };
      }

      const p = physicians[key];
      p.totalFee += amount;
      p.years.add(year);

      const sponsor = (r.applicable_manufacturer_or_applicable_gpo_making_payment_name || '').trim();
      if (sponsor) p.sponsors.add(sponsor);

      for (const d of getDrugs(r)) {
        p.drugs.add(d);
      }

      if (!p.city && r.recipient_city) p.city = titleCase(r.recipient_city);
    }
    await sleep(500);
  }

  const sorted = Object.values(physicians)
    .sort((a, b) => b.totalFee - a.totalFee)
    .slice(0, 50);

  return sorted;
}

function formatCredential(p) {
  const spec = (p.specialty || '').toLowerCase();
  const type = (p.type || '').toLowerCase();
  if (spec.includes('osteopathic')) return 'DO';
  if (type.includes('physician') && !type.includes('assistant')) return 'MD';
  if (spec.includes('allopathic')) return 'MD';
  if (type.includes('nurse practitioner') || spec.includes('nurse practitioner')) return 'APRN';
  if (type.includes('physician assistant') || spec.includes('physician assistant')) return 'PA';
  if (spec.includes('psycholog')) return 'PhD';
  return 'MD';
}

function formatYearRange(yearsSet) {
  const yrs = Array.from(yearsSet).sort();
  if (yrs.length === 0) return '';
  if (yrs.length === 1) return String(yrs[0]);
  return `${yrs[0]}-${yrs[yrs.length - 1]}`;
}

async function main() {
  const allResults = {};

  for (const state of STATES) {
    allResults[state] = await processState(state);
  }

  console.log('// CMS Open Payments - Top Psychiatry Speakers by State (2021-2024)');
  console.log('// Source: openpaymentsdata.cms.gov | Generated: ' + new Date().toISOString().split('T')[0]);
  console.log('');

  for (const state of STATES) {
    console.log(`\n// ===== ${state} - TOP 50 PSYCHIATRY SPEAKERS =====`);
    const list = allResults[state];
    for (const p of list) {
      const cred = formatCredential(p);
      const name = `${p.first} ${p.last}, ${cred}`;
      const sponsors = Array.from(p.sponsors).slice(0, 5).map(s => `"${s.replace(/"/g, '\\"')}"`).join(',');
      const drugs = Array.from(p.drugs).slice(0, 8).map(d => `"${d.replace(/"/g, '\\"')}"`).join(',');
      const yrRange = formatYearRange(p.years);
      const numYears = p.years.size;
      const annual = numYears > 0 ? Math.round(p.totalFee / numYears) : 0;

      console.log(`{name:"${name}",st:"${p.state}",city:"${p.city}",totalFee:${Math.round(p.totalFee)},annual:${annual},years:"${yrRange}",sponsors:[${sponsors}],drugs:[${drugs}],verified:true,notes:"CMS verified ${yrRange} speaking fees."},`);
    }
  }

  process.stderr.write('\nDone!\n');
}

main().catch(e => { console.error(e); process.exit(1); });
