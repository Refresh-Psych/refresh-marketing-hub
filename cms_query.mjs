// CMS Open Payments API - Psychiatry Speaking Fees Query
// States: NJ, MI, VA, MD, TN, WA, CO, AZ | Years: 2021-2024

const DATASETS = {
  2024: 'e6b17c6a-2534-4207-a4a1-6746a14911ff',
  2023: 'fb3a65aa-c901-4a38-a813-b04b00dfa2a9',
  2022: 'df01c2f8-dc1f-4e79-96cb-8208beaf143c',
  2021: '0380bbeb-aea1-58b6-b708-829f92a48202',
};

const STATES = ['NJ', 'MI', 'VA', 'MD', 'TN', 'WA', 'CO', 'AZ'];
const BASE = 'https://openpaymentsdata.cms.gov/api/1/datastore/query';
const NATURE = 'Compensation for services other than consulting, including serving as faculty or as a speaker at a venue other than a continuing education program';

async function fetchAll(state, year) {
  const uuid = DATASETS[year];
  let offset = 0;
  const limit = 500;
  let allRows = [];

  while (true) {
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
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    params.set('format', 'json');

    const url = `${BASE}/${uuid}/0?${params.toString()}`;

    let retries = 3;
    let data;
    while (retries > 0) {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const txt = await res.text();
          console.error(`HTTP ${res.status} for ${state}/${year} offset=${offset}: ${txt.slice(0,200)}`);
          retries--;
          if (retries > 0) await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        data = await res.json();
        break;
      } catch (e) {
        console.error(`Fetch error ${state}/${year} offset=${offset}: ${e.message}`);
        retries--;
        if (retries > 0) await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!data) {
      console.error(`FAILED ${state}/${year} offset=${offset} after retries`);
      break;
    }

    const rows = data.results || data;
    if (!Array.isArray(rows) || rows.length === 0) break;

    allRows = allRows.concat(rows);
    console.error(`  ${state}/${year}: got ${rows.length} rows (total ${allRows.length})`);

    if (rows.length < limit) break;
    offset += limit;
    await new Promise(r => setTimeout(r, 300)); // rate limit
  }

  return allRows;
}

async function main() {
  // Master data: key = "STATE|FirstName LastName" => { totals, companies, drugs, city, years }
  const masterByState = {}; // state => { physicianKey => aggregated data }

  for (const state of STATES) {
    masterByState[state] = {};
  }

  for (const year of [2021, 2022, 2023, 2024]) {
    for (const state of STATES) {
      console.error(`Fetching ${state} ${year}...`);
      const rows = await fetchAll(state, year);
      console.error(`  ${state} ${year}: ${rows.length} total records`);

      for (const row of rows) {
        const first = (row.covered_recipient_first_name || '').trim();
        const last = (row.covered_recipient_last_name || '').trim();
        if (!first || !last) continue;

        const key = `${first} ${last}`.toUpperCase();
        const amt = parseFloat(row.total_amount_of_payment_usdollars) || 0;
        const company = (row.applicable_manufacturer_or_applicable_gpo_making_payment_name || '').trim();
        const drug = (row.name_of_drug_or_biological_or_device_or_medical_supply_1 || row.covered_or_noncovered_indicator_1 || '').trim();
        const city = (row.recipient_city || '').trim();
        const credential = (row.covered_recipient_primary_type_1 || row.covered_recipient_type || '').trim();

        if (!masterByState[state][key]) {
          masterByState[state][key] = {
            firstName: first,
            lastName: last,
            city: city,
            totalFee: 0,
            companies: new Set(),
            drugs: new Set(),
            yearsSet: new Set(),
            credential: credential,
            recordCount: 0,
          };
        }

        const doc = masterByState[state][key];
        doc.totalFee += amt;
        doc.recordCount++;
        if (company) doc.companies.add(company);
        if (drug && drug.length > 1) doc.drugs.add(drug);
        doc.yearsSet.add(year);
        if (city && !doc.city) doc.city = city;
        if (credential && !doc.credential) doc.credential = credential;
      }

      // Small delay between state/year combos
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // Now produce top 50 per state
  const output = [];

  for (const state of STATES) {
    const docs = Object.values(masterByState[state]);
    docs.sort((a, b) => b.totalFee - a.totalFee);
    const top50 = docs.slice(0, 50);

    output.push(`\n// ========== ${state} — TOP ${top50.length} PSYCHIATRY SPEAKERS (2021-2024) ==========`);

    for (const doc of top50) {
      const name = `${doc.firstName} ${doc.lastName}`;
      const yearsArr = [...doc.yearsSet].sort();
      const yearSpan = yearsArr.length > 1 ? `${yearsArr[0]}-${yearsArr[yearsArr.length - 1]}` : `${yearsArr[0]}`;
      const annual = Math.round(doc.totalFee / yearsArr.length);
      const sponsors = [...doc.companies].slice(0, 5);
      const drugs = [...doc.drugs].slice(0, 5);
      const cred = doc.credential || '';
      const suffix = cred.includes('Doctor of Osteopathy') ? ', DO'
        : cred.includes('Medical Doctor') ? ', MD'
        : cred.includes('Doctor') ? ', MD'
        : '';

      output.push(
        `{name:"${name}${suffix}",st:"${state}",city:"${doc.city}",totalFee:${Math.round(doc.totalFee)},annual:${annual},years:"${yearSpan}",sponsors:${JSON.stringify(sponsors)},drugs:${JSON.stringify(drugs)},verified:true,notes:"CMS verified ${yearSpan} speaking fees. ${doc.recordCount} payment records."},`
      );
    }
  }

  console.log(output.join('\n'));
}

main().catch(e => console.error('FATAL:', e));
