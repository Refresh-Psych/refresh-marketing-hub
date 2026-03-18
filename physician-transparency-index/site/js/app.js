// ============================================================================
// Physician Transparency Index — Client-Side Application
// Vanilla JS SPA with Chart.js visualizations
// Redesigned to match Figma design system
// ============================================================================

const API = window.location.origin + '/api';
const charts = {};
let searchPage = 1;

// ─── Utility ────────────────────────────────────────────────────────────
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function fmt(n) {
  if (n == null) return '$0';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtNum(n) {
  if (n == null) return '0';
  return Number(n).toLocaleString('en-US');
}

function fmtBig(n) {
  if (n == null) return '$0';
  const num = Number(n);
  if (num >= 1e9) return '$' + (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return '$' + (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return '$' + (num / 1e3).toFixed(0) + 'K';
  return fmt(num);
}

function fmtCompact(n) {
  if (!n || n === 0) return '';
  const num = Number(n);
  if (num >= 1e6) return '$' + (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return '$' + (num / 1e3).toFixed(1) + 'K';
  return '$' + num.toFixed(0);
}

function titleCase(s) {
  if (!s) return '';
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function shortenCompany(name) {
  if (!name) return '';
  return name
    .replace(/,?\s*(Inc\.?|LLC|Ltd\.?|Corp\.?|Co\.?|Pharmaceuticals?|America|USA|U\.S\.?|North America)/gi, '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40);
}

function tierBadge(amount) {
  if (amount >= 500000) return '<span class="tier tier-1">Tier 1</span>';
  if (amount >= 100000) return '<span class="tier tier-2">Tier 2</span>';
  if (amount >= 10000) return '<span class="tier tier-3">Tier 3</span>';
  return '';
}

function tierCardBadge(amount) {
  if (amount >= 500000) return '<div class="doctor-card-tier doctor-card-tier-1">Tier 1 &mdash; $500K+</div>';
  if (amount >= 100000) return '<div class="doctor-card-tier doctor-card-tier-2">Tier 2 &mdash; $100K+</div>';
  if (amount >= 10000) return '<div class="doctor-card-tier doctor-card-tier-3">Tier 3 &mdash; $10K+</div>';
  return '';
}

async function apiGet(endpoint) {
  try {
    const res = await fetch(API + endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`API error: ${endpoint}`, err);
    return null;
  }
}

// ─── Tab Navigation ─────────────────────────────────────────────────────
function initTabs() {
  $$('.nav-link').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.nav-link').forEach(t => t.classList.remove('active'));
      $$('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = $(`#tab-${tab.dataset.tab}`);
      if (panel) panel.classList.add('active');

      // Load data for tab on first visit
      loadTab(tab.dataset.tab);
    });
  });

  // Hero CTA buttons navigate to tabs
  $$('[data-hero-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.heroNav;
      const navLink = $(`.nav-link[data-tab="${tabName}"]`);
      if (navLink) navLink.click();
    });
  });
}

const loadedTabs = new Set();

function loadTab(tab) {
  if (loadedTabs.has(tab)) return;
  loadedTabs.add(tab);

  switch (tab) {
    case 'dashboard': loadDashboard(); break;
    case 'search': loadSearchFilters(); break;
    case 'leaderboard': loadLeaderboard(); break;
    case 'specialty': loadSpecialty(); break;
    case 'geography': loadGeography(); break;
    case 'company': loadCompany(); break;
  }
}

// ─── Dashboard ──────────────────────────────────────────────────────────
async function loadDashboard() {
  const stats = await apiGet('/stats');
  if (!stats) {
    $('#hero-stats').innerHTML = '<p style="color:#718096">Unable to connect to API</p>';
    return;
  }

  // Hero stats
  $('#hero-stats').innerHTML = `
    <div class="hero-stat">
      <div class="hero-stat-num">${fmtBig(stats.totalPayments)}</div>
      <div class="hero-stat-label">Total Payments</div>
    </div>
    <div class="hero-stat">
      <div class="hero-stat-num">${fmtNum(stats.totalPhysicians)}</div>
      <div class="hero-stat-label">Physicians</div>
    </div>
    <div class="hero-stat">
      <div class="hero-stat-num">${stats.minYear}&ndash;${stats.maxYear}</div>
      <div class="hero-stat-label">Year Range</div>
    </div>
  `;

  // Update CTA banner numbers
  const ctaCompanies = $('#cta-companies');
  const ctaPhysicians = $('#cta-physicians');
  const ctaYears = $('#cta-years');
  if (ctaCompanies) ctaCompanies.textContent = fmtNum(stats.totalCompanies);
  if (ctaPhysicians) ctaPhysicians.textContent = fmtNum(stats.totalPhysicians);
  if (ctaYears) ctaYears.textContent = `${stats.maxYear - stats.minYear + 1} years`;

  // Hidden stats container for compatibility
  $('#dashboard-stats').innerHTML = `
    <div class="stat-card"><div class="num">${fmtBig(stats.totalPayments)}</div><div class="lbl">Total Payments</div></div>
    <div class="stat-card green"><div class="num">${fmtNum(stats.totalPhysicians)}</div><div class="lbl">Physicians</div></div>
    <div class="stat-card purple"><div class="num">${fmtNum(stats.totalCompanies)}</div><div class="lbl">Companies</div></div>
    <div class="stat-card teal"><div class="num">${fmtNum(stats.totalRecords)}</div><div class="lbl">Payment Records</div></div>
    <div class="stat-card gold"><div class="num">${stats.totalStates}</div><div class="lbl">States + DC</div></div>
    <div class="stat-card"><div class="num">${stats.minYear}&ndash;${stats.maxYear}</div><div class="lbl">Year Range</div></div>
  `;

  // Top 15 leaderboard with specialty filter
  const top = await apiGet('/leaderboard?limit=15');
  if (top) renderLeaderboardTable('#dashboard-top-table tbody', top, 15);

  // Populate specialty filter buttons from top specialties
  const specData = await apiGet('/aggregates/specialty');
  if (specData) {
    const bar = $('#dash-specialty-bar');
    const topSpecs = specData.slice(0, 10);
    topSpecs.forEach(s => {
      const shortName = s.specialty ? s.specialty.split('|').pop().trim() : 'Unknown';
      const btn = document.createElement('button');
      btn.className = 'dash-spec-btn';
      btn.dataset.spec = encodeURIComponent(s.specialty || '');
      btn.textContent = shortName;
      bar.appendChild(btn);
    });

    bar.addEventListener('click', async (e) => {
      const btn = e.target.closest('.dash-spec-btn');
      if (!btn) return;
      bar.querySelectorAll('.dash-spec-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const spec = btn.dataset.spec;
      const url = spec
        ? `/leaderboard?specialty=${spec}&limit=15`
        : '/leaderboard?limit=15';
      const filtered = await apiGet(url);
      if (filtered) renderLeaderboardTable('#dashboard-top-table tbody', filtered, 15);
    });
  }

  // Trend chart
  const trends = await apiGet('/aggregates/trends');
  if (trends) renderTrendsChart(trends);

  // Top states chart
  const geo = await apiGet('/aggregates/geography');
  if (geo) renderTopStatesChart(geo.slice(0, 10));
}

function renderTrendsChart(data) {
  const years = [...new Set(data.map(d => d.payment_year))].sort();
  const generalData = years.map(y => {
    const row = data.find(d => d.payment_year === y && d.payment_type === 'general');
    return row ? row.total_payments : 0;
  });
  const researchData = years.map(y => {
    const row = data.find(d => d.payment_year === y && d.payment_type === 'research');
    return row ? row.total_payments : 0;
  });

  if (charts.trends) charts.trends.destroy();
  charts.trends = new Chart($('#chart-trends'), {
    type: 'bar',
    data: {
      labels: years,
      datasets: [
        { label: 'General Payments', data: generalData, backgroundColor: '#2B6CB0' },
        { label: 'Research Payments', data: researchData, backgroundColor: '#F6C744' },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { ticks: { callback: v => fmtBig(v) } } },
    },
  });
}

function renderTopStatesChart(data) {
  if (charts.topStates) charts.topStates.destroy();
  charts.topStates = new Chart($('#chart-top-states'), {
    type: 'bar',
    data: {
      labels: data.map(d => d.state),
      datasets: [{
        label: 'Total Payments',
        data: data.map(d => d.total_payments),
        backgroundColor: data.map((_, i) => i < 5 ? '#2B6CB0' : '#4299E1'),
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          title: { display: true, text: 'Total Payments ($)', font: { weight: '600', size: 12 }, color: '#4a5568' },
          ticks: { callback: v => fmtBig(v), color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        x: {
          title: { display: true, text: 'State', font: { weight: '600', size: 12 }, color: '#4a5568' },
          ticks: { color: '#2D3748', font: { weight: '600' } },
          grid: { display: false },
        },
      },
    },
  });
}

// ─── Search ─────────────────────────────────────────────────────────────
async function loadSearchFilters() {
  const filters = await apiGet('/filters');
  if (!filters) return;

  const stateSelect = $('#search-state');
  filters.states.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s.replace(/\|/g, ' > ');
    stateSelect.appendChild(opt);
  });

  const specSelect = $('#search-specialty');
  filters.specialties.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s.replace(/\|/g, ' > ');
    specSelect.appendChild(opt);
  });

  // Populate year filter
  const yearSelect = $('#search-year');
  filters.years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    yearSelect.appendChild(opt);
  });

  // Also populate leaderboard filters
  const lbState = $('#lb-state');
  filters.states.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s.replace(/\|/g, ' > ');
    lbState.appendChild(opt);
  });

  const lbSpec = $('#lb-specialty');
  filters.specialties.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s.replace(/\|/g, ' > ');
    lbSpec.appendChild(opt);
  });

  // Event listeners
  $('#search-btn').addEventListener('click', () => { searchPage = 1; doSearch(); });
  $('#search-clear').addEventListener('click', () => {
    $('#search-q').value = '';
    $('#search-state').value = '';
    $('#search-specialty').value = '';
    $('#search-year').value = '';
    $('#search-min').value = '';
    searchPage = 1;
    doSearch();
  });
  $('#search-q').addEventListener('keydown', e => { if (e.key === 'Enter') { searchPage = 1; doSearch(); } });
  $('#search-prev').addEventListener('click', () => { if (searchPage > 1) { searchPage--; doSearch(); } });
  $('#search-next').addEventListener('click', () => { searchPage++; doSearch(); });

  // Populate search specialty quick-filter bar
  const searchSpecBar = $('#search-specialty-bar');
  const specAggData = await apiGet('/aggregates/specialty');
  if (specAggData && searchSpecBar) {
    specAggData.slice(0, 10).forEach(s => {
      const shortName = s.specialty ? s.specialty.split('|').pop().trim() : 'Unknown';
      const btn = document.createElement('button');
      btn.className = 'dash-spec-btn';
      btn.dataset.spec = s.specialty || '';
      btn.textContent = shortName;
      searchSpecBar.appendChild(btn);
    });

    searchSpecBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.dash-spec-btn');
      if (!btn) return;
      searchSpecBar.querySelectorAll('.dash-spec-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      $('#search-specialty').value = btn.dataset.spec;
      searchPage = 1;
      doSearch();
    });
  }

  // Populate leaderboard specialty quick-filter bar
  const lbSpecBar = $('#lb-specialty-bar');
  if (specAggData && lbSpecBar) {
    specAggData.slice(0, 10).forEach(s => {
      const shortName = s.specialty ? s.specialty.split('|').pop().trim() : 'Unknown';
      const btn = document.createElement('button');
      btn.className = 'dash-spec-btn';
      btn.dataset.spec = s.specialty || '';
      btn.textContent = shortName;
      lbSpecBar.appendChild(btn);
    });

    lbSpecBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.dash-spec-btn');
      if (!btn) return;
      lbSpecBar.querySelectorAll('.dash-spec-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      lbActiveBarSpec = btn.dataset.spec || null;
      $('#lb-specialty').value = 'all';
      doLeaderboard();
    });
  }

  doSearch(true);
}

async function doSearch(initialLoad = false) {
  const params = new URLSearchParams();
  const q = $('#search-q').value.trim();
  const state = $('#search-state').value;
  const specialty = $('#search-specialty').value;
  const year = $('#search-year').value;
  const minAmount = $('#search-min').value;

  if (q) params.set('q', q);
  if (state) params.set('state', state);
  if (specialty) params.set('specialty', specialty);
  if (year) params.set('year', year);
  if (minAmount) params.set('minAmount', minAmount);
  params.set('page', searchPage);
  params.set('limit', 50);
  if (initialLoad) params.set('skipCategories', '1');

  const data = await apiGet('/search?' + params.toString());
  if (!data) return;

  const { results, pagination } = data;
  const grid = $('#search-results-grid');
  const emptyState = $('#search-empty-state');

  if (results.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    const pageOffset = (searchPage - 1) * 50;
    grid.innerHTML = `<div class="dr-row dr-row-header">
      <div class="dr-row-rank">#</div>
      <div class="dr-row-main"><div class="dr-row-name">Physician</div></div>
      <div class="dr-row-amount">Total Payments</div>
      <div class="dr-row-stats">
        <div class="dr-row-stat"><span class="dr-row-stat-label">Records</span></div>
        <div class="dr-row-stat"><span class="dr-row-stat-label">Companies</span></div>
      </div>
      <div class="dr-row-flag" style="visibility:hidden">Risk</div>
    </div>` + results.map((r, i) => {
      const risk = computeQuickRisk(r);
      const total = r.grand_total || 0;
      const hasRedFlag = risk.level === 'Critical' || risk.level === 'High';
      const tierBadge = total >= 500000 ? '<span class="dr-row-tier dr-row-tier-1">$500K+</span>'
        : total >= 100000 ? '<span class="dr-row-tier dr-row-tier-2">$100K+</span>'
        : total >= 10000 ? '<span class="dr-row-tier dr-row-tier-3">$10K+</span>' : '';
      return `
      <div class="dr-row" data-npi="${r.physician_npi}">
        <div class="dr-row-rank">${pageOffset + i + 1}</div>
        <div class="dr-row-main">
          <div class="dr-row-name">${titleCase(r.physician_first)} ${titleCase(r.physician_last)}</div>
          <div class="dr-row-meta">
            <span class="dr-row-specialty">${(r.specialty || 'Unknown').split('|').pop()}</span>
            <span class="dr-row-sep">&bull;</span>
            <span class="dr-row-location">${titleCase(r.city || '')}, ${r.state || ''}</span>
          </div>
          <div class="dr-row-cats">
            ${r.speaking ? `<span class="dr-cat"><span class="dr-cat-label">Speaking</span><span class="dr-cat-val">${fmtCompact(r.speaking)}</span><span class="dr-cat-n">(${r.speaking_n})</span></span>` : ''}
            ${r.consulting ? `<span class="dr-cat"><span class="dr-cat-label">Consulting</span><span class="dr-cat-val">${fmtCompact(r.consulting)}</span><span class="dr-cat-n">(${r.consulting_n})</span></span>` : ''}
            ${r.royalty ? `<span class="dr-cat"><span class="dr-cat-label">Royalty</span><span class="dr-cat-val">${fmtCompact(r.royalty)}</span><span class="dr-cat-n">(${r.royalty_n})</span></span>` : ''}
            ${r.travel ? `<span class="dr-cat"><span class="dr-cat-label">Travel</span><span class="dr-cat-val">${fmtCompact(r.travel)}</span><span class="dr-cat-n">(${r.travel_n})</span></span>` : ''}
            ${r.food ? `<span class="dr-cat"><span class="dr-cat-label">Food</span><span class="dr-cat-val">${fmtCompact(r.food)}</span><span class="dr-cat-n">(${r.food_n})</span></span>` : ''}
          </div>
        </div>
        <div class="dr-row-amount ${hasRedFlag ? 'dr-row-amount--red' : ''}">${fmt(total)}${tierBadge}</div>
        <div class="dr-row-stats">
          <div class="dr-row-stat"><span class="dr-row-stat-num">${fmtNum(r.total_records)}</span><span class="dr-row-stat-label">Records</span></div>
          <div class="dr-row-stat"><span class="dr-row-stat-num">${r.company_count || '—'}</span><span class="dr-row-stat-label">Companies</span></div>
        </div>
        ${hasRedFlag ? `<div class="dr-row-flag">${risk.level}</div>` : ''}
      </div>`;
    }).join('');

    // Click to open profile
    grid.querySelectorAll('.dr-row').forEach(card => {
      card.addEventListener('click', () => openPhysicianModal(card.dataset.npi, $('#search-year').value || null));
    });
  }

  $('#search-count').innerHTML = `<span class="count">${fmtNum(pagination.total)}</span> physicians found`;
  $('#search-page-info').textContent = `Page ${pagination.page} of ${pagination.totalPages}`;
  $('#search-prev').disabled = pagination.page <= 1;
  $('#search-next').disabled = pagination.page >= pagination.totalPages;
}

// ─── Leaderboard ────────────────────────────────────────────────────────
async function loadLeaderboard() {
  $('#lb-btn').addEventListener('click', () => {
    // When Update button is clicked with dropdown, clear bar selection
    lbActiveBarSpec = null;
    const lbSpecBar = $('#lb-specialty-bar');
    if (lbSpecBar) {
      lbSpecBar.querySelectorAll('.dash-spec-btn').forEach(b => b.classList.remove('active'));
      const allBtn = lbSpecBar.querySelector('[data-spec=""]');
      if (allBtn) allBtn.classList.add('active');
    }
    doLeaderboard();
  });
  $('#lb-export-csv').addEventListener('click', exportLeaderboardCSV);

  // Populate leaderboard filters if not already populated
  const lbSpec = $('#lb-specialty');
  const lbState = $('#lb-state');
  if (lbSpec.options.length <= 1 || lbState.options.length <= 1) {
    const filters = await apiGet('/filters');
    if (filters) {
      if (lbSpec.options.length <= 1) {
        filters.specialties.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s; opt.textContent = s.replace(/\|/g, ' > ');
          lbSpec.appendChild(opt);
        });
      }
      if (lbState.options.length <= 1) {
        filters.states.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s; opt.textContent = s;
          lbState.appendChild(opt);
        });
      }

      // Populate specialty quick-filter bar if empty
      const lbSpecBar = $('#lb-specialty-bar');
      if (lbSpecBar && lbSpecBar.children.length <= 1) {
        const specAggData = await apiGet('/aggregates/specialty');
        if (specAggData) {
          specAggData.slice(0, 10).forEach(s => {
            const shortName = s.specialty ? s.specialty.split('|').pop().trim() : 'Unknown';
            const btn = document.createElement('button');
            btn.className = 'dash-spec-btn';
            btn.dataset.spec = s.specialty || '';
            btn.textContent = shortName;
            lbSpecBar.appendChild(btn);
          });

          lbSpecBar.addEventListener('click', (e) => {
            const btn = e.target.closest('.dash-spec-btn');
            if (!btn) return;
            lbSpecBar.querySelectorAll('.dash-spec-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            lbActiveBarSpec = btn.dataset.spec || null;
            $('#lb-specialty').value = 'all'; // Reset dropdown when bar is used
            doLeaderboard();
          });
        }
      }
    }
  }

  doLeaderboard();
}

let lbActiveBarSpec = null; // Track specialty bar selection separately

async function doLeaderboard() {
  // Prefer the specialty bar selection over the dropdown
  const specialty = lbActiveBarSpec || $('#lb-specialty').value;
  const state = $('#lb-state').value;
  const limit = $('#lb-limit').value;
  const year = $('#lb-year').value;

  const data = await apiGet(`/leaderboard?specialty=${encodeURIComponent(specialty)}&state=${state}&limit=${limit}&year=${year}`);
  if (!data) return;

  // Render podium (top 3)
  renderPodium(data.slice(0, 3));

  const maxAmount = data.length > 0 ? data[0].total_payments : 1;
  renderLeaderboardTable('#lb-table tbody', data, data.length, maxAmount);
  $('#lb-count').innerHTML = `<span class="count">${data.length}</span> physicians`;
}

function renderPodium(top3) {
  const podium = $('#lb-podium');
  if (!podium || top3.length < 3) {
    if (podium) podium.innerHTML = '';
    return;
  }

  const medals = [
    { cls: 'podium-medal--silver', emoji: '&#129352;', cardCls: '' },
    { cls: 'podium-medal--gold', emoji: '&#129351;', cardCls: 'podium-card--first' },
    { cls: 'podium-medal--bronze', emoji: '&#129353;', cardCls: '' },
  ];

  // Display order: 2nd, 1st, 3rd
  const order = [1, 0, 2];

  podium.innerHTML = order.map(idx => {
    const r = top3[idx];
    const m = medals[idx];
    return `
    <div class="podium-card ${m.cardCls}" data-npi="${r.physician_npi}">
      <div class="podium-medal ${m.cls}">${m.emoji}</div>
      <div class="podium-name">${titleCase(r.physician_first)} ${titleCase(r.physician_last)}</div>
      <div class="podium-specialty">${r.specialty || ''}</div>
      <div class="podium-location">${titleCase(r.city || '')}, ${r.state || ''}</div>
      <div class="podium-amount">${fmt(r.total_payments)}</div>
    </div>`;
  }).join('');

  podium.querySelectorAll('.podium-card').forEach(card => {
    card.addEventListener('click', () => openPhysicianModal(card.dataset.npi, $('#lb-year').value || null));
  });
}

function renderLeaderboardTable(selector, data, limit, maxAmount) {
  if (!maxAmount) maxAmount = data.length > 0 ? data[0].total_payments : 1;
  const tbody = $(selector);

  tbody.innerHTML = data.slice(0, limit).map((r, i) => {
    const pct = Math.max(2, (r.total_payments / maxAmount) * 100);
    const companies = (r.companies || '').split(',').slice(0, 3).map(shortenCompany).filter(Boolean).join(', ');
    const rowClass = i < 3 ? 'top3' : '';

    return `
    <tr class="${rowClass} clickable" data-npi="${r.physician_npi}">
      <td class="rank-cell">${i + 1}</td>
      <td><strong>${titleCase(r.physician_first)} ${titleCase(r.physician_last)}</strong></td>
      <td>${r.specialty || ''}</td>
      <td>${titleCase(r.city || '')}, ${r.state || ''}</td>
      <td class="amount">${fmt(r.total_payments)} ${tierBadge(r.total_payments)}</td>
      <td><div class="fee-bar-track"><div class="fee-bar-fill" style="width:${pct}%"></div></div></td>
      <td>${fmtNum(r.payment_count)}</td>
      <td>${r.company_count || ''}</td>
      <td>${r.first_year || ''}&ndash;${r.last_year || ''}</td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('tr.clickable').forEach(tr => {
    tr.addEventListener('click', () => openPhysicianModal(tr.dataset.npi, $('#lb-year').value || null));
  });
}

let lastLeaderboardData = [];
function exportLeaderboardCSV() {
  const rows = $$('#lb-table tbody tr');
  let csv = 'Rank,Name,Specialty,Location,Total Payments,Payments,Companies,Years\n';
  rows.forEach((tr, i) => {
    const cells = tr.querySelectorAll('td');
    if (cells.length < 8) return;
    csv += `${i + 1},"${cells[1].textContent.trim()}","${cells[2].textContent.trim()}","${cells[3].textContent.trim()}","${cells[4].textContent.trim()}",${cells[6].textContent.trim()},${cells[7].textContent.trim()},"${cells[8].textContent.trim()}"\n`;
  });
  downloadCSV(csv, 'physician-transparency-leaderboard.csv');
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Specialty ──────────────────────────────────────────────────────────
async function loadSpecialty() {
  const data = await apiGet('/aggregates/specialty');
  if (!data) return;

  // Chart (top 15) — horizontal bar so it fits in one screen
  const top15 = data.slice(0, 15);

  // Company data for tooltips — not pre-fetched to avoid blocking server
  const specCompanyCache = {};

  if (charts.specialty) charts.specialty.destroy();
  const specCanvas = $('#chart-specialty');
  specCanvas.parentElement.style.height = 'calc(100vh - 240px)';
  specCanvas.parentElement.style.minHeight = '400px';
  specCanvas.parentElement.style.maxHeight = '600px';
  charts.specialty = new Chart(specCanvas, {
    type: 'bar',
    data: {
      labels: top15.map(d => d.specialty ? d.specialty.split('|').pop().trim() : 'Unknown'),
      datasets: [{
        label: 'Total Payments',
        data: top15.map(d => d.total_payments),
        backgroundColor: top15.map((_, i) => i < 5 ? '#2B6CB0' : '#4299E1'),
        borderRadius: 4,
        barThickness: 22,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(45, 55, 72, 0.97)',
          titleFont: { size: 13, weight: '700' },
          bodyFont: { size: 11 },
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: function(items) {
              const idx = items[0].dataIndex;
              return top15[idx].specialty || 'Unknown';
            },
            label: function(item) {
              return 'Total: ' + fmt(item.raw);
            },
            afterBody: function(items) {
              const idx = items[0].dataIndex;
              const spec = top15[idx].specialty;
              const companies = specCompanyCache[spec];
              if (companies && companies.length > 0) {
                const lines = ['', '━━ Top Companies ━━'];
                companies.forEach((c, i) => {
                  const name = shortenCompany(c.company_name);
                  lines.push(`${i + 1}. ${name}`);
                  lines.push(`    ${fmt(c.total_payments)}  (${fmtNum(c.payment_count)} payments)`);
                });
                return lines;
              }
              // Fetch lazily on first hover (won't block — just triggers for next hover)
              if (spec && !specCompanyCache[spec]) {
                specCompanyCache[spec] = []; // mark as loading
                apiGet('/aggregates/specialty/companies?specialty=' + encodeURIComponent(spec)).then(data => {
                  if (data) specCompanyCache[spec] = data;
                });
                return ['', '(Loading company data...)'];
              }
              return [];
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Total Payments ($)', font: { weight: '600', size: 12 }, color: '#4a5568' },
          ticks: { callback: v => fmtBig(v), color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        y: {
          ticks: { font: { size: 11 }, color: '#2D3748' },
          grid: { display: false },
        },
      },
    },
  });

  // Table
  const tbody = $('#specialty-table tbody');
  tbody.innerHTML = data.map((r, i) => `
    <tr>
      <td class="rank-cell">${i + 1}</td>
      <td>${r.specialty || 'Unknown'}</td>
      <td>${fmtNum(r.total_physicians)}</td>
      <td class="amount">${fmt(r.total_payments)}</td>
      <td>${fmt(r.avg_payment)}</td>
      <td>${fmtNum(r.total_records)}</td>
    </tr>
  `).join('');
}

// ─── Geography ──────────────────────────────────────────────────────────
async function loadGeography() {
  const data = await apiGet('/aggregates/geography');
  if (!data) return;

  // Chart (top 15 states) — horizontal bar so it fits in one screen
  const top15 = data.slice(0, 15);
  if (charts.geography) charts.geography.destroy();
  const geoCanvas = $('#chart-geography');
  geoCanvas.parentElement.style.height = 'calc(100vh - 240px)';
  geoCanvas.parentElement.style.minHeight = '400px';
  geoCanvas.parentElement.style.maxHeight = '600px';
  charts.geography = new Chart(geoCanvas, {
    type: 'bar',
    data: {
      labels: top15.map(d => d.state),
      datasets: [{
        label: 'Total Payments',
        data: top15.map(d => d.total_payments),
        backgroundColor: top15.map((_, i) => i < 5 ? '#2B6CB0' : '#4299E1'),
        borderRadius: 4,
        barThickness: 22,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          title: { display: true, text: 'Total Payments ($)', font: { weight: '600', size: 12 }, color: '#4a5568' },
          ticks: { callback: v => fmtBig(v), color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        y: {
          ticks: { color: '#2D3748', font: { weight: '600', size: 12 } },
          grid: { display: false },
        },
      },
    },
  });

  // Table
  const tbody = $('#geography-table tbody');
  tbody.innerHTML = data.map((r, i) => `
    <tr class="clickable" data-state="${r.state}">
      <td class="rank-cell">${i + 1}</td>
      <td><strong>${r.state}</strong></td>
      <td>${fmtNum(r.total_physicians)}</td>
      <td class="amount">${fmt(r.total_payments)}</td>
      <td>${fmtNum(r.total_records)}</td>
    </tr>
  `).join('');

  // Click to show city detail
  tbody.querySelectorAll('tr.clickable').forEach(tr => {
    tr.addEventListener('click', () => loadCityDetail(tr.dataset.state));
  });
}

async function loadCityDetail(state) {
  const data = await apiGet(`/aggregates/geography?state=${state}`);
  if (!data) return;

  $('#city-detail').style.display = 'block';
  $('#city-detail-title').textContent = `Cities in ${state}`;

  const tbody = $('#city-table tbody');
  tbody.innerHTML = data.map((r, i) => `
    <tr>
      <td class="rank-cell">${i + 1}</td>
      <td>${titleCase(r.city || '')}</td>
      <td>${fmtNum(r.total_physicians)}</td>
      <td class="amount">${fmt(r.total_payments)}</td>
      <td>${fmtNum(r.total_records)}</td>
    </tr>
  `).join('');

  $('#city-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Company ────────────────────────────────────────────────────────────
async function loadCompany() {
  const data = await apiGet('/aggregates/company?limit=200');
  if (!data) return;

  // Chart (top 15) — horizontal bar, fits in one viewport
  const top15 = data.slice(0, 15);
  if (charts.company) charts.company.destroy();
  const compCanvas = $('#chart-company');
  compCanvas.parentElement.style.height = 'calc(100vh - 240px)';
  compCanvas.parentElement.style.minHeight = '400px';
  compCanvas.parentElement.style.maxHeight = '600px';
  charts.company = new Chart(compCanvas, {
    type: 'bar',
    data: {
      labels: top15.map(d => shortenCompany(d.company_name)),
      datasets: [{
        label: 'Total Payments',
        data: top15.map(d => d.total_payments),
        backgroundColor: top15.map((_, i) => i < 5 ? '#2B6CB0' : '#4299E1'),
        borderRadius: 4,
        barThickness: 22,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          title: { display: true, text: 'Total Payments ($)', font: { weight: '600', size: 12 }, color: '#4a5568' },
          ticks: { callback: v => fmtBig(v), color: '#4a5568' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        y: {
          ticks: { font: { size: 11 }, color: '#2D3748' },
          grid: { display: false },
        },
      },
    },
  });

  // Table
  const tbody = $('#company-table tbody');
  tbody.innerHTML = data.map((r, i) => `
    <tr>
      <td class="rank-cell">${i + 1}</td>
      <td><strong>${r.company_name || ''}</strong></td>
      <td>${fmtNum(r.total_physicians)}</td>
      <td class="amount">${fmt(r.total_payments)}</td>
      <td>${fmtNum(r.total_records)}</td>
      <td>${r.state_count || ''}</td>
    </tr>
  `).join('');
}

// ─── Trends ─────────────────────────────────────────────────────────────
async function loadTrends() {
  const data = await apiGet('/aggregates/trends');
  if (!data) return;

  const years = [...new Set(data.map(d => d.payment_year))].sort();

  // Total payments by year
  const yearTotals = years.map(y => data.filter(d => d.payment_year === y).reduce((sum, d) => sum + d.total_payments, 0));

  if (charts.yearlyTotal) charts.yearlyTotal.destroy();
  charts.yearlyTotal = new Chart($('#chart-yearly-total'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Total Payments',
        data: yearTotals,
        borderColor: '#2B6CB0',
        backgroundColor: 'rgba(43, 108, 176, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: '#2B6CB0',
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: v => fmtBig(v) } } },
    },
  });

  // By type stacked
  const generalByYear = years.map(y => {
    const r = data.find(d => d.payment_year === y && d.payment_type === 'general');
    return r ? r.total_payments : 0;
  });
  const researchByYear = years.map(y => {
    const r = data.find(d => d.payment_year === y && d.payment_type === 'research');
    return r ? r.total_payments : 0;
  });
  const ownershipByYear = years.map(y => {
    const r = data.find(d => d.payment_year === y && d.payment_type === 'ownership');
    return r ? r.total_payments : 0;
  });

  if (charts.yearlyType) charts.yearlyType.destroy();
  charts.yearlyType = new Chart($('#chart-yearly-type'), {
    type: 'bar',
    data: {
      labels: years,
      datasets: [
        { label: 'General', data: generalByYear, backgroundColor: '#2B6CB0' },
        { label: 'Research', data: researchByYear, backgroundColor: '#F6C744' },
        { label: 'Ownership', data: ownershipByYear, backgroundColor: '#38A169' },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => fmtBig(v) } } },
    },
  });

  // Physician count by year
  const physiciansByYear = years.map(y => data.filter(d => d.payment_year === y).reduce((sum, d) => sum + d.physician_count, 0));

  if (charts.yearlyPhysicians) charts.yearlyPhysicians.destroy();
  charts.yearlyPhysicians = new Chart($('#chart-yearly-physicians'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Unique Physicians',
        data: physiciansByYear,
        borderColor: '#805AD5',
        backgroundColor: 'rgba(128, 90, 213, 0.1)',
        fill: true,
        tension: 0.3,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: v => fmtNum(v) } } },
    },
  });

  // Table
  const tbody = $('#trends-table tbody');
  tbody.innerHTML = data.map(r => `
    <tr>
      <td><strong>${r.payment_year}</strong></td>
      <td>${r.payment_type}</td>
      <td>${fmtNum(r.physician_count)}</td>
      <td class="amount">${fmt(r.total_payments)}</td>
      <td>${fmt(r.avg_payment)}</td>
      <td>${fmt(r.max_payment)}</td>
      <td>${fmtNum(r.payment_count)}</td>
    </tr>
  `).join('');
}

// ─── Physician Detail Modal (Redesigned) ─────────────────────────────────
let modalCurrentNpi = null;
let modalCurrentYear = null;

async function openPhysicianModal(npi, selectedYear) {
  if (!npi) return;
  modalCurrentNpi = npi;
  const modal = $('#physician-modal');
  const body = $('#modal-body');

  modal.style.display = 'flex';
  body.innerHTML = '<div class="loading">Loading physician profile...</div>';

  const yearParam = selectedYear ? `?year=${selectedYear}` : '';
  const data = await apiGet(`/physician/${npi}${yearParam}`);
  if (!data || !data.profile) {
    body.innerHTML = '<p>Physician not found.</p>';
    return;
  }

  const p = data.profile;
  const name = `${titleCase(p.physician_first)} ${titleCase(p.physician_last)}`;
  const risk = computeQuickRisk(p);
  const stats = data.yearStats || {};
  const displayYear = selectedYear || 'All Years';
  modalCurrentYear = selectedYear || null;

  // LinkedIn search URL
  const linkedInUrl = `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name + ' ' + (p.specialty || ''))}`;

  // Company promiscuity meter
  const companyCount = data.topCompanies ? data.topCompanies.length : (p.company_count || 0);
  const promiscuity = buildPromiscuityMeter(companyCount);

  // Year selector options
  const yearOptions = (data.availableYears || []).map(y =>
    `<option value="${y}" ${String(y) === String(selectedYear) ? 'selected' : ''}>${y}</option>`
  ).join('');

  // Build payment calendar heatmap
  const calendarHTML = buildPaymentCalendar(data.calendarData || [], selectedYear || data.availableYears?.[0]);

  // Payment days count
  const paymentDaysCount = (data.calendarData || []).length;

  body.innerHTML = `
    <div class="pp-header">
      <div class="pp-header-top">
        <div>
          <h2 class="pp-name">${name}</h2>
          <div class="pp-specialty">${p.specialty || 'Unknown Specialty'}</div>
          <div class="pp-location">${titleCase(p.city || '')}, ${p.state || ''}</div>
          <div class="pp-npi">NPI: ${p.physician_npi}</div>
        </div>
        <div class="pp-header-actions">
          <a href="${linkedInUrl}" target="_blank" rel="noopener" class="pp-linkedin-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn Profile
          </a>
          <div class="pp-risk-badge-wrap">
            ${riskBadgeHTML(risk.score, risk.level)}
            <span class="pp-risk-label">${risk.level} Risk</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pp-promiscuity-meter">
      <div class="pp-prom-header">
        <span class="pp-prom-title">Industry Promiscuity Index</span>
        <span class="pp-prom-count">${companyCount} ${companyCount === 1 ? 'company' : 'companies'}</span>
      </div>
      <div class="pp-prom-bar-track">
        <div class="pp-prom-bar-fill" style="width:${promiscuity.pct}%"></div>
      </div>
      <div class="pp-prom-label-row">
        <span class="pp-prom-label">${promiscuity.label}</span>
        <span class="pp-prom-emoji">${promiscuity.emoji}</span>
      </div>
    </div>

    <div class="pp-year-selector">
      <label>View Year:</label>
      <select id="modal-year-select">
        <option value="" ${!selectedYear ? 'selected' : ''}>All Years (${p.first_year}&ndash;${p.last_year})</option>
        ${yearOptions}
      </select>
    </div>

    ${data.paymentsByYear && data.paymentsByYear.length > 0 ? `
    <div class="pp-section" style="margin-top:16px">
      <h3 class="pp-section-title">Payments Over Time</h3>
      <canvas id="modal-year-chart" height="180"></canvas>
    </div>
    ` : ''}

    <div class="pp-at-a-glance">
      <div class="pp-glance-stat">
        <div class="pp-glance-num">${fmtNum(stats.payment_count || p.total_records)}</div>
        <div class="pp-glance-label">PAYMENTS</div>
      </div>
      <div class="pp-glance-divider"></div>
      <div class="pp-glance-stat">
        <div class="pp-glance-num">${fmt(stats.total_amount || p.grand_total)}</div>
        <div class="pp-glance-label">PAYMENT TOTAL</div>
      </div>
      <div class="pp-glance-divider"></div>
      <div class="pp-glance-stat">
        <div class="pp-glance-num">${stats.company_count || p.company_count || 0}</div>
        <div class="pp-glance-label">COMPANIES PAID THIS DOCTOR</div>
      </div>
    </div>

    <!-- Calendar removed for performance -->

    ${data.paymentCategories && data.paymentCategories.length > 0 ? `
    <div class="pp-section">
      <h3 class="pp-section-title">Types of Payments</h3>
      <table class="pp-table pp-categories-table">
        <thead><tr><th>CATEGORY</th><th>PAYMENTS</th><th>PAYMENT VALUE</th><th></th></tr></thead>
        <tbody>
          ${data.paymentCategories.map(c => `
            <tr class="pp-cat-row clickable" data-category="${(c.category || '').replace(/"/g, '&quot;')}" data-npi="${npi}">
              <td>${titleCase(c.category || '')}</td>
              <td>${fmtNum(c.count)}</td>
              <td class="amount">${fmt(c.total)}</td>
              <td class="pp-cat-toggle">&#9654;</td>
            </tr>
            <tr class="pp-cat-detail-row" style="display:none">
              <td colspan="4">
                <div class="pp-cat-detail-container" data-category="${(c.category || '').replace(/"/g, '&quot;')}">
                  <div class="loading">Click to load events...</div>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${data.topDrugs && data.topDrugs.length > 0 ? `
    <div class="pp-section">
      <h3 class="pp-section-title">Drugs & Devices</h3>
      <table class="pp-table">
        <thead><tr><th>PRODUCT NAME</th><th>PAYMENTS</th><th>TOTAL</th></tr></thead>
        <tbody>
          ${data.topDrugs.map(d => `
            <tr>
              <td>${d.drug || ''}</td>
              <td>${fmtNum(d.count)}</td>
              <td class="amount">${fmt(d.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${data.topCompanies && data.topCompanies.length > 0 ? `
    <div class="pp-section">
      <h3 class="pp-section-title">Top Companies</h3>
      <table class="pp-table">
        <thead><tr><th>COMPANY</th><th>PAYMENTS</th><th>TOTAL</th></tr></thead>
        <tbody>
          ${data.topCompanies.map(c => `
            <tr>
              <td>${shortenCompany(c.company_name)}</td>
              <td>${fmtNum(c.count)}</td>
              <td class="amount">${fmt(c.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${data.paymentDetails && data.paymentDetails.length > 0 ? `
    <div class="pp-section">
      <h3 class="pp-section-title">Payment Details</h3>
      <div class="pp-details-scroll">
        <table class="pp-table pp-details-table">
          <thead>
            <tr>
              <th>WHEN</th>
              <th>HOW MUCH</th>
              <th>RELATED TO</th>
              <th>WHAT FOR</th>
              <th>FROM</th>
            </tr>
          </thead>
          <tbody>
            ${data.paymentDetails.slice(0, 200).map(d => `
              <tr>
                <td>${formatPaymentDate(d.payment_date)}</td>
                <td class="amount">${fmt(d.payment_amount)}</td>
                <td>${d.drug_or_device_1 || ''}</td>
                <td>${titleCase(d.nature_of_payment || '')}</td>
                <td>${shortenCompany(d.company_name || '')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${data.paymentDetails.length > 200 ? `<div class="pp-more-note">Showing 200 of ${fmtNum(data.paymentDetails.length)} payment records</div>` : ''}
    </div>
    ` : ''}

    <div class="pp-disclaimer">
      <strong>Disclaimer:</strong> This data comes from CMS Open Payments. A high payment total does not imply wrongdoing. Many legitimate activities (research, education, advisory boards) generate industry payments.
    </div>
  `;

  // Year selector change handler
  $('#modal-year-select').addEventListener('change', (e) => {
    const yr = e.target.value;
    openPhysicianModal(npi, yr || null);
  });

  // Category row expand/collapse handlers
  body.querySelectorAll('.pp-cat-row').forEach(row => {
    row.addEventListener('click', async () => {
      const detailRow = row.nextElementSibling;
      const toggle = row.querySelector('.pp-cat-toggle');
      const isOpen = detailRow.style.display !== 'none';

      if (isOpen) {
        detailRow.style.display = 'none';
        toggle.innerHTML = '&#9654;';
        toggle.classList.remove('open');
        return;
      }

      detailRow.style.display = 'table-row';
      toggle.innerHTML = '&#9660;';
      toggle.classList.add('open');

      const container = detailRow.querySelector('.pp-cat-detail-container');
      if (container.dataset.loaded) return;

      container.innerHTML = '<div class="loading">Loading events...</div>';

      const category = row.dataset.category;
      const yearParam = modalCurrentYear ? `&year=${modalCurrentYear}` : '';
      const events = await apiGet(`/physician/${npi}/category?category=${encodeURIComponent(category)}${yearParam}`);

      if (!events || events.length === 0) {
        container.innerHTML = '<div class="pp-cat-no-data">No events found.</div>';
        container.dataset.loaded = 'true';
        return;
      }

      container.innerHTML = `
        <table class="pp-table pp-cat-events-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>AMOUNT</th>
              <th>COMPANY</th>
              <th>DRUG/DEVICE</th>
              <th>FORM</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(e => `
              <tr>
                <td>${formatPaymentDate(e.payment_date)}</td>
                <td class="amount">${fmt(e.payment_amount)}</td>
                <td>${shortenCompany(e.company_name || '')}</td>
                <td>${e.drug_or_device_1 || ''}</td>
                <td>${titleCase(e.form_of_payment || '')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${events.length >= 500 ? '<div class="pp-more-note">Showing first 500 events</div>' : ''}
      `;
      container.dataset.loaded = 'true';
    });
  });

  // Year-over-year payment chart in modal (placed below View Year selector)
  if (data.paymentsByYear && data.paymentsByYear.length > 0 && $('#modal-year-chart')) {
    const years = [...new Set(data.paymentsByYear.map(d => d.payment_year))].sort();
    const generalData = years.map(y => {
      const r = data.paymentsByYear.find(d => d.payment_year === y && d.payment_type === 'general');
      return r ? r.total : 0;
    });
    const researchData = years.map(y => {
      const r = data.paymentsByYear.find(d => d.payment_year === y && d.payment_type === 'research');
      return r ? r.total : 0;
    });
    const totalData = years.map((_, i) => generalData[i] + researchData[i]);

    if (charts.modal) charts.modal.destroy();
    charts.modal = new Chart($('#modal-year-chart'), {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          {
            label: 'General Payments',
            data: generalData,
            backgroundColor: selectedYear
              ? years.map(y => String(y) === String(selectedYear) ? '#2B6CB0' : 'rgba(43,108,176,0.3)')
              : '#2B6CB0',
            borderRadius: 4,
            order: 2,
          },
          {
            label: 'Research Payments',
            data: researchData,
            backgroundColor: selectedYear
              ? years.map(y => String(y) === String(selectedYear) ? '#F6C744' : 'rgba(246,199,68,0.3)')
              : '#F6C744',
            borderRadius: 4,
            order: 3,
          },
          {
            label: 'Total',
            data: totalData,
            type: 'line',
            borderColor: '#2D3748',
            borderWidth: 2,
            pointBackgroundColor: selectedYear
              ? years.map(y => String(y) === String(selectedYear) ? '#E53E3E' : '#2D3748')
              : '#2D3748',
            pointRadius: selectedYear
              ? years.map(y => String(y) === String(selectedYear) ? 6 : 3)
              : 3,
            fill: false,
            tension: 0.3,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } },
          tooltip: {
            backgroundColor: 'rgba(45, 55, 72, 0.97)',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(ctx) {
                return ctx.dataset.label + ': ' + fmt(ctx.raw);
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, weight: '600' }, color: '#4a5568' },
          },
          y: {
            ticks: { callback: v => fmtBig(v), color: '#4a5568' },
            grid: { color: 'rgba(0,0,0,0.05)' },
          },
        },
      },
    });
  }
}

// Industry Promiscuity Index — how many companies a doctor speaks for
function buildPromiscuityMeter(companyCount) {
  const c = companyCount || 0;
  if (c === 0) return { pct: 0, label: 'No Known Relationships', emoji: '', color: '#A0AEC0' };
  if (c === 1) return { pct: 8, label: 'Loyal — One Company Only', emoji: '💍', color: '#38A169' };
  if (c === 2) return { pct: 16, label: 'Mostly Faithful', emoji: '😇', color: '#68D391' };
  if (c <= 4) return { pct: 30, label: 'Casually Dating', emoji: '😏', color: '#ECC94B' };
  if (c <= 7) return { pct: 45, label: 'Playing the Field', emoji: '😈', color: '#ED8936' };
  if (c <= 10) return { pct: 60, label: 'Open Relationship', emoji: '🔥', color: '#E53E3E' };
  if (c <= 15) return { pct: 75, label: 'Industry Casanova', emoji: '💋', color: '#C53030' };
  if (c <= 20) return { pct: 88, label: 'Pharma\'s Best Friend', emoji: '🍾', color: '#9B2C2C' };
  return { pct: 100, label: 'Will Speak for Anyone', emoji: '🎪', color: '#742A2A' };
}

// Format payment date from MMDDYYYY or various formats
function formatPaymentDate(dateStr) {
  if (!dateStr) return '';
  // Try MMDDYYYY
  if (/^\d{8}$/.test(dateStr)) {
    const m = dateStr.slice(0, 2);
    const d = dateStr.slice(2, 4);
    const y = dateStr.slice(4, 8);
    return `${m}/${d}/${y}`;
  }
  // Try YYYY-MM-DD or MM/DD/YYYY
  if (dateStr.includes('-') || dateStr.includes('/')) return dateStr;
  return dateStr;
}

// Build GitHub-style payment calendar heatmap
function buildPaymentCalendar(calendarData, year) {
  if (!calendarData || calendarData.length === 0) return '';

  // Build a map of date -> {count, total}
  const dateMap = {};
  let maxCount = 0;
  for (const entry of calendarData) {
    let dateKey = entry.date;
    // Normalize date to YYYY-MM-DD
    if (/^\d{8}$/.test(dateKey)) {
      dateKey = `${dateKey.slice(4, 8)}-${dateKey.slice(0, 2)}-${dateKey.slice(2, 4)}`;
    }
    dateMap[dateKey] = { count: entry.count, total: entry.total };
    if (entry.count > maxCount) maxCount = entry.count;
  }

  if (!year) {
    // For "all years", find the most recent year with data
    const allDates = Object.keys(dateMap).sort();
    if (allDates.length === 0) return '';
    year = parseInt(allDates[allDates.length - 1].slice(0, 4));
  }

  // Generate 365/366 day grid for the year
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Build weeks (columns)
  const weeks = [];
  let currentWeek = [];
  const d = new Date(startDate);

  // Pad first week with empty cells
  const startDay = d.getDay(); // 0=Sun
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null);
  }

  while (d <= endDate) {
    const dateKey = d.toISOString().slice(0, 10);
    const data = dateMap[dateKey] || null;
    currentWeek.push({ date: dateKey, data });

    if (d.getDay() === 6) { // Saturday = end of week
      weeks.push(currentWeek);
      currentWeek = [];
    }
    d.setDate(d.getDate() + 1);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Month label positions
  const monthLabels = [];
  let weekIndex = 0;
  for (const week of weeks) {
    for (const cell of week) {
      if (cell && cell.date) {
        const cellDate = new Date(cell.date + 'T00:00:00');
        if (cellDate.getDate() <= 7 && cellDate.getDay() === 0) {
          monthLabels.push({ week: weekIndex, label: months[cellDate.getMonth()] });
        }
      }
    }
    weekIndex++;
  }

  // Build SVG-like HTML grid
  const cellSize = 11;
  const cellGap = 2;
  const totalWidth = weeks.length * (cellSize + cellGap) + 30;

  let cells = '';
  weeks.forEach((week, wi) => {
    week.forEach((cell, di) => {
      if (!cell) return;
      const x = wi * (cellSize + cellGap) + 28;
      const y = di * (cellSize + cellGap);
      let colorClass = 'cal-0';
      if (cell.data) {
        const c = cell.data.count;
        colorClass = c >= 5 ? 'cal-4' : c >= 3 ? 'cal-3' : c >= 2 ? 'cal-2' : 'cal-1';
      }
      const tooltip = cell.data
        ? `${cell.date}: ${cell.data.count} payment${cell.data.count > 1 ? 's' : ''} (${fmt(cell.data.total)})`
        : cell.date;
      cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" class="${colorClass}" data-tooltip="${tooltip}"><title>${tooltip}</title></rect>`;
    });
  });

  // Month labels
  let monthLabelsSVG = '';
  monthLabels.forEach(ml => {
    const x = ml.week * (cellSize + cellGap) + 28;
    monthLabelsSVG += `<text x="${x}" y="${7 * (cellSize + cellGap) + 14}" class="cal-month-label">${ml.label}</text>`;
  });

  // Day labels
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  let dayLabelsSVG = dayLabels.map((label, i) => {
    if (!label) return '';
    const y = i * (cellSize + cellGap) + cellSize - 1;
    return `<text x="0" y="${y}" class="cal-day-label">${label}</text>`;
  }).join('');

  return `
    <div class="pp-calendar-wrap">
      <svg class="pp-calendar" width="${totalWidth}" height="${7 * (cellSize + cellGap) + 22}" viewBox="0 0 ${totalWidth} ${7 * (cellSize + cellGap) + 22}">
        ${dayLabelsSVG}
        ${cells}
        ${monthLabelsSVG}
      </svg>
      <div class="pp-calendar-legend">
        <span>Less</span>
        <svg width="66" height="11"><rect x="0" y="0" width="11" height="11" rx="2" class="cal-0"/><rect x="14" y="0" width="11" height="11" rx="2" class="cal-1"/><rect x="28" y="0" width="11" height="11" rx="2" class="cal-2"/><rect x="42" y="0" width="11" height="11" rx="2" class="cal-3"/><rect x="56" y="0" width="11" height="11" rx="2" class="cal-4"/></svg>
        <span>More</span>
      </div>
    </div>
  `;
}

// ─── Modal close ────────────────────────────────────────────────────────
function initModal() {
  $('#modal-close').addEventListener('click', () => {
    $('#physician-modal').style.display = 'none';
    if (charts.modal) { charts.modal.destroy(); charts.modal = null; }
    modalCurrentNpi = null;
    modalCurrentYear = null;
  });

  $('#physician-modal').addEventListener('click', (e) => {
    if (e.target === $('#physician-modal')) {
      $('#physician-modal').style.display = 'none';
      if (charts.modal) { charts.modal.destroy(); charts.modal = null; }
      modalCurrentNpi = null;
      modalCurrentYear = null;
    }
  });
}

// ─── Risk Scoring (client-side quick estimate for search results) ────────
function computeQuickRisk(physician) {
  const total = physician.grand_total || 0;
  let score = 0;

  // Volume scoring (0-30)
  if (total >= 1000000) score += 30;
  else if (total >= 500000) score += 25;
  else if (total >= 100000) score += 18;
  else if (total >= 50000) score += 12;
  else if (total >= 10000) score += 6;
  else score += 2;

  // General-heavy ratio (0-15)
  if (total > 0) {
    const generalRatio = (physician.general_total || 0) / total;
    score += Math.round(generalRatio * 15);
  }

  // Years active (0-15)
  const years = physician.years_active || 1;
  score += Math.min(15, years * 4);

  // Company count (inverted — fewer companies = higher concentration risk) (0-15)
  const companies = physician.company_count || 0;
  if (companies === 0) score += 8;
  else if (companies === 1) score += 15;
  else if (companies <= 3) score += 10;
  else if (companies <= 5) score += 5;

  // Record count as proxy for ongoing relationship (0-10)
  const records = physician.total_records || 0;
  score += Math.min(10, Math.round(Math.log2(Math.max(records, 1)) * 2));

  return {
    score: Math.min(100, Math.max(0, score)),
    level: score >= 75 ? 'Critical' : score >= 50 ? 'High' : score >= 25 ? 'Elevated' : 'Low',
  };
}

function riskBadgeHTML(score, level) {
  const cssClass = level === 'Critical' ? 'risk-critical' :
                   level === 'High' ? 'risk-high' :
                   level === 'Elevated' ? 'risk-elevated' : 'risk-low';
  const barColor = level === 'Critical' ? '#C53030' :
                   level === 'High' ? '#E53E3E' :
                   level === 'Elevated' ? '#DD6B20' : '#38A169';
  return `
    <div class="risk-score-bar">
      <span class="risk-score-num" style="color:${barColor}">${score}</span>
      <div class="risk-score-track">
        <div class="risk-score-fill" style="width:${score}%; background:${barColor}"></div>
      </div>
    </div>`;
}

function riskLevelBadge(level) {
  const cssClass = level === 'Critical' ? 'risk-critical' :
                   level === 'High' ? 'risk-high' :
                   level === 'Elevated' ? 'risk-elevated' :
                   level === 'Moderate' ? 'risk-moderate' : 'risk-low';
  return `<span class="risk-badge ${cssClass}">${level}</span>`;
}

// ─── Risk Analysis Tab ──────────────────────────────────────────────────
async function loadRiskAnalysis() {
  // Populate state filter
  const filters = await apiGet('/filters');
  if (filters) {
    const riskState = $('#risk-state');
    filters.states.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s.replace(/\|/g, ' > ');
      riskState.appendChild(opt);
    });
  }

  $('#risk-btn').addEventListener('click', doRiskAnalysis);
  $('#risk-export-csv').addEventListener('click', exportRiskCSV);

  doRiskAnalysis();
}

async function doRiskAnalysis() {
  const state = $('#risk-state').value;
  const minScore = $('#risk-min').value;
  const limit = $('#risk-limit').value;

  const data = await apiGet(`/risk?state=${state}&minScore=${minScore}&limit=${limit}`);
  if (!data) return;

  const { results, meta } = data;
  const tbody = $('#risk-table tbody');

  tbody.innerHTML = results.map((r, i) => `
    <tr class="clickable" data-npi="${r.physician_npi}">
      <td class="rank-cell">${i + 1}</td>
      <td><strong>${titleCase(r.physician_first)} ${titleCase(r.physician_last)}</strong></td>
      <td>${titleCase(r.city || '')}, ${r.state || ''}</td>
      <td class="amount">${fmt(r.grand_total)}</td>
      <td>${riskBadgeHTML(r.riskScore, r.riskLevel)}</td>
      <td>${riskLevelBadge(r.riskLevel)}</td>
      <td>${r.topFactor}</td>
      <td>${r.company_count || 0}</td>
      <td>${r.first_year || ''}&ndash;${r.last_year || ''}</td>
    </tr>
  `).join('');

  tbody.querySelectorAll('tr.clickable').forEach(tr => {
    tr.addEventListener('click', () => openPhysicianModal(tr.dataset.npi));
  });

  $('#risk-count').innerHTML = `<span class="count">${results.length}</span> flagged of ${fmtNum(meta.totalAnalyzed)} analyzed`;
}

function exportRiskCSV() {
  const rows = $$('#risk-table tbody tr');
  let csv = 'Rank,Physician,Location,Total Payments,Risk Score,Risk Level,Top Factor,Companies,Years\n';
  rows.forEach((tr, i) => {
    const cells = tr.querySelectorAll('td');
    if (cells.length < 9) return;
    csv += `${i + 1},"${cells[1].textContent.trim()}","${cells[2].textContent.trim()}","${cells[3].textContent.trim()}",${cells[4].textContent.trim()},"${cells[5].textContent.trim()}","${cells[6].textContent.trim()}",${cells[7].textContent.trim()},"${cells[8].textContent.trim()}"\n`;
  });
  downloadCSV(csv, 'physician-risk-analysis.csv');
}

// ─── Init ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initModal();
  loadTab('dashboard');
});
