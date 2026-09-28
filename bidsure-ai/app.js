// ============================================================
// Government e-Marketplace (GeM) — Integrated Bid Compliance Portal
// Application Controller, Navigation & Verification Engine
// ============================================================

const view = document.getElementById('view-area');

// ---------- Application State & Storage ----------
let CURRENT_ROLE = 'officer'; // 'officer' (Buyer) | 'bidder' (Seller)
let DECISIONS = {};
try { DECISIONS = JSON.parse(localStorage.getItem('gem_bid_decisions') || '{}'); } catch(e) { DECISIONS = {}; }
function saveDecisions() { try { localStorage.setItem('gem_bid_decisions', JSON.stringify(DECISIONS)); } catch(e){} }

let EXTRA_AUDIT = [];
try { EXTRA_AUDIT = JSON.parse(localStorage.getItem('gem_bid_audit') || '[]'); } catch(e) { EXTRA_AUDIT = []; }
function pushAudit(entry) {
  EXTRA_AUDIT.unshift(entry);
  try { localStorage.setItem('gem_bid_audit', JSON.stringify(EXTRA_AUDIT)); } catch(e){}
}
function allAudit() { return [...EXTRA_AUDIT, ...AUDIT_TRAIL]; }

// Chart instances registry to avoid canvas reuse errors
const CHART_REGISTRY = {};
function destroyChart(id) {
  if (CHART_REGISTRY[id]) {
    try { CHART_REGISTRY[id].destroy(); } catch(e) {}
    delete CHART_REGISTRY[id];
  }
}

let _SUSPEND_HASH_ROUTER = false;

// ---------- Helpers ----------
function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }

function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = `<span class="t-dot"></span>${esc(msg)}`;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function riskPillClass(r) {
  if (r === 'LOW' || r === 'Low') return 'pill-low';
  if (r === 'MEDIUM' || r === 'Medium') return 'pill-medium';
  return 'pill-high';
}

function statusPillClass(s) {
  if (s === 'Verified' || s === 'PASS' || s === 'MATCHED') return 'pill-pass';
  if (s === 'Under Review' || s === 'REVIEW' || s === 'Clarification Pending') return 'pill-review';
  if (s === 'Awaiting Verification' || s === 'Verification In Progress' || s === 'Not Started') return 'pill-open';
  if (s === 'Rejected' || s === 'FAIL' || s === 'FLAGGED' || s === 'MISMATCH') return 'pill-fail';
  return 'pill-neutral';
}

function decisionFor(tid, bid) { return DECISIONS[tid + '::' + bid]; }

// ---------- Modal Handlers ----------
function openModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.add('active');
    renderIcons(m);
  }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

window.addEventListener('click', e => {
  if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('active');
  }
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
    closeGlobalSearch();
  }
});

// ---------- Login Tab Controller (Buyer vs Seller) ----------
function switchLoginTab(role) {
  CURRENT_ROLE = role;
  const tabBuyer = document.getElementById('tabBuyer');
  const tabSeller = document.getElementById('tabSeller');
  const roleInput = document.getElementById('login-role');
  const label = document.getElementById('loginIdLabel');
  const emailInput = document.getElementById('login-id');
  const noticeBox = document.getElementById('loginNoticeBox');

  if (role === 'bidder') {
    if (tabBuyer) tabBuyer.classList.remove('active');
    if (tabSeller) tabSeller.classList.add('active');
    if (roleInput) roleInput.value = 'bidder';
    if (label) label.textContent = 'GeM Primary Seller ID / Registered Vendor Email';
    if (emailInput) {
      emailInput.placeholder = 'vendor@company.com';
      emailInput.value = 'rajesh.verma@medlinemobility.in';
    }
    if (noticeBox) {
      noticeBox.innerHTML = '<b>GeM Seller / Bidder Portal:</b> For registered vendors checking technical eligibility, submitting documents, and tracking bids.';
    }
  } else {
    if (tabSeller) tabSeller.classList.remove('active');
    if (tabBuyer) tabBuyer.classList.add('active');
    if (roleInput) roleInput.value = 'officer';
    if (label) label.textContent = 'GeM Buyer User ID / Official Email';
    if (emailInput) {
      emailInput.placeholder = 'employee@dept.gov.in';
      emailInput.value = 'p.sharma@dept.gov.in';
    }
    if (noticeBox) {
      noticeBox.innerHTML = '<b>Government Buyer Console:</b> For Ministry/Department Procurement Officers evaluating tenders, verifying compliance, and awarding contracts.';
    }
  }
}

function refreshCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < 5; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const disp = document.getElementById('captchaDisplay');
  const inp = document.getElementById('login-captcha');
  if (disp) disp.textContent = res.split('').join(' ');
  if (inp) inp.value = res;
}

function logoutSession() {
  const appShell = document.getElementById('app-shell');
  const loginScreen = document.getElementById('login-screen');
  if (appShell) appShell.classList.add('hidden');
  if (loginScreen) loginScreen.classList.remove('hidden');
  toast('You have successfully logged out of the GeM Portal.');
}

// ---------- Navigation Bar Renderer ----------
function updateNavbar() {
  const nav = document.getElementById('main-nav-bar');
  const portalBadge = document.getElementById('headerPortalBadge');
  const userName = document.getElementById('topbar-user-name');
  const userRole = document.getElementById('topbar-user-role');
  const avatar = document.getElementById('topbar-avatar');

  if (CURRENT_ROLE === 'bidder') {
    if (portalBadge) { portalBadge.textContent = 'Seller Portal'; portalBadge.style.background = '#FFF3E1'; portalBadge.style.color = '#C97A17'; }
    if (userName) userName.textContent = 'Rajesh Verma';
    if (userRole) userRole.textContent = 'MedLine Mobility Systems (Vendor)';
    if (avatar) { avatar.textContent = 'RV'; avatar.classList.add('seller'); }

    if (nav) {
      nav.innerHTML = `
        <div class="gem-nav-inner">
          <a href="javascript:void(0)" onclick="openBidderSelfCheck()" class="gem-nav-link active" data-route="bidder-self-check">
            <i data-icon="sparkle"></i> Pre-Bid Compliance Auditor
          </a>
          <a href="javascript:void(0)" onclick="openTendersList()" class="gem-nav-link" data-route="tenders">
            <i data-icon="doc"></i> Browse Tenders (Bids)
          </a>
          <a href="javascript:void(0)" onclick="openTrustPassportView()" class="gem-nav-link" data-route="trust-passport-view">
            <i data-icon="passport"></i> Digital Trust Passport
          </a>
          <a href="javascript:void(0)" onclick="openMySubmissions()" class="gem-nav-link" data-route="my-submissions">
            <i data-icon="briefcase"></i> My Bids
          </a>
          <a href="javascript:void(0)" onclick="openMLModelPlayground()" class="gem-nav-link" data-route="ml-model">
            <i data-icon="cpu"></i> AI Verification Engine
          </a>
          <a href="javascript:void(0)" onclick="openGeMRules()" class="gem-nav-link" data-route="gem-rules">
            <i data-icon="shield"></i> GeM Rulebook &amp; GTC
          </a>
        </div>
      `;
    }
  } else {
    if (portalBadge) { portalBadge.textContent = 'Buyer Console'; portalBadge.style.background = 'var(--gem-blue-light)'; portalBadge.style.color = 'var(--gem-blue)'; }
    if (userName) userName.textContent = 'Smt. Priya Sharma';
    if (userRole) userRole.textContent = 'Procurement Officer (DHS)';
    if (avatar) { avatar.textContent = 'PS'; avatar.classList.remove('seller'); }

    if (nav) {
      nav.innerHTML = `
        <div class="gem-nav-inner">
          <a href="javascript:void(0)" onclick="openDashboard()" class="gem-nav-link active" data-route="dashboard">
            <i data-icon="grid"></i> Dashboard
          </a>
          <a href="javascript:void(0)" onclick="openTendersList()" class="gem-nav-link" data-route="tenders">
            <i data-icon="doc"></i> Tenders / Bids
          </a>
          <a href="javascript:void(0)" onclick="openBiddersList()" class="gem-nav-link" data-route="bidders">
            <i data-icon="users"></i> Bidder Evaluation Hub
          </a>
          <a href="javascript:void(0)" onclick="openVerificationQueue()" class="gem-nav-link" data-route="verification">
            <i data-icon="check"></i> Verification Queue
          </a>
          <a href="javascript:void(0)" onclick="openMLModelPlayground()" class="gem-nav-link" data-route="ml-model">
            <i data-icon="cpu"></i> AI Verification Engine
          </a>
          <a href="javascript:void(0)" onclick="openRiskOverview()" class="gem-nav-link" data-route="risk">
            <i data-icon="alert"></i> Risk &amp; Anti-Collusion
          </a>
          <a href="javascript:void(0)" onclick="openAuditTrail()" class="gem-nav-link" data-route="audit">
            <i data-icon="clock"></i> Audit Trail
          </a>
        </div>
      `;
    }
  }
  renderIcons(nav);
}

// ---------- Explicit Navigation Actions ----------
function setHash(h) {
  if (location.hash !== h) {
    _SUSPEND_HASH_ROUTER = true;
    location.hash = h;
    setTimeout(() => { _SUSPEND_HASH_ROUTER = false; }, 80);
  }
}

function updateActiveNav(routeName) {
  document.querySelectorAll('.gem-nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.route === routeName);
  });
  window.scrollTo(0, 0);
}

function openDashboard() {
  setHash('#/dashboard');
  updateActiveNav('dashboard');
  renderDashboard();
}

function openTendersList() {
  setHash('#/tenders');
  updateActiveNav('tenders');
  renderTendersList();
}

function viewTender(tid) {
  const t = findTender(tid) || TENDERS[0];
  setHash('#/tender?id=' + encodeURIComponent(t.id));
  updateActiveNav('tenders');
  renderTenderDetail(t.id);
}

function openBiddersList() {
  setHash('#/bidders');
  updateActiveNav('bidders');
  renderBiddersList();
}

function viewBidder(tid, bid, step = 'profile') {
  const b = findBidder(bid) || BIDDERS[0];
  const t = findTender(tid) || findTender(b.tenderId) || TENDERS[0];
  setHash('#/bidder?tid=' + encodeURIComponent(t.id) + '&bid=' + encodeURIComponent(b.id) + '&step=' + step);
  updateActiveNav('bidders');
  renderBidderProfile(t.id, b.id, step);
}

function openVerificationQueue() {
  setHash('#/verification');
  updateActiveNav('verification');
  renderVerificationQueue();
}

function openMLModelPlayground() {
  setHash('#/ml-model');
  updateActiveNav('ml-model');
  renderMLModelPlayground();
}

function openRiskOverview() {
  setHash('#/risk');
  updateActiveNav('risk');
  renderRiskOverview();
}

function openAuditTrail() {
  setHash('#/audit');
  updateActiveNav('audit');
  renderAudit();
}

function openBidderSelfCheck() {
  setHash('#/bidder-self-check');
  updateActiveNav('bidder-self-check');
  renderBidderSelfCheck();
}

function openTrustPassportView() {
  setHash('#/trust-passport-view');
  updateActiveNav('trust-passport-view');
  renderTrustPassportView();
}

function openMySubmissions() {
  setHash('#/my-submissions');
  updateActiveNav('my-submissions');
  renderMySubmissions();
}

function openGeMRules() {
  setHash('#/gem-rules');
  updateActiveNav('gem-rules');
  renderGeMRules();
}

// ---------- Router for URL Hash ----------
function router() {
  if (_SUSPEND_HASH_ROUTER) return;

  let raw = (location.hash || '').replace(/^#[\/]?/, '').trim();
  if (!raw) {
    if (CURRENT_ROLE === 'bidder') return openBidderSelfCheck();
    else return openDashboard();
  }

  let [pathPart, queryPart] = raw.split('?');
  const params = new URLSearchParams(queryPart || '');

  if (pathPart === 'dashboard' || pathPart === '') return openDashboard();
  if (pathPart === 'tenders') return openTendersList();
  if (pathPart === 'tender') {
    const tid = params.get('id') || params.get('tid') || TENDERS[0].id;
    return viewTender(tid);
  }
  if (pathPart === 'bidder') {
    const tid = params.get('tid') || TENDERS[0].id;
    const bid = params.get('bid') || params.get('id') || BIDDERS[0].id;
    const step = params.get('step') || 'profile';
    return viewBidder(tid, bid, step);
  }
  if (pathPart === 'bidders') return openBiddersList();
  if (pathPart === 'verification') return openVerificationQueue();
  if (pathPart === 'ml-model' || pathPart === 'ai') return openMLModelPlayground();
  if (pathPart === 'risk') return openRiskOverview();
  if (pathPart === 'audit') return openAuditTrail();
  if (pathPart === 'bidder-self-check') return openBidderSelfCheck();
  if (pathPart === 'trust-passport-view') return openTrustPassportView();
  if (pathPart === 'my-submissions') return openMySubmissions();
  if (pathPart === 'gem-rules') return openGeMRules();

  openDashboard();
}

window.addEventListener('hashchange', router);

// ---------- Shared Partials ----------
function breadcrumbs(items) {
  return `<div class="breadcrumbs">${items.map((it, i) => {
    const last = i === items.length - 1;
    return (last ? `<span>${esc(it.label)}</span>` : `<a href="javascript:void(0)" onclick="${it.onclick || `openDashboard()`}">${esc(it.label)}</a>`) + (last ? '' : ' <span>/</span>');
  }).join('')}</div>`;
}

function pageHead({ eyebrow, title, sub, actions }) {
  return `<div class="page-head">
    <div>
      ${eyebrow ? `<div class="page-eyebrow">${esc(eyebrow)}</div>` : ''}
      <h1 class="page-title">${title}</h1>
      ${sub ? `<div class="page-sub">${sub}</div>` : ''}
    </div>
    <div class="page-actions">${actions || ''}</div>
  </div>`;
}

// ============================================================
// 1. DASHBOARD (Buyer Procurement Officer View)
// ============================================================
function renderDashboard() {
  const activeTenders = TENDERS.filter(t => t.status !== 'Verified').length;
  const underVerification = BIDDERS.filter(b => b.status === 'Under Review' || b.status === 'Awaiting Verification' || b.status === 'Not Started').length;
  const compliant = BIDDERS.filter(b => b.score >= 80).length;
  const highRisk = BIDDERS.filter(b => b.risk === 'HIGH').length;

  view.innerHTML = `
    ${pageHead({
      eyebrow: 'Directorate of Health Services · Government of Tamil Nadu',
      title: 'GeM Procurement &amp; Bid Compliance Dashboard',
      sub: 'Monitor active tender bids, automated OCR document ground-truth, and live government registry cross-checks.',
      actions: `<button class="btn btn-outline" onclick="openUploadModal()"><i data-icon="upload"></i>Upload &amp; Verify Bid</button>
               <button class="btn btn-primary" onclick="openVerificationQueue()"><i data-icon="check" data-size="15"></i>Verification Queue (${underVerification})</button>`
    })}

    <!-- 4 Official KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card" style="cursor:pointer" onclick="openTendersList()">
        <div class="kpi-label">Active Tenders (Bids)</div>
        <div class="kpi-value">${activeTenders}</div>
        <div class="kpi-delta up">4 synchronized on GeM</div>
      </div>
      <div class="kpi-card" style="cursor:pointer" onclick="openVerificationQueue()">
        <div class="kpi-label">Bids Under Verification</div>
        <div class="kpi-value">${underVerification}</div>
        <div class="kpi-delta down">Awaiting evaluation</div>
      </div>
      <div class="kpi-card" style="cursor:pointer" onclick="openBiddersList()">
        <div class="kpi-label">Compliant Bidders (Score &ge; 80)</div>
        <div class="kpi-value" style="color:var(--gem-green)">${compliant}</div>
        <div class="kpi-delta up">Recommended for technical stage</div>
      </div>
      <div class="kpi-card" style="cursor:pointer" onclick="openRiskOverview()">
        <div class="kpi-label">High Risk / Red Flagged</div>
        <div class="kpi-value" style="color:var(--gem-red)">${highRisk}</div>
        <div class="kpi-delta down">Debarment or critical mismatch</div>
      </div>
    </div>

    <!-- Live Compliance Risk Distribution & Verification Pass Rates -->
    <div class="dash-grid mb-16">
      <div class="card card-pad">
        <div style="font-size:13.5px;font-weight:700;color:var(--gem-navy);margin-bottom:12px;display:flex;justify-content:space-between">
          <span>Bid Compliance Risk Breakdown</span>
          <span class="conf-tag">Live System</span>
        </div>
        <div style="height:210px;position:relative">
          <canvas id="chartRiskDist"></canvas>
        </div>
      </div>

      <div class="card card-pad">
        <div style="font-size:13.5px;font-weight:700;color:var(--gem-navy);margin-bottom:12px;display:flex;justify-content:space-between">
          <span>3-Mode Verification Success Rates</span>
          <span class="conf-tag">OCR · Portal · AI</span>
        </div>
        <div style="height:210px;position:relative">
          <canvas id="chartModeRates"></canvas>
        </div>
      </div>
    </div>

    <!-- Active Tenders Table -->
    <div class="card mb-16">
      <div class="card-head">
        <h3>Active GeM Procurement Tenders</h3>
        <button class="btn btn-ghost btn-xs" onclick="openTendersList()">View All (${TENDERS.length}) &rarr;</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bid / Tender ID</th>
              <th>Item Category &amp; Procuring Entity</th>
              <th>Est. Value</th>
              <th>Closing Date</th>
              <th>Bidders</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${TENDERS.map(t => {
              const bids = biddersForTender(t.id);
              const verifiedCount = bids.filter(b => b.status === 'Verified').length;
              return `
                <tr>
                  <td class="mono font-bold">${t.id}</td>
                  <td style="max-width:320px">
                    <div style="font-weight:700;color:var(--gem-navy)">${esc(t.title)}</div>
                    <div style="font-size:11.5px;color:var(--text-400)">${esc(t.org)}</div>
                  </td>
                  <td class="mono font-bold">${t.estimatedValue || '—'}</td>
                  <td>${fmtDate(t.closingDate)}</td>
                  <td>
                    <span class="mono font-bold">${bids.length}</span>
                    <span style="font-size:11px;color:var(--text-400)">(${verifiedCount} verified)</span>
                  </td>
                  <td><span class="pill ${statusPillClass(t.status)}">${t.status}</span></td>
                  <td>
                    <button class="btn btn-outline btn-xs" onclick="viewTender('${t.id}')">Inspect Bid &rarr;</button>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Audit Log Feed -->
    <div class="card">
      <div class="card-head">
        <h3>Recent Automated Verification &amp; Evaluation Logs</h3>
        <button class="btn btn-ghost btn-xs" onclick="openAuditTrail()">Full Audit Trail &rarr;</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Bidder Name</th>
              <th>Requirement</th>
              <th>Verification Activity</th>
              <th>Status</th>
              <th>Actor</th>
            </tr>
          </thead>
          <tbody>
            ${allAudit().slice(0, 5).map(a => `
              <tr>
                <td class="mono" style="font-size:11.5px">${esc(a.date)}</td>
                <td style="font-weight:700">${esc(a.bidder)}</td>
                <td>${esc(a.requirement)}</td>
                <td style="font-size:12px;color:var(--text-600)">${esc(a.action)}</td>
                <td><span class="pill ${pillClassForResult(a.result)}">${a.result}</span></td>
                <td style="font-size:11.5px;color:var(--text-400)">${esc(a.officer)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  renderIcons();

  setTimeout(() => {
    initDashboardCharts();
  }, 50);
}

function initDashboardCharts() {
  destroyChart('chartRiskDist');
  destroyChart('chartModeRates');

  const ctx1 = document.getElementById('chartRiskDist');
  if (ctx1) {
    const low = BIDDERS.filter(b => b.risk === 'LOW').length;
    const med = BIDDERS.filter(b => b.risk === 'MEDIUM').length;
    const high = BIDDERS.filter(b => b.risk === 'HIGH').length;

    CHART_REGISTRY['chartRiskDist'] = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Low Risk (Compliant)', 'Medium Risk (Review)', 'High Risk (Disqualified)'],
        datasets: [{
          data: [low, med, high],
          backgroundColor: ['#188A5A', '#C97A17', '#C9372C'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        },
        cutout: '70%'
      }
    });
  }

  const ctx2 = document.getElementById('chartModeRates');
  if (ctx2) {
    CHART_REGISTRY['chartModeRates'] = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['Mode 1: OCR Extraction', 'Mode 2: Portal Cross-Check', 'Mode 3: ML Assessment'],
        datasets: [{
          label: 'Pass Rate %',
          data: [94.2, 88.6, 99.8],
          backgroundColor: ['#1363DF', '#60A5FA', '#188A5A'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 0, max: 100, ticks: { callback: v => v + '%' } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }
}

// ============================================================
// 2. TENDERS LIST & TENDER DETAIL
// ============================================================
function renderTendersList() {
  view.innerHTML = `
    ${breadcrumbs([{ label: 'Home', onclick: CURRENT_ROLE === 'bidder' ? 'openBidderSelfCheck()' : 'openDashboard()' }, { label: 'Tenders' }])}
    ${pageHead({
      eyebrow: 'Government e-Marketplace',
      title: CURRENT_ROLE === 'bidder' ? 'Active GeM Bids Available for Participation' : 'Active Procurement Tenders &amp; Bids',
      sub: 'View tender requirements, participation thresholds, and compliance evaluation status.',
      actions: CURRENT_ROLE === 'bidder' ? '' : `<button class="btn btn-outline" onclick="openUploadModal()"><i data-icon="upload"></i>Upload Bid Package</button>`
    })}

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bid Number</th>
              <th>Tender Title &amp; Department</th>
              <th>Category</th>
              <th>Estimated Value</th>
              <th>End Date</th>
              <th>Participating Bidders</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${TENDERS.map(t => {
              const bids = biddersForTender(t.id);
              return `
                <tr>
                  <td class="mono font-bold">${t.id}</td>
                  <td style="max-width:320px">
                    <div style="font-weight:700;color:var(--gem-navy)">${esc(t.title)}</div>
                    <div style="font-size:11.5px;color:var(--text-400)">${esc(t.org)}</div>
                  </td>
                  <td><span class="pill pill-neutral">${t.category}</span></td>
                  <td class="mono font-bold">${t.estimatedValue || '—'}</td>
                  <td>${fmtDate(t.closingDate)}</td>
                  <td><span class="mono font-bold">${bids.length}</span> Submissions</td>
                  <td><span class="pill ${statusPillClass(t.status)}">${t.status}</span></td>
                  <td>
                    <button class="btn btn-primary btn-xs" onclick="viewTender('${t.id}')">View Details &rarr;</button>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  renderIcons();
}

function renderTenderDetail(tid) {
  const t = findTender(tid);
  const bids = biddersForTender(t.id);
  const sortedBids = [...bids].sort((a, b) => b.score - a.score);

  view.innerHTML = `
    ${breadcrumbs([
      { label: 'Home', onclick: CURRENT_ROLE === 'bidder' ? 'openBidderSelfCheck()' : 'openDashboard()' },
      { label: 'Tenders', onclick: 'openTendersList()' },
      { label: t.id }
    ])}

    ${pageHead({
      eyebrow: `${t.category} · ${t.org}`,
      title: t.title,
      sub: `Bid Number: <span class="mono font-bold">${t.id}</span> · End Date: ${fmtDate(t.closingDate)} · Estimated Value: <b>${t.estimatedValue || '—'}</b>`,
      actions: `
        <button class="btn btn-outline" onclick="openCompareModal('${t.id}')"><i data-icon="layers"></i>Compare All Bidders</button>
        ${CURRENT_ROLE === 'bidder' ? `<button class="btn btn-primary" onclick="openBidderSelfCheck()"><i data-icon="sparkle"></i>Pre-Check My Bid</button>` : `<button class="btn btn-primary" onclick="openUploadModal()"><i data-icon="upload"></i>Verify New Bid</button>`}
      `
    })}

    <!-- Tender Criteria KPI Grid -->
    <div class="kpi-grid mb-16">
      <div class="kpi-card">
        <div class="kpi-label">Min. Turnover Required</div>
        <div class="kpi-value" style="font-size:16px">${t.minTurnover}</div>
        <div class="kpi-delta up">Audited CA statement</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Min. Past Experience</div>
        <div class="kpi-value" style="font-size:16px">${t.minExperience}</div>
        <div class="kpi-delta up">Work orders required</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">EMD Amount</div>
        <div class="kpi-value" style="font-size:16px">${t.emdAmount || '₹10.0 L'}</div>
        <div class="kpi-delta up">MSME Exemption Applicable</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Total Submissions</div>
        <div class="kpi-value">${bids.length}</div>
        <div class="kpi-delta up">${bids.filter(b => b.score >= 80).length} technically compliant</div>
      </div>
    </div>

    <!-- Clause-to-Proof Requirements Checklist -->
    <div class="card mb-16">
      <div class="card-head">
        <h3>Tender Eligibility Clauses &amp; Ground Truth Mapping</h3>
        <span class="conf-tag">${t.requirements.length} Mandatory Clauses</span>
      </div>
      <div class="card-pad" style="background:#FAFBFD">
        <div class="clause-matrix">
          ${t.requirements.map(reqKey => {
            const def = REQ_DEFS.find(r => r.key === reqKey) || { label: reqKey, clause: 'Mandatory Criterion', source: 'Authorized Source' };
            return `
              <div class="clause-matrix-row">
                <div>
                  <div class="cm-clause">${esc(def.clause.split(':')[0])}</div>
                  <div class="cm-rule">${esc(def.clause.split(':')[1] || def.label)}</div>
                </div>
                <div>
                  <span style="font-size:11px;color:var(--text-400)">Ground Truth Source:</span>
                  <div style="font-size:12px;font-weight:700;color:var(--gem-blue)">${esc(def.source)}</div>
                </div>
                <div class="cm-proof">
                  <span class="conf-tag">Auto-Mapped</span>
                  <button class="btn btn-ghost btn-xs" onclick="openEvidenceModal('${reqKey}', '${sortedBids[0] ? sortedBids[0].id : 'BID-10231'}')"><i data-icon="scan"></i>Inspect OCR</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Participating Bidders Compliance Matrix -->
    <div class="card">
      <div class="card-head">
        <h3>Participating Bidders &amp; Compliance Rankings</h3>
        <button class="btn btn-accent btn-xs" onclick="openCompareModal('${t.id}')"><i data-icon="layers"></i>Side-by-Side Comparison</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Bidder Name</th>
              <th>Quote Price</th>
              <th>Compliance Score</th>
              <th>Risk Level</th>
              <th>Trust Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${sortedBids.map((b, idx) => {
              const dec = decisionFor(t.id, b.id);
              const displayStatus = dec ? (dec.status === 'approved' ? 'Approved by Officer' : dec.status === 'clarification' ? 'Clarification Issued' : 'Rejected') : b.status;
              return `
                <tr>
                  <td class="mono font-bold" style="color:var(--text-400)">#${idx + 1}</td>
                  <td>
                    <div style="font-weight:700;color:var(--gem-navy)">${esc(b.company)}</div>
                    <div class="mono" style="font-size:11px;color:var(--text-400)">ID: ${b.id} · GSTIN: ${b.gstin}</div>
                  </td>
                  <td class="mono font-bold">${b.bidPrice || '—'}</td>
                  <td>
                    <span class="mono font-bold" style="font-size:14px">${b.score}</span>
                    <span style="font-size:11px;color:var(--text-400)">/100</span>
                  </td>
                  <td><span class="pill ${riskPillClass(b.risk)}">${b.risk}</span></td>
                  <td><span class="conf-tag" style="color:var(--gem-blue)">★ ${b.trustScore || 85}</span></td>
                  <td><span class="pill ${statusPillClass(displayStatus)}">${displayStatus}</span></td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <button class="btn btn-primary btn-xs" onclick="viewBidder('${t.id}','${b.id}','profile')">Evaluate</button>
                      <button class="btn btn-outline btn-xs" onclick="openTrustPassportModal('${b.id}')"><i data-icon="passport"></i></button>
                    </div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  renderIcons();
}

// ============================================================
// 3. BIDDERS EVALUATION HUB & 6-STEP WORKSPACE
// ============================================================
function renderBiddersList() {
  view.innerHTML = `
    ${breadcrumbs([{ label: 'Home', onclick: 'openDashboard()' }, { label: 'Bidder Evaluation Hub' }])}
    ${pageHead({
      eyebrow: 'Vendor Intelligence',
      title: 'Bidder Compliance Evaluation Hub',
      sub: 'Review corporate master profiles, OCR extracted documents, live portal cross-checks, and AI compliance recommendations.',
      actions: `<button class="btn btn-primary" onclick="openUploadModal()"><i data-icon="upload"></i>Upload Bid Package</button>`
    })}

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bidder ID</th>
              <th>Company Name</th>
              <th>Target Tender</th>
              <th>Compliance Score</th>
              <th>Risk Level</th>
              <th>Trust Score</th>
              <th>Evaluation Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${BIDDERS.map(b => {
              const t = findTender(b.tenderId);
              return `
                <tr>
                  <td class="mono font-bold">${b.id}</td>
                  <td>
                    <div style="font-weight:700;color:var(--gem-navy)">${esc(b.company)}</div>
                    <div class="mono" style="font-size:11px;color:var(--text-400)">GSTIN: ${b.gstin} · CIN: ${b.cin || '—'}</div>
                  </td>
                  <td style="max-width:260px">
                    <div style="font-size:12px;font-weight:600">${esc(t.title)}</div>
                    <div class="mono" style="font-size:10.5px;color:var(--text-400)">${t.id}</div>
                  </td>
                  <td>
                    <span class="mono font-bold" style="font-size:14px">${b.score}</span>
                    <span style="font-size:11px;color:var(--text-400)">/100</span>
                  </td>
                  <td><span class="pill ${riskPillClass(b.risk)}">${b.risk}</span></td>
                  <td><span class="conf-tag" style="color:var(--gem-blue)">★ ${b.trustScore || 85}</span></td>
                  <td><span class="pill ${statusPillClass(b.status)}">${b.status}</span></td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <button class="btn btn-primary btn-xs" onclick="viewBidder('${b.tenderId}','${b.id}','profile')">Evaluate &rarr;</button>
                      <button class="btn btn-outline btn-xs" onclick="openTrustPassportModal('${b.id}')"><i data-icon="passport"></i></button>
                    </div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  renderIcons();
}

function renderBidderProfile(tid, bid, activeTab = 'profile') {
  const b = findBidder(bid);
  const t = findTender(tid || b.tenderId);
  const dec = decisionFor(t.id, b.id);
  const rec = recommendationFor(b);

  view.innerHTML = `
    ${breadcrumbs([
      { label: 'Home', onclick: CURRENT_ROLE === 'bidder' ? 'openBidderSelfCheck()' : 'openDashboard()' },
      { label: 'Tenders', onclick: 'openTendersList()' },
      { label: t.id, onclick: `viewTender('${t.id}')` },
      { label: b.company }
    ])}

    ${pageHead({
      eyebrow: `Bid Ref: ${b.id} · Submitted: ${fmtDate(b.submittedOn)} · ${t.category}`,
      title: b.company,
      sub: `Tender: <b>${esc(t.title)}</b> (${t.id}) · Quote: <b>${b.bidPrice || '—'}</b>`,
      actions: `
        <button class="btn btn-outline" onclick="openTrustPassportModal('${b.id}')"><i data-icon="passport"></i>Trust Passport</button>
        <button class="btn btn-accent" onclick="openCertificateModal('${t.id}','${b.id}')"><i data-icon="printer"></i>Official Certificate</button>
      `
    })}

    <!-- Header Score Banner -->
    <div class="card card-pad mb-16" style="background:linear-gradient(135deg,#0B2545 0%,#153E75 100%);color:#fff">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:18px">
        <div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="pill ${riskPillClass(b.risk)}">${b.risk} RISK</span>
            <span class="conf-tag" style="background:rgba(255,255,255,.1);color:#CBD5E1;border:none">Trust ID: ${b.trustId || 'TP-IND-2026'}</span>
            <span class="conf-tag" style="background:rgba(255,153,51,.25);color:#FFB84D;border:none">Trust Score: ★ ${b.trustScore || 85}</span>
          </div>
          <div style="font-size:24px;font-weight:800;margin-top:8px">
            ${b.score} <span style="font-size:15px;color:#94A3B8;font-weight:400">/ 100 Compliance Score</span>
          </div>
          <div style="font-size:12.5px;color:#CBD5E1;margin-top:4px;max-width:650px">
            ${esc(rec.reason)}
          </div>
        </div>

        <div style="text-align:right">
          <div style="font-size:11px;color:#CBD5E1">Procurement Officer Decision Status:</div>
          <div style="font-size:14px;font-weight:700;color:${dec ? (dec.status === 'approved' ? '#4ADE80' : dec.status === 'clarification' ? '#FFB84D' : '#F87171') : '#CBD5E1'};margin-top:2px">
            ${dec ? (dec.status === 'approved' ? '✓ APPROVED FOR TECHNICALS' : dec.status === 'clarification' ? '⚠ CLARIFICATION NOTICE ISSUED' : '✗ DISQUALIFIED') : '⏳ PENDING OFFICER ACTION'}
          </div>
        </div>
      </div>
    </div>

    <!-- 6-Step In-Depth Workspace Tabs -->
    <div class="card mb-16">
      <div class="workspace-tabs">
        <button class="ws-tab ${activeTab === 'profile' ? 'active' : ''}" onclick="viewBidder('${t.id}','${b.id}','profile')">
          <i data-icon="building"></i> 1. Corporate Profile
        </button>
        <button class="ws-tab ${activeTab === 'ocr' ? 'active' : ''}" onclick="viewBidder('${t.id}','${b.id}','ocr')">
          <i data-icon="scan"></i> 2. Mode 1: Document OCR
        </button>
        <button class="ws-tab ${activeTab === 'portal' ? 'active' : ''}" onclick="viewBidder('${t.id}','${b.id}','portal')">
          <i data-icon="link"></i> 3. Mode 2: Portal Cross-Checks
        </button>
        <button class="ws-tab ${activeTab === 'risk' ? 'active' : ''}" onclick="viewBidder('${t.id}','${b.id}','risk')">
          <i data-icon="cpu"></i> 4. Mode 3: AI Risk &amp; Gaps
        </button>
        <button class="ws-tab ${activeTab === 'decision' ? 'active' : ''}" onclick="viewBidder('${t.id}','${b.id}','decision')">
          <i data-icon="check"></i> 5. Officer Decision Console
        </button>
        <button class="ws-tab ${activeTab === 'cert' ? 'active' : ''}" onclick="viewBidder('${t.id}','${b.id}','cert')">
          <i data-icon="printer"></i> 6. Official Certificate
        </button>
      </div>

      <div class="card-pad" id="bidderWorkspaceContent">
        ${renderBidderWorkspaceTabContent(t, b, activeTab)}
      </div>
    </div>
  `;

  renderIcons();
}

function renderBidderWorkspaceTabContent(t, b, tab) {
  const dec = decisionFor(t.id, b.id);
  const rec = recommendationFor(b);

  if (tab === 'profile') {
    return `
      <div class="profile-grid-2col">
        <div>
          <div style="font-size:13.5px;font-weight:700;color:var(--gem-navy);margin-bottom:10px">Statutory Master Data (MCA21 / GSTN)</div>
          <div class="card card-pad mb-16" style="background:#FAFBFD">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px">
              <div><span class="muted">Legal Entity Name:</span><div style="font-weight:700">${esc(b.company)}</div></div>
              <div><span class="muted">GSTIN:</span><div class="mono font-bold">${esc(b.gstin)}</div></div>
              <div><span class="muted">PAN:</span><div class="mono font-bold">${esc(b.pan)}</div></div>
              <div><span class="muted">CIN:</span><div class="mono font-bold">${esc(b.cin || '—')}</div></div>
              <div><span class="muted">Udyam MSME:</span><div class="mono font-bold">${esc(b.udyam || '—')}</div></div>
              <div><span class="muted">Classification:</span><div style="font-weight:700">${esc(b.category || 'MSME')}</div></div>
            </div>
            <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border-soft);font-size:12px">
              <span class="muted">Registered Office:</span>
              <div style="font-weight:600;color:var(--text-900)">${esc(b.address)}</div>
            </div>
          </div>

          <div style="font-size:13.5px;font-weight:700;color:var(--gem-navy);margin-bottom:10px">Company Directors &amp; DIN Validation</div>
          <div>
            ${(b.directors || []).map(d => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:4px;background:#fff;margin-bottom:6px">
                <div>
                  <div style="font-weight:700">${esc(d.name)}</div>
                  <div class="mono" style="font-size:10.5px;color:var(--text-400)">DIN: ${esc(d.din)} · ${esc(d.designation)}</div>
                </div>
                <span class="pill ${d.status.includes('FLAGGED') ? 'pill-fail' : 'pill-pass'}">${esc(d.status)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <div style="font-size:13.5px;font-weight:700;color:var(--gem-navy);margin-bottom:10px">3-Year Audited Financial Turnover</div>
          <div class="card mb-16">
            <div class="table-wrap">
              <table>
                <thead><tr><th>Financial Year</th><th>Turnover</th><th>Status</th></tr></thead>
                <tbody>
                  ${(b.turnoverHistory || []).map(th => `
                    <tr>
                      <td class="mono font-bold">${esc(th.fy)}</td>
                      <td class="mono font-bold" style="color:var(--gem-blue)">${esc(th.amount)}</td>
                      <td><span class="pill pill-pass">${esc(th.status)}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div style="font-size:13.5px;font-weight:700;color:var(--gem-navy);margin-bottom:10px">GeM Past Contracts &amp; Ratings</div>
          <div>
            ${(b.pastContracts || []).map(pc => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:4px;background:#fff;margin-bottom:6px">
                <div>
                  <div style="font-weight:700">${esc(pc.item)}</div>
                  <div style="font-size:11px;color:var(--text-400)">${esc(pc.buyer)} (${esc(pc.year)})</div>
                </div>
                <div style="text-align:right">
                  <div class="mono font-bold">${esc(pc.value)}</div>
                  <span class="pill pill-pass" style="font-size:10px">${esc(pc.status)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (tab === 'ocr') {
    return `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <div style="font-size:14px;font-weight:700;color:var(--gem-navy)">Mode 1: OCR Ground Truth Extraction</div>
            <div style="font-size:12px;color:var(--text-600)">Inspect extracted fields, confidence scores, and visual bounding boxes on submitted documents.</div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="openEvidenceModal('gst','${b.id}')"><i data-icon="scan"></i>Open Full OCR Viewer</button>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Ground Truth Document</th>
                <th>AI Findings / Notes</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${b.results.map(r => `
                <tr>
                  <td style="font-weight:700">${esc(r.label)}</td>
                  <td class="mono" style="font-size:12px;color:var(--gem-blue)">${esc(r.evidence)}</td>
                  <td style="max-width:320px;font-size:12px;color:var(--text-600)">${esc(r.reason)}</td>
                  <td>
                    <span class="mono font-bold" style="color:${r.confidence > 85 ? 'var(--gem-green)' : r.confidence > 50 ? 'var(--gem-amber)' : 'var(--gem-red)'}">
                      ${r.confidence}%
                    </span>
                  </td>
                  <td><span class="pill ${pillClassForResult(r.result)}">${r.result}</span></td>
                  <td>
                    <button class="btn btn-ghost btn-xs" onclick="openEvidenceModal('${r.key}','${b.id}')"><i data-icon="scan"></i>Inspect</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (tab === 'portal') {
    return `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <div style="font-size:14px;font-weight:700;color:var(--gem-navy)">Mode 2: Government Registry Cross-Checks</div>
            <div style="font-size:12px;color:var(--text-600)">Real-time validation against GSTN, Income Tax e-Filing, MSME Udyam, EPFO, and GeM Debarment registry.</div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="openApiInspectorModal('gst')"><i data-icon="code"></i>View API Payloads</button>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Government Registry</th>
                <th>Target Identifier</th>
                <th>Query Gateway</th>
                <th>Response Latency</th>
                <th>Cross-Match Status</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight:700">GSTN Taxpayer Registry</td>
                <td class="mono">${b.gstin}</td>
                <td class="mono" style="font-size:11px;color:var(--text-400)">api.gstn.gov.in/taxpayer/v1.2</td>
                <td class="mono">184ms</td>
                <td><span class="pill ${b.gstin.startsWith('19') ? 'pill-fail' : 'pill-pass'}">${b.gstin.startsWith('19') ? 'CANCELLED' : 'ACTIVE & VERIFIED'}</span></td>
                <td><button class="btn btn-ghost btn-xs" onclick="openApiInspectorModal('gst')"><i data-icon="code"></i>View JSON</button></td>
              </tr>
              <tr>
                <td style="font-weight:700">Income Tax e-Filing (NSDL)</td>
                <td class="mono">${b.pan}</td>
                <td class="mono" style="font-size:11px;color:var(--text-400)">api.incometax.gov.in/pan-val/v2</td>
                <td class="mono">210ms</td>
                <td><span class="pill pill-pass">99.4% NAME MATCH</span></td>
                <td><button class="btn btn-ghost btn-xs" onclick="openApiInspectorModal('pan')"><i data-icon="code"></i>View JSON</button></td>
              </tr>
              <tr>
                <td style="font-weight:700">Ministry of MSME Udyam</td>
                <td class="mono">${b.udyam || 'NOT PROVIDED'}</td>
                <td class="mono" style="font-size:11px;color:var(--text-400)">udyamregistration.gov.in/api/v1</td>
                <td class="mono">320ms</td>
                <td><span class="pill ${b.udyam && b.udyam.includes('MH') ? 'pill-fail' : 'pill-pass'}">${b.udyam && b.udyam.includes('MH') ? 'EXPIRED' : 'VALID ACTIVE'}</span></td>
                <td><button class="btn btn-ghost btn-xs" onclick="openApiInspectorModal('udyam')"><i data-icon="code"></i>View JSON</button></td>
              </tr>
              <tr>
                <td style="font-weight:700">EPFO Shram Suvidha</td>
                <td class="mono">TBCH1004812000</td>
                <td class="mono" style="font-size:11px;color:var(--text-400)">unifiedportal-epfo.epfindia.gov.in</td>
                <td class="mono">265ms</td>
                <td><span class="pill pill-pass">REGULAR ECR FILED</span></td>
                <td><button class="btn btn-ghost btn-xs" onclick="openApiInspectorModal('epfo')"><i data-icon="code"></i>View JSON</button></td>
              </tr>
              <tr>
                <td style="font-weight:700">GeM Debarment / CVC Watchlist</td>
                <td class="mono">${b.pan}</td>
                <td class="mono" style="font-size:11px;color:var(--text-400)">gem.gov.in/api/debarment-registry</td>
                <td class="mono">145ms</td>
                <td><span class="pill ${b.id === 'BID-11048' ? 'pill-fail' : 'pill-pass'}">${b.id === 'BID-11048' ? 'FLAGGED DIRECTOR LINKAGE' : 'CLEAN NO RECORDS'}</span></td>
                <td><button class="btn btn-ghost btn-xs" onclick="openApiInspectorModal('blacklist')"><i data-icon="code"></i>View JSON</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (tab === 'risk') {
    const factors = riskFactorsFor(b);
    return `
      <div>
        <div style="font-size:14px;font-weight:700;color:var(--gem-navy);margin-bottom:10px">Mode 3: AI Compliance Assessment &amp; Risk Breakdown</div>
        <div class="dash-grid mb-16">
          <div class="card card-pad">
            <div style="font-size:13px;font-weight:700;margin-bottom:8px">Compliance Deductions &amp; Gaps</div>
            ${factors.length === 0 ? `
              <div style="padding:16px;text-align:center;color:var(--gem-green);font-weight:700">
                ✓ Zero risk deductions detected. All mandatory tender criteria satisfied.
              </div>
            ` : factors.map(f => `
              <div style="padding:10px 12px;border:1px solid ${f.type === 'fail' ? 'var(--gem-red-border)' : 'var(--gem-amber-border)'};border-radius:var(--radius-sm);background:${f.type === 'fail' ? 'var(--gem-red-light)' : 'var(--gem-amber-light)'};margin-bottom:8px">
                <div style="display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:12.5px;color:${f.type === 'fail' ? 'var(--gem-red)' : 'var(--gem-amber)'}">
                  <span>${esc(f.title)}</span>
                  <span class="mono">${f.weight}</span>
                </div>
                <div style="font-size:11.5px;color:var(--text-600);margin-top:3px">${esc(f.sub)}</div>
              </div>
            `).join('')}
          </div>

          <div class="card card-pad" style="background:#FAFBFD">
            <div style="font-size:13px;font-weight:700;margin-bottom:8px">Anti-Collusion Integrity Check</div>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:12px">
              <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border-soft)">
                <span>Common Director DIN Screening:</span>
                <span class="pill ${b.id === 'BID-11048' ? 'pill-fail' : 'pill-pass'}">${b.id === 'BID-11048' ? 'Shared DIN Flagged' : 'Pass / Distinct DIN'}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border-soft)">
                <span>IP / Submission Location Check:</span>
                <span class="pill pill-pass">Distinct Subnet</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0">
                <span>Price Variance Analysis:</span>
                <span class="pill pill-pass">Healthy Variance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (tab === 'decision') {
    return `
      <div>
        <div style="font-size:14px;font-weight:700;color:var(--gem-navy);margin-bottom:6px">Procurement Officer Evaluation Decision</div>
        <div style="font-size:12.5px;color:var(--text-600);margin-bottom:14px">
          AI assists with evidence-based recommendations; statutory approval authority remains with the Procurement Officer.
        </div>

        <div class="card card-pad mb-16" style="background:var(--bg)">
          <div style="font-size:12px;font-weight:700;margin-bottom:6px">AI Recommendation:</div>
          <div style="font-size:14px;font-weight:800;color:var(--gem-navy)">${esc(rec.verdict)}</div>
          <div style="font-size:12.5px;color:var(--text-600);margin-top:3px">${esc(rec.reason)}</div>
        </div>

        <div class="stack" style="gap:12px">
          <label class="field">
            <span>Officer Justification Remarks &amp; Notes</span>
            <textarea id="officerDecisionNote" rows="3" placeholder="Enter reason for approval, clarification request, or disqualification...">${dec ? esc(dec.note) : ''}</textarea>
          </label>

          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-accent" onclick="recordOfficerDecision('${t.id}','${b.id}','approved')">
              <i data-icon="check"></i> Approve for Technical Evaluation
            </button>
            <button class="btn btn-outline" style="border-color:var(--gem-amber-border);color:var(--gem-amber)" onclick="recordOfficerDecision('${t.id}','${b.id}','clarification')">
              <i data-icon="clock"></i> Request Clarification from Bidder (48h)
            </button>
            <button class="btn btn-danger" onclick="recordOfficerDecision('${t.id}','${b.id}','rejected')">
              <i data-icon="ban"></i> Disqualify Bidder on Statutory Grounds
            </button>
          </div>
        </div>
      </div>
    `;
  }

  if (tab === 'cert') {
    return `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div>
            <div style="font-size:14px;font-weight:700;color:var(--gem-navy)">Official GeM Bid Compliance Certificate</div>
            <div style="font-size:12px;color:var(--text-600)">Tamper-evident verification certificate with cryptographic hash and digital signature.</div>
          </div>
          <button class="btn btn-accent btn-sm" onclick="openCertificateModal('${t.id}','${b.id}')"><i data-icon="printer"></i>Open Print / PDF View</button>
        </div>
        <div class="card card-pad" style="background:#F1F5F9;text-align:center">
          <div style="font-size:13.5px;font-weight:700">Official Certificate Ready</div>
          <div class="mono" style="font-size:11.5px;color:var(--text-400);margin-top:3px">Hash: sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</div>
          <button class="btn btn-primary btn-sm mt-16" onclick="openCertificateModal('${t.id}','${b.id}')">View Official Certificate</button>
        </div>
      </div>
    `;
  }

  return '';
}

function recordOfficerDecision(tid, bid, status) {
  const note = document.getElementById('officerDecisionNote') ? document.getElementById('officerDecisionNote').value.trim() : '';
  const b = findBidder(bid);

  DECISIONS[tid + '::' + bid] = {
    status,
    note: note || (status === 'approved' ? 'Approved based on AI verification ground truth.' : status === 'clarification' ? 'Clarification issued for missing document.' : 'Disqualified due to statutory non-compliance.'),
    timestamp: new Date().toISOString(),
    officer: 'Smt. Priya Sharma'
  };
  saveDecisions();

  pushAudit({
    date: new Date().toLocaleString('en-IN'),
    bidder: b.company,
    requirement: 'Procurement Officer Decision',
    action: status === 'approved' ? 'Approved for Technicals' : status === 'clarification' ? 'Clarification Notice Issued' : 'Bidder Disqualified',
    source: 'Officer Evaluation Console',
    result: status === 'approved' ? 'PASS' : status === 'clarification' ? 'REVIEW' : 'FAIL',
    officer: 'Smt. Priya Sharma'
  });

  toast(`Decision recorded: ${status.toUpperCase()}`);
  viewBidder(tid, bid, 'decision');
}

// ============================================================
// 4. VERIFICATION QUEUE
// ============================================================
function renderVerificationQueue(filter = 'all') {
  let list = BIDDERS;
  if (filter === 'low') list = BIDDERS.filter(b => b.risk === 'LOW');
  else if (filter === 'medium') list = BIDDERS.filter(b => b.risk === 'MEDIUM');
  else if (filter === 'high') list = BIDDERS.filter(b => b.risk === 'HIGH');

  view.innerHTML = `
    ${breadcrumbs([{ label: 'Home', onclick: 'openDashboard()' }, { label: 'Verification Queue' }])}
    ${pageHead({
      eyebrow: 'Evaluation Queue',
      title: 'Bid Compliance Verification Queue',
      sub: 'Review pending bidder submissions and process verification approvals.',
      actions: `<button class="btn btn-accent" onclick="runBatchVerification()"><i data-icon="sparkle"></i>Verify All Pending Bids</button>`
    })}

    <!-- Filter Buttons -->
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <button class="btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="renderVerificationQueue('all')">All Submissions (${BIDDERS.length})</button>
      <button class="btn ${filter === 'low' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="renderVerificationQueue('low')">Low Risk (${BIDDERS.filter(b => b.risk === 'LOW').length})</button>
      <button class="btn ${filter === 'medium' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="renderVerificationQueue('medium')">Medium Risk (${BIDDERS.filter(b => b.risk === 'MEDIUM').length})</button>
      <button class="btn ${filter === 'high' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="renderVerificationQueue('high')">High Risk (${BIDDERS.filter(b => b.risk === 'HIGH').length})</button>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bidder ID</th>
              <th>Company Name</th>
              <th>Target Tender</th>
              <th>Score</th>
              <th>Risk Band</th>
              <th>Action Needed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(b => {
              const t = findTender(b.tenderId);
              const missing = b.results.filter(r => r.result === 'MISSING').map(r => r.label);
              const fails = b.results.filter(r => r.result === 'FAIL' || r.result === 'FLAGGED').map(r => r.label);
              return `
                <tr>
                  <td class="mono font-bold">${b.id}</td>
                  <td style="font-weight:700;color:var(--gem-navy)">${esc(b.company)}</td>
                  <td style="font-size:12px">${esc(t.title)}</td>
                  <td><span class="mono font-bold">${b.score}</span>/100</td>
                  <td><span class="pill ${riskPillClass(b.risk)}">${b.risk}</span></td>
                  <td style="font-size:12px;color:var(--text-600)">
                    ${fails.length ? `<span class="fail font-bold">Failed: ${fails.join(', ')}</span>` : missing.length ? `<span class="review font-bold">Missing: ${missing.join(', ')}</span>` : '<span class="pass">All verified</span>'}
                  </td>
                  <td>
                    <button class="btn btn-primary btn-xs" onclick="viewBidder('${t.id}','${b.id}','profile')">Evaluate &rarr;</button>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  renderIcons();
}

function runBatchVerification() {
  toast('Running 3-Mode AI Verification across all pending bids...');
  setTimeout(() => {
    toast('Batch verification complete. All bids synchronized.');
    renderVerificationQueue();
  }, 1000);
}

// ============================================================
// 5. AI VERIFICATION ENGINE & RANDOM FOREST MODEL (modal.txt)
// ============================================================
function renderMLModelPlayground() {
  const specs = ML_MODEL_SPECS;

  view.innerHTML = `
    ${breadcrumbs([{ label: 'Home', onclick: CURRENT_ROLE === 'bidder' ? 'openBidderSelfCheck()' : 'openDashboard()' }, { label: 'AI Verification Engine' }])}
    ${pageHead({
      eyebrow: 'GeM AI Core',
      title: 'Random Forest Bid Compliance Engine &amp; API Sandbox',
      sub: 'Trained on 200,000 GeM bid records with 99.82% classification accuracy and zero target leakage.',
      actions: `
        <button class="btn btn-outline" onclick="openApiInspectorModal('gst')"><i data-icon="code"></i>FastAPI Runner</button>
        <button class="btn btn-accent" onclick="runMLSimulation()"><i data-icon="sparkle"></i>Run Live Inference</button>
      `
    })}

    <!-- Model Stats KPI Grid -->
    <div class="kpi-grid mb-16">
      <div class="kpi-card">
        <div class="kpi-label">Algorithm</div>
        <div class="kpi-value" style="font-size:16px">Random Forest</div>
        <div class="kpi-delta up">100 Trees (Gini Impurity)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Test Accuracy</div>
        <div class="kpi-value" style="font-size:22px;color:var(--gem-green)">${specs.accuracy}%</div>
        <div class="kpi-delta up">40,000 test bids evaluated</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Weighted F1-Score</div>
        <div class="kpi-value" style="font-size:22px;color:var(--gem-green)">${specs.f1Score}%</div>
        <div class="kpi-delta up">Precision: 99.82% · Recall: 99.82%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Training Dataset Size</div>
        <div class="kpi-value" style="font-size:22px">${(specs.datasetSize).toLocaleString()}</div>
        <div class="kpi-delta up">200k synthetic GeM records</div>
      </div>
    </div>

    <!-- Live Interactive Prediction Playground -->
    <div class="card card-pad mb-16" style="background:linear-gradient(135deg,#0B2545 0%,#153E75 100%);color:#fff">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-size:16px;font-weight:800">Live AI Compliance Prediction Sandbox</div>
          <div style="font-size:12px;color:#CBD5E1">Adjust features to compute real-time probability distribution and risk classification.</div>
        </div>
        <span class="pill pill-pass" style="background:rgba(24,138,90,.3);color:#4ADE80;border-color:rgba(74,222,128,.5)">Engine: Active</span>
      </div>

      <div style="display:grid;grid-template-columns:1.15fr 1fr;gap:18px">
        <div style="display:flex;flex-direction:column;gap:10px;background:rgba(255,255,255,.06);padding:16px;border-radius:var(--radius-md);border:1px solid rgba(255,255,255,.12)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <label class="field" style="color:#CBD5E1">
              <span>Tender Category</span>
              <select id="mlInputCategory" style="background:#07192F;color:#fff;border-color:rgba(255,255,255,.2)" onchange="runMLSimulation()">
                <option value="IT & Computers">IT &amp; Computers</option>
                <option value="Construction">Construction</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Medical Equipment">Medical Equipment</option>
              </select>
            </label>

            <label class="field" style="color:#CBD5E1">
              <span>GSTIN Valid Status</span>
              <select id="mlInputGST" style="background:#07192F;color:#fff;border-color:rgba(255,255,255,.2)" onchange="runMLSimulation()">
                <option value="true">Active &amp; Valid</option>
                <option value="false">Invalid / Cancelled</option>
              </select>
            </label>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <label class="field" style="color:#CBD5E1">
              <span>PAN Valid Status</span>
              <select id="mlInputPAN" style="background:#07192F;color:#fff;border-color:rgba(255,255,255,.2)" onchange="runMLSimulation()">
                <option value="true">Valid Match</option>
                <option value="false">Mismatch / Not Found</option>
              </select>
            </label>

            <label class="field" style="color:#CBD5E1">
              <span>Udyam / MSME Status</span>
              <select id="mlInputUdyam" style="background:#07192F;color:#fff;border-color:rgba(255,255,255,.2)" onchange="runMLSimulation()">
                <option value="valid">Present &amp; Valid</option>
                <option value="expired">Present but Expired</option>
                <option value="none">Not Found</option>
              </select>
            </label>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <label class="field" style="color:#CBD5E1">
              <span>Document Verification</span>
              <select id="mlInputDocStatus" style="background:#07192F;color:#fff;border-color:rgba(255,255,255,.2)" onchange="runMLSimulation()">
                <option value="Verified">Verified</option>
                <option value="Pending">Pending Review</option>
                <option value="Rejected">Rejected</option>
              </select>
            </label>

            <label class="field" style="color:#CBD5E1">
              <span>Mismatch Detected</span>
              <select id="mlInputMismatch" style="background:#07192F;color:#fff;border-color:rgba(255,255,255,.2)" onchange="runMLSimulation()">
                <option value="None">None</option>
                <option value="GSTIN-PAN mismatch">GSTIN-PAN mismatch</option>
                <option value="Verification mismatch">Verification mismatch</option>
              </select>
            </label>
          </div>

          <button class="btn btn-accent btn-block mt-16" onclick="runMLSimulation()"><i data-icon="sparkle"></i> Re-Calculate AI Model Prediction</button>
        </div>

        <div id="mlInferenceOutputBox" class="ml-sim-box" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15)">
          <!-- Injected dynamically -->
        </div>
      </div>
    </div>

    <!-- Charts: Feature Importances & Confusion Matrix -->
    <div class="ml-dashboard-grid mb-16">
      <div class="card card-pad">
        <div style="font-size:13.5px;font-weight:700;color:var(--gem-navy);margin-bottom:6px;display:flex;justify-content:space-between">
          <span>Top Feature Importances (Random Forest)</span>
          <span class="conf-tag">Gini Weight</span>
        </div>
        <div class="fi-list">
          ${specs.topFeatures.slice(0, 8).map(f => `
            <div class="fi-item">
              <div class="fi-item-head">
                <span>${esc(f.name)} <span class="muted" style="font-size:10px">(${esc(f.desc)})</span></span>
                <span class="mono font-bold">${(f.importance * 100).toFixed(1)}%</span>
              </div>
              <div class="fi-bar-track">
                <div class="fi-bar-fill" style="width:${Math.min(100, f.importance * 350)}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card card-pad">
        <div style="font-size:13.5px;font-weight:700;color:var(--gem-navy);margin-bottom:6px;display:flex;justify-content:space-between">
          <span>Confusion Matrix Heatmap</span>
          <span class="conf-tag">40k Test Bids</span>
        </div>
        <table class="cm-table">
          <thead>
            <tr>
              <th>Actual \\ Pred</th>
              <th>Compliant</th>
              <th>Minor Issue</th>
              <th>Non-Compliant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th style="text-align:left">Compliant</th>
              <td class="cm-cell-match">${specs.confusionMatrix.matrix[0][0]}</td>
              <td class="cm-cell-error">${specs.confusionMatrix.matrix[0][1]}</td>
              <td class="cm-cell-error">${specs.confusionMatrix.matrix[0][2]}</td>
            </tr>
            <tr>
              <th style="text-align:left">Minor Issue</th>
              <td class="cm-cell-error">${specs.confusionMatrix.matrix[1][0]}</td>
              <td class="cm-cell-match">${specs.confusionMatrix.matrix[1][1]}</td>
              <td class="cm-cell-error">${specs.confusionMatrix.matrix[1][2]}</td>
            </tr>
            <tr>
              <th style="text-align:left">Non-Compliant</th>
              <td class="cm-cell-error">${specs.confusionMatrix.matrix[2][0]}</td>
              <td class="cm-cell-error">${specs.confusionMatrix.matrix[2][1]}</td>
              <td class="cm-cell-match">${specs.confusionMatrix.matrix[2][2]}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  renderIcons();
  runMLSimulation();
}

function runMLSimulation() {
  const cat = document.getElementById('mlInputCategory') ? document.getElementById('mlInputCategory').value : 'IT & Computers';
  const gstinValid = document.getElementById('mlInputGST') ? document.getElementById('mlInputGST').value === 'true' : true;
  const panValid = document.getElementById('mlInputPAN') ? document.getElementById('mlInputPAN').value === 'true' : true;
  const udyamChoice = document.getElementById('mlInputUdyam') ? document.getElementById('mlInputUdyam').value : 'valid';
  const docStatus = document.getElementById('mlInputDocStatus') ? document.getElementById('mlInputDocStatus').value : 'Verified';
  const mismatchType = document.getElementById('mlInputMismatch') ? document.getElementById('mlInputMismatch').value : 'None';

  const res = predictComplianceML({
    tender_category: cat,
    tender_value_inr: 5000000,
    turnover_required_inr: 3000000,
    gstin_valid: gstinValid,
    pan_valid: panValid,
    udyam_present: udyamChoice !== 'none',
    udyam_valid: udyamChoice === 'valid',
    document_type_flagged: 'None',
    document_status: docStatus,
    mismatch_type: mismatchType
  });

  const out = document.getElementById('mlInferenceOutputBox');
  if (out) {
    out.innerHTML = `
      <div style="font-size:11px;color:#CBD5E1;text-transform:uppercase;font-weight:700">Model Prediction Output</div>
      <div style="font-size:24px;font-weight:800;margin:4px 0;color:${res.prediction === 'compliant' ? '#4ADE80' : res.prediction === 'minor_issue' ? '#FFB84D' : '#F87171'}">
        ${res.prediction.toUpperCase()}
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <span class="pill ${riskPillClass(res.risk)}">${res.risk} RISK</span>
        <span class="conf-tag" style="background:rgba(255,255,255,.1);color:#CBD5E1;border:none">Confidence: ${res.confidence.toFixed(1)}%</span>
      </div>

      <div class="prob-meter-group">
        <div class="prob-meter-row">
          <span style="width:80px">Compliant</span>
          <div class="prob-meter-bar"><div class="prob-meter-fill" style="width:${res.probabilities.compliant}%;background:#4ADE80"></div></div>
          <span class="mono">${res.probabilities.compliant.toFixed(1)}%</span>
        </div>
        <div class="prob-meter-row">
          <span style="width:80px">Minor Issue</span>
          <div class="prob-meter-bar"><div class="prob-meter-fill" style="width:${res.probabilities.minor_issue}%;background:#FFB84D"></div></div>
          <span class="mono">${res.probabilities.minor_issue.toFixed(1)}%</span>
        </div>
        <div class="prob-meter-row">
          <span style="width:80px">Non-Compliant</span>
          <div class="prob-meter-bar"><div class="prob-meter-fill" style="width:${res.probabilities.non_compliant}%;background:#F87171"></div></div>
          <span class="mono">${res.probabilities.non_compliant.toFixed(1)}%</span>
        </div>
      </div>

      <div style="margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,.12);font-size:11.5px;color:#CBD5E1">
        <b>Recommendation:</b> ${esc(res.recommendation)}
      </div>
    `;
  }
}

// ============================================================
// 6. RISK & ANTI-COLLUSION HUB
// ============================================================
function renderRiskOverview() {
  const cartel = CARTEL_DETECTION_DATA;

  view.innerHTML = `
    ${breadcrumbs([{ label: 'Home', onclick: 'openDashboard()' }, { label: 'Risk & Anti-Collusion' }])}
    ${pageHead({
      eyebrow: 'Integrity Monitoring',
      title: 'Tender Risk &amp; Anti-Collusion Screening',
      sub: 'Automated screening for shared director DINs, synchronized IP submissions, and cover bidding patterns.',
      actions: `<button class="btn btn-outline" onclick="toast('Integrity report exported as CSV')"><i data-icon="download"></i>Export Report</button>`
    })}

    <div style="margin-bottom:18px">
      <div style="font-size:14px;font-weight:800;color:var(--gem-navy);margin-bottom:8px">Active Collusion &amp; Ring Bidding Alerts (${cartel.clustersDetected})</div>
      ${cartel.highRiskCartels.map(c => `
        <div class="cartel-card">
          <div class="cartel-header">
            <div>
              <div style="font-size:13.5px;font-weight:800;color:var(--gem-red)">🚨 ${esc(c.pattern)}</div>
              <div class="mono" style="font-size:11px;color:var(--text-600)">Cluster: ${c.id} · Tender: ${c.tenderId}</div>
            </div>
            <span class="pill pill-fail">${c.risk}</span>
          </div>
          <div style="font-size:12.5px;font-weight:700;margin-top:6px">Involved Bidders: ${c.bidders.join(' &middot; ')}</div>
          <div style="margin-top:6px">
            ${c.indicators.map(ind => `
              <div class="cartel-indicator">⚠ ${esc(ind)}</div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="card">
      <div class="card-head">
        <h3>High Risk Bidders Under Review</h3>
        <span class="conf-tag">Score &lt; 60</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bidder ID</th>
              <th>Company Name</th>
              <th>Tender Ref</th>
              <th>Score</th>
              <th>Flagged Issue</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${BIDDERS.filter(b => b.risk === 'HIGH').map(b => {
              const t = findTender(b.tenderId);
              const fails = b.results.filter(r => r.result === 'FAIL' || r.result === 'FLAGGED').map(r => r.reason);
              return `
                <tr>
                  <td class="mono font-bold">${b.id}</td>
                  <td style="font-weight:700">${esc(b.company)}</td>
                  <td style="font-size:12px">${esc(t.title)}</td>
                  <td><span class="mono font-bold fail">${b.score}</span>/100</td>
                  <td style="font-size:12px;color:var(--gem-red);max-width:320px">${fails.join('; ')}</td>
                  <td>
                    <button class="btn btn-danger btn-xs" onclick="viewBidder('${t.id}','${b.id}','profile')">Inspect &rarr;</button>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  renderIcons();
}

// ============================================================
// 7. TAMPER-EVIDENT AUDIT TRAIL
// ============================================================
function renderAudit() {
  const auditList = allAudit();

  view.innerHTML = `
    ${breadcrumbs([{ label: 'Home', onclick: 'openDashboard()' }, { label: 'Audit Trail' }])}
    ${pageHead({
      eyebrow: 'Cryptographic Ledger',
      title: 'Tamper-Evident GeM Verification Audit Trail',
      sub: 'Chronological immutable log of every OCR extraction, registry validation query, and officer decision.',
      actions: `<button class="btn btn-outline" onclick="toast('Audit trail exported as CSV')"><i data-icon="download"></i>Export CSV</button>`
    })}

    <div class="card mb-16">
      <div class="card-pad" style="background:#FAFBFD;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-weight:700">Audit Ledger Status: <span style="color:var(--gem-green)">● Verified Immutable</span></div>
          <div class="mono" style="font-size:11px;color:var(--text-400);margin-top:2px">Latest Block: 0x8b1a9953c4611296a827abf8c47804d7ecd3c4914a3875323a9d94943f5546b5</div>
        </div>
        <span class="pill pill-pass">SHA-256 Validated</span>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Bidder Name</th>
              <th>Requirement</th>
              <th>Activity / Mode</th>
              <th>Result</th>
              <th>Actor</th>
            </tr>
          </thead>
          <tbody>
            ${auditList.map(a => `
              <tr>
                <td class="mono" style="font-size:11.5px">${esc(a.date)}</td>
                <td style="font-weight:700">${esc(a.bidder)}</td>
                <td>${esc(a.requirement)}</td>
                <td style="font-size:12px;color:var(--text-600)">${esc(a.action)}</td>
                <td><span class="pill ${pillClassForResult(a.result)}">${a.result}</span></td>
                <td style="font-size:11.5px;color:var(--text-400)">${esc(a.officer)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  renderIcons();
}

// ============================================================
// 8. SELLER PRE-SUBMISSION PORTAL & TRUST PASSPORT
// ============================================================
function renderBidderSelfCheck() {
  view.innerHTML = `
    ${pageHead({
      eyebrow: 'GeM Seller Portal',
      title: 'Pre-Bid Compliance Auditor &amp; Readiness Diagnostic',
      sub: 'Check your technical documents against tender clauses before submission to avoid disqualification.',
      actions: `<button class="btn btn-accent" onclick="openUploadModal()"><i data-icon="upload"></i>Audit New Bid Package</button>`
    })}

    <div class="dash-grid mb-16">
      <div class="card card-pad" style="background:linear-gradient(135deg,#0B2545 0%,#153E75 100%);color:#fff">
        <div style="font-size:11px;color:var(--gem-gold);font-weight:700;text-transform:uppercase;letter-spacing:.06em">Digital Trust Identity</div>
        <div style="font-size:20px;font-weight:800;margin:4px 0">MedLine Mobility Systems Pvt. Ltd.</div>
        <div class="mono" style="font-size:12px;color:#CBD5E1">GSTIN: 33AABCM1234F1Z6 · Trust ID: TP-IND-TN-2026-8841</div>
        <div style="margin-top:16px;display:flex;gap:8px">
          <button class="btn btn-accent btn-sm" onclick="openTrustPassportModal('BID-10231')"><i data-icon="passport"></i>View Trust Passport</button>
          <button class="btn btn-outline btn-sm" style="color:#fff;background:transparent;border-color:rgba(255,255,255,.3)" onclick="openGeMRules()">View GeM Rules</button>
        </div>
      </div>

      <div class="card card-pad">
        <div style="font-size:13.5px;font-weight:700;margin-bottom:10px;color:var(--gem-navy)">Pre-Submission Diagnostic Checklist</div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px">
          <div style="display:flex;align-items:center;gap:8px;color:var(--gem-green)">
            <i data-icon="check" data-size="15"></i> <b>GSTN Status: Active &amp; Regular Taxpayer (10/10 Rating)</b>
          </div>
          <div style="display:flex;align-items:center;gap:8px;color:var(--gem-green)">
            <i data-icon="check" data-size="15"></i> <b>Udyam MSME: Valid Medium Enterprise</b>
          </div>
          <div style="display:flex;align-items:center;gap:8px;color:var(--gem-red)">
            <i data-icon="alert" data-size="15"></i> <b>OEM Authorization Letter (MAF) Missing — Upload required</b>
          </div>
          <div style="display:flex;align-items:center;gap:8px;color:var(--gem-amber)">
            <i data-icon="clock" data-size="15"></i> <b>Make in India: CA BOM certification advised for &gt; ₹10 Cr bids</b>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Tracked Submissions -->
    <div class="card">
      <div class="card-head">
        <h3>My Submitted &amp; Tracked GeM Bids</h3>
        <span class="muted">Live status</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bid Number</th>
              <th>Item Category &amp; Title</th>
              <th>Pre-Check Score</th>
              <th>Diagnostic Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="mono font-bold">GEM/2026/B/4471829</td>
              <td style="font-weight:700">Supply of Advanced Life Support Ambulances (Type-C)</td>
              <td><span class="mono font-bold">84/100</span> <span class="pill pill-medium">MEDIUM RISK</span></td>
              <td><span class="pill pill-fail">Upload OEM MAF Letter</span></td>
              <td>
                <button class="btn btn-outline btn-xs" onclick="viewBidder('GEM/2026/B/4471829','BID-10231','ocr')">View Diagnostic</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  renderIcons();
}

function renderTrustPassportView() {
  renderBidderSelfCheck();
  setTimeout(() => openTrustPassportModal('BID-10231'), 80);
}

function renderMySubmissions() {
  renderBidderSelfCheck();
}

function renderGeMRules() {
  view.innerHTML = `
    ${breadcrumbs([{ label: 'Home', onclick: CURRENT_ROLE === 'bidder' ? 'openBidderSelfCheck()' : 'openDashboard()' }, { label: 'GeM Rulebook' }])}
    ${pageHead({
      eyebrow: 'General Terms & Conditions',
      title: 'GeM GTC Statutory Compliance Guidelines',
      sub: 'Statutory public procurement norms, preference orders, and mandatory certificate guidelines.'
    })}

    <div class="card card-pad">
      <div class="stack" style="gap:18px">
        <div>
          <div style="font-size:14px;font-weight:800;color:var(--gem-navy)">1. Goods and Services Tax (GST) Compliance (Clause 3.1)</div>
          <div style="font-size:12.5px;color:var(--text-600);margin-top:3px">Bidders must possess an active, valid GSTIN in the State of delivery or principal place of business. Cancelled GSTINs result in instant technical rejection.</div>
        </div>
        <div>
          <div style="font-size:14px;font-weight:800;color:var(--gem-navy)">2. Public Procurement (Preference to Make in India) Order 2017 (Clause 6.1)</div>
          <div style="font-size:12.5px;color:var(--text-600);margin-top:3px">Class-I Local Suppliers require minimum 50% local value addition. Tenders exceeding ₹10 Crores legally require a statutory auditor/cost accountant certificate with UDIN.</div>
        </div>
        <div>
          <div style="font-size:14px;font-weight:800;color:var(--gem-navy)">3. Manufacturer Authorization Form / MAF (Clause 5.2)</div>
          <div style="font-size:12.5px;color:var(--text-600);margin-top:3px">Fabricators and resellers must submit an official Manufacturer Authorization Letter directly from the OEM on their official registered letterhead.</div>
        </div>
        <div>
          <div style="font-size:14px;font-weight:800;color:var(--gem-navy)">4. Micro and Small Enterprises (MSEs) Order 2012 Exemption</div>
          <div style="font-size:12.5px;color:var(--text-600);margin-top:3px">MSEs registered with active Udyam are exempt from Prior Turnover and Experience criteria, provided technical quality specifications are met.</div>
        </div>
      </div>
    </div>
  `;
  renderIcons();
}

// ============================================================
// 9. MODALS (OCR, PASSPORT, API PAYLOAD, CERTIFICATE, COMPARE)
// ============================================================
function openEvidenceModal(reqKey = 'gst', bidderId = 'BID-10231') {
  const ev = DOCUMENT_EVIDENCE[reqKey] || DOCUMENT_EVIDENCE['gst'];
  const bodyEl = document.getElementById('evidenceModalBody');

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="split-screen-grid">
        <div class="doc-viewport">
          <div class="doc-mock-paper">
            <div style="font-size:9.5px;font-weight:800;text-align:center;border-bottom:1px solid #CBD5E1;padding-bottom:5px;margin-bottom:8px">
              ${esc(ev.issuer)}<br>
              <span style="font-size:8px;color:#64748B">${esc(ev.docType)}</span>
            </div>

            ${ev.fields.map((f, idx) => `
              <div class="doc-bounding-box" id="bb_${idx}" style="top:${f.box.top};left:${f.box.left};width:${f.box.width};height:${f.box.height}" onclick="selectBoundingBox(${idx})">
                <span class="doc-bb-label">${esc(f.name.split(' ')[0])}</span>
              </div>
            `).join('')}

            <div style="font-family:var(--mono);font-size:8px;color:#475569;line-height:1.5;margin-top:10px">
              ${esc(ev.ocrSnippet).replace(/\n/g, '<br>')}
            </div>
          </div>
          <div style="margin-top:10px;font-size:11px;color:#94A3B8">Interactive OCR Bounding Boxes — Click to cross-verify</div>
        </div>

        <div class="field-inspector-list">
          <div style="font-size:13px;font-weight:800;color:var(--gem-navy);margin-bottom:2px">Extracted Fields vs Ground Truth</div>
          <div class="mono" style="font-size:10px;color:var(--text-400);margin-bottom:8px">Hash: ${esc(ev.hash)}</div>

          ${ev.fields.map((f, idx) => `
            <div class="field-card ${idx === 0 ? 'active' : ''}" id="field_card_${idx}" onclick="selectBoundingBox(${idx})">
              <div class="field-card-head">
                <span>${esc(f.name)}</span>
                <span class="pill ${pillClassForResult(f.status)}">${f.confidence}% CONF</span>
              </div>
              <div class="field-card-val">${esc(f.extracted)}</div>
              <div class="field-card-truth">
                <span class="muted">Registry Match:</span>
                <span style="font-weight:600;color:var(--gem-green)">${esc(f.groundTruth)}</span>
              </div>
            </div>
          `).join('')}

          <div style="margin-top:10px">
            <div style="font-size:11.5px;font-weight:700;color:var(--gem-navy);margin-bottom:4px">Raw OCR Stream:</div>
            <div class="raw-ocr-box">${esc(ev.ocrSnippet)}</div>
          </div>
        </div>
      </div>
    `;
  }

  openModal('evidenceModal');
}

function selectBoundingBox(idx) {
  document.querySelectorAll('.doc-bounding-box').forEach((bb, i) => {
    bb.classList.toggle('active', i === idx);
  });
  document.querySelectorAll('.field-card').forEach((fc, i) => {
    fc.classList.toggle('active', i === idx);
  });
}

function openTrustPassportModal(bidderId = 'BID-10231') {
  const b = findBidder(bidderId);
  const bodyEl = document.getElementById('trustPassportModalBody');

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="trust-passport-card">
        <div class="tp-head">
          <div>
            <div style="font-size:11px;color:var(--gem-gold);font-weight:700;text-transform:uppercase;letter-spacing:.06em">Official GeM Digital Bidder Trust Passport</div>
            <div class="tp-title">${esc(b.company)}</div>
            <div class="tp-id">Passport ID: ${esc(b.trustId || 'TP-IND-2026-8841')}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:10.5px;color:#CBD5E1">Trust Index</div>
            <div style="font-size:32px;font-weight:800;font-family:var(--mono);color:var(--gem-gold)">★ ${b.trustScore || 88}</div>
          </div>
        </div>

        <div class="tp-grid">
          ${(b.trustBadges || [
            { name: 'GSTN Verified', status: 'ACTIVE' },
            { name: 'MSME Valid', status: 'ACTIVE' },
            { name: 'Debarment Clear', status: 'CLEAN' },
            { name: 'ISO 9001:2015', status: 'VERIFIED' }
          ]).map(tb => `
            <div class="tp-badge-item">
              <div class="tp-badge-icon"><i data-icon="shield"></i></div>
              <div>
                <div class="tp-badge-name">${esc(tb.name)}</div>
                <div class="tp-badge-status">${esc(tb.status)}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="font-size:12px;line-height:1.55;color:#CBD5E1">
          <b>Entity Standing:</b> ${esc(b.category)} · Registered Place: ${esc(b.address)}
        </div>

        <div class="tp-foot">
          <div>Verifiable via QR Cryptographic Token · GeM Portal</div>
          <div class="conf-tag" style="background:rgba(255,255,255,.1);color:#fff;border:none">Validated: 2026-09-28</div>
        </div>
      </div>
    `;
  }

  openModal('trustPassportModal');
}

function openApiInspectorModal(key = 'gst') {
  const p = MOCK_API_PAYLOADS[key] || MOCK_API_PAYLOADS['gst'];
  const bodyEl = document.getElementById('apiInspectorModalBody');

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="stack" style="gap:12px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:13.5px;font-weight:700">${esc(p.source)}</div>
            <div class="mono" style="font-size:11px;color:var(--text-400)">${esc(p.endpoint)}</div>
          </div>
          <span class="pill pill-pass">${p.status} OK · ${p.responseTime}</span>
        </div>

        <div>
          <div style="font-size:11.5px;font-weight:700;margin-bottom:4px">Gateway Response (JSON Payload):</div>
          <div class="api-payload-box">${JSON.stringify(p.body, null, 2)}</div>
        </div>
      </div>
    `;
  }

  openModal('apiInspectorModal');
}

function openCertificateModal(tid, bid) {
  const t = findTender(tid);
  const b = findBidder(bid);
  const bodyEl = document.getElementById('printCertificateModalBody');

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="cert-doc">
        <div class="cert-header">
          <div class="cert-emblem">🏛️</div>
          <div class="cert-title">Government e-Marketplace (GeM)</div>
          <div class="cert-sub">Bid Compliance &amp; Verification Certificate</div>
        </div>

        <div class="cert-body">
          <p>This is to certify that the technical bid submission referenced below has undergone <b>3-Mode AI-Powered Compliance Verification</b> in accordance with GeM General Terms and Conditions (GTC).</p>

          <table style="width:100%;font-size:12px;border-collapse:collapse">
            <tr><td style="padding:5px 0;width:160px"><b>Bidder Legal Name:</b></td><td><b>${esc(b.company)}</b></td></tr>
            <tr><td style="padding:5px 0"><b>GSTIN / PAN:</b></td><td class="mono">${b.gstin} / ${b.pan}</td></tr>
            <tr><td style="padding:5px 0"><b>Bid Reference:</b></td><td class="mono">${t.id}</td></tr>
            <tr><td style="padding:5px 0"><b>Tender Title:</b></td><td>${esc(t.title)}</td></tr>
            <tr><td style="padding:5px 0"><b>Overall Compliance Score:</b></td><td><b style="color:var(--gem-green);font-size:14px">${b.score} / 100</b> (${b.risk} Risk)</td></tr>
            <tr><td style="padding:5px 0"><b>Digital Trust ID:</b></td><td class="mono">${b.trustId || 'TP-IND-2026-8841'}</td></tr>
          </table>

          <div style="padding:10px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:4px;font-size:11px">
            <b>Verification Summary:</b> All statutory registries (GSTN, Income Tax e-Filing, MSME Udyam, EPFO, and GeM Debarment Watchlist) have been cross-checked with automated OCR document ground truth.
          </div>
        </div>

        <div class="cert-stamp-box">
          <div>
            <div class="mono" style="font-size:9.5px;color:#64748B">Verification Hash: sha256:7f83b1657ff1fc53b92dc18148a1d65d</div>
            <div style="font-size:9.5px;color:#64748B">Timestamp: ${new Date().toUTCString()}</div>
          </div>
          <div class="cert-officer-stamp">
            ✓ DIGITALLY SIGNED &amp; APPROVED<br>
            <span style="font-weight:400">Smt. Priya Sharma · Procurement Officer</span>
          </div>
        </div>
      </div>
    `;
  }

  openModal('printCertificateModal');
}

function openCompareModal(tid = 'GEM/2026/B/4471829') {
  const t = findTender(tid);
  const bids = biddersForTender(t.id);
  const bodyEl = document.getElementById('compareModalBody');

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="font-size:12.5px;color:var(--text-600);margin-bottom:12px">
        Side-by-side criteria matrix for Tender <b>${t.id}</b> (${esc(t.title)}).
      </div>

      <div class="table-wrap">
        <table class="compare-table">
          <thead>
            <tr>
              <th style="width:180px">Criteria / Parameter</th>
              ${bids.map(b => `<th>${esc(b.company)}<br><span class="mono" style="font-weight:400;font-size:10.5px">${b.id}</span></th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Compliance Score</b></td>
              ${bids.map(b => `<td><b style="font-size:14px;color:${b.score >= 80 ? 'var(--gem-green)' : b.score >= 60 ? 'var(--gem-amber)' : 'var(--gem-red)'}">${b.score} / 100</b></td>`).join('')}
            </tr>
            <tr>
              <td><b>Risk Band</b></td>
              ${bids.map(b => `<td><span class="pill ${riskPillClass(b.risk)}">${b.risk}</span></td>`).join('')}
            </tr>
            <tr>
              <td><b>Quote Price</b></td>
              ${bids.map(b => `<td class="mono font-bold">${b.bidPrice || '—'}</td>`).join('')}
            </tr>
            <tr>
              <td><b>Trust Index</b></td>
              ${bids.map(b => `<td class="mono font-bold">★ ${b.trustScore || 85}</td>`).join('')}
            </tr>
            <tr>
              <td><b>GST Registration</b></td>
              ${bids.map(b => {
                const r = b.results.find(x => x.key === 'gst');
                return `<td><span class="pill ${r ? pillClassForResult(r.result) : 'pill-neutral'}">${r ? r.result : 'N/A'}</span></td>`;
              }).join('')}
            </tr>
            <tr>
              <td><b>PAN Verification</b></td>
              ${bids.map(b => {
                const r = b.results.find(x => x.key === 'pan');
                return `<td><span class="pill ${r ? pillClassForResult(r.result) : 'pill-neutral'}">${r ? r.result : 'N/A'}</span></td>`;
              }).join('')}
            </tr>
            <tr>
              <td><b>Udyam MSME Status</b></td>
              ${bids.map(b => {
                const r = b.results.find(x => x.key === 'udyam');
                return `<td><span class="pill ${r ? pillClassForResult(r.result) : 'pill-neutral'}">${r ? r.result : 'N/A'}</span></td>`;
              }).join('')}
            </tr>
            <tr>
              <td><b>OEM Authorization</b></td>
              ${bids.map(b => {
                const r = b.results.find(x => x.key === 'oem');
                return `<td><span class="pill ${r ? pillClassForResult(r.result) : 'pill-neutral'}">${r ? r.result : 'N/A'}</span></td>`;
              }).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  openModal('compareModal');
}

// ============================================================
// 10. UPLOAD & SIMULATE CUSTOM BID WIZARD
// ============================================================
function openUploadModal() {
  openModal('uploadBidModal');
}

function applyUploadPreset(preset) {
  const nameInput = document.getElementById('uploadCompanyName');
  const gstinInput = document.getElementById('uploadGSTIN');
  const panInput = document.getElementById('uploadPAN');
  const udyamInput = document.getElementById('uploadUdyam');

  if (preset === 'compliant') {
    if (nameInput) nameInput.value = 'Bharat MediTech Solutions Pvt Ltd';
    if (gstinInput) gstinInput.value = '33AABCB9941L1Z4';
    if (panInput) panInput.value = 'AABCB9941L';
    if (udyamInput) udyamInput.value = 'UDYAM-TN-02-0009912';
  } else if (preset === 'minor_issue') {
    if (nameInput) nameInput.value = 'Apex Health Care Supplies LLP';
    if (gstinInput) gstinInput.value = '33AAICA1192M1Z2';
    if (panInput) panInput.value = 'AAICA1192M';
    if (udyamInput) udyamInput.value = 'UDYAM-TN-02-0044129';
  } else if (preset === 'non_compliant') {
    if (nameInput) nameInput.value = 'Shadow Corp Infrastructure Ltd';
    if (gstinInput) gstinInput.value = '19AABCS0000P1Z1';
    if (panInput) panInput.value = 'AABCS0000P';
    if (udyamInput) udyamInput.value = 'NOT_FOUND';
  }
}

function runCustomBidSimulation() {
  const tid = document.getElementById('uploadTargetTender') ? document.getElementById('uploadTargetTender').value : TENDERS[0].id;
  const company = document.getElementById('uploadCompanyName') ? document.getElementById('uploadCompanyName').value : 'Apex Health Logistics India Pvt Ltd';
  const gstin = document.getElementById('uploadGSTIN') ? document.getElementById('uploadGSTIN').value : '33AAPCA9921K1Z2';
  const pan = document.getElementById('uploadPAN') ? document.getElementById('uploadPAN').value : 'AAPCA9921K';
  const udyam = document.getElementById('uploadUdyam') ? document.getElementById('uploadUdyam').value : 'UDYAM-TN-02-0019284';

  const bodyEl = document.getElementById('uploadBidModalBody');
  const footEl = document.getElementById('uploadBidModalFoot');

  if (footEl) footEl.innerHTML = '';

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="padding:24px;text-align:center">
        <div style="font-size:15px;font-weight:800;color:var(--gem-navy);margin-bottom:10px">Executing 3-Mode Verification Pipeline</div>
        <div id="simStep1" style="font-size:12.5px;color:var(--gem-blue);margin-bottom:6px">1. Ingesting Document Package &amp; Running OCR Ground Truth Extraction...</div>
        <div id="simStep2" style="font-size:12.5px;color:var(--text-400);margin-bottom:6px">2. Querying Live GSTN, Udyam, EPFO &amp; IT Gateways...</div>
        <div id="simStep3" style="font-size:12.5px;color:var(--text-400)">3. Evaluating Random Forest Model &amp; Generating Certificate...</div>
      </div>
    `;
  }

  setTimeout(() => {
    const s2 = document.getElementById('simStep2');
    if (s2) { s2.style.color = 'var(--gem-blue)'; s2.innerHTML = '✓ Mode 1 OCR Complete. Querying Live GSTN, Udyam, EPFO &amp; IT Gateways...'; }
  }, 500);

  setTimeout(() => {
    const s3 = document.getElementById('simStep3');
    if (s3) { s3.style.color = 'var(--gem-blue)'; s3.innerHTML = '✓ Mode 2 Registry Matches Verified. Computing Compliance Decision...'; }
  }, 1000);

  setTimeout(() => {
    const newBidId = 'BID-' + Math.floor(10000 + Math.random() * 90000);
    const newBid = {
      id: newBidId,
      tenderId: tid,
      company: company,
      gstin: gstin,
      pan: pan,
      udyam: udyam,
      cin: 'U85100TN2020PTC128456',
      score: 92,
      risk: 'LOW',
      status: 'Under Review',
      submittedOn: new Date().toISOString().split('T')[0],
      trustId: 'TP-IND-TN-2026-' + Math.floor(1000 + Math.random() * 9000),
      trustScore: 94,
      establishedYear: 2020,
      address: 'Guindy Industrial Estate, Chennai, Tamil Nadu - 600032',
      category: 'Small Enterprise (MSME)',
      bidPrice: '₹17.20 Cr',
      directors: [
        { name: 'Dr. S. K. Narayanan', din: '08129012', designation: 'Managing Director', status: 'ACTIVE / VERIFIED' }
      ],
      turnoverHistory: [
        { fy: 'FY 2023-24', amount: '₹8.40 Cr', status: 'Audited & Filed' },
        { fy: 'FY 2024-25', amount: '₹9.10 Cr', status: 'Audited & Filed' },
        { fy: 'FY 2025-26', amount: '₹9.80 Cr', status: 'Audited & Filed' }
      ],
      results: [
        req('gst', 'PASS', 'GST_REG06.pdf', 'GSTIN active & regular taxpayer.', 98),
        req('pan', 'PASS', 'PAN_Card.pdf', 'PAN match verified.', 99),
        req('udyam', 'PASS', 'Udyam_Certificate.pdf', 'Valid Udyam Small Enterprise.', 96),
        req('itr', 'PASS', 'ITR_3Years.pdf', '3 consecutive years verified.', 95),
        req('oem', 'PASS', 'OEM_Authorization.pdf', 'Valid MAF letter attached.', 94),
        req('mii', 'PASS', 'MII_Declaration.pdf', 'Make in India Class-1 confirmed.', 95),
        req('epfo', 'PASS', 'EPFO_ECR.pdf', 'EPFO regular contributor.', 97),
        req('experience', 'PASS', 'WorkOrders.pdf', 'Meets experience thresholds.', 92),
        req('turnover', 'PASS', 'Financials.pdf', 'Turnover meets requirements.', 94),
        req('blacklist', 'CLEAR', 'GeM Debarment List', 'Clean debarment record.', 99)
      ]
    };

    BIDDERS.unshift(newBid);

    pushAudit({
      date: new Date().toLocaleString('en-IN'),
      bidder: company,
      requirement: 'AI Ingestion Pipeline',
      action: '3-Mode Verification Executed',
      source: 'Ingestion Wizard',
      result: 'PASS',
      officer: 'System (AI Engine)'
    });

    closeModal('uploadBidModal');
    toast(`Bid verified for ${company}! Overall Score: 92/100`);
    viewBidder(tid, newBidId, 'profile');
  }, 1500);
}

// ============================================================
// 11. GLOBAL SEARCH
// ============================================================
function setupGlobalSearch() {
  const input = document.getElementById('global-search');
  const resultsBox = document.getElementById('global-search-results');
  if (!input || !resultsBox) return;

  input.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    if (!q || q.length < 2) {
      resultsBox.classList.add('hidden');
      return;
    }

    let matches = [];

    TENDERS.forEach(t => {
      if (t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.org.toLowerCase().includes(q)) {
        matches.push({
          type: 'Tender',
          title: t.title,
          sub: `${t.id} · ${t.org}`,
          action: () => viewTender(t.id)
        });
      }
    });

    BIDDERS.forEach(b => {
      if (b.company.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.gstin.toLowerCase().includes(q) || b.pan.toLowerCase().includes(q)) {
        matches.push({
          type: 'Bidder',
          title: b.company,
          sub: `ID: ${b.id} · GSTIN: ${b.gstin} · Score: ${b.score}/100`,
          action: () => viewBidder(b.tenderId, b.id, 'profile')
        });
      }
    });

    if (matches.length === 0) {
      resultsBox.innerHTML = `<div style="padding:12px;font-size:11.5px;color:var(--text-400);text-align:center">No records found.</div>`;
    } else {
      resultsBox.innerHTML = matches.slice(0, 5).map((m, idx) => `
        <div class="search-dropdown-item" onclick="window.__searchActions[${idx}](); closeGlobalSearch();">
          <div>
            <div class="s-item-title">${esc(m.title)}</div>
            <div class="s-item-sub">${esc(m.sub)}</div>
          </div>
          <span class="pill pill-open" style="font-size:10px">${m.type}</span>
        </div>
      `).join('');
      window.__searchActions = matches.map(m => m.action);
    }

    resultsBox.classList.remove('hidden');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.topbar-search-wrap')) {
      closeGlobalSearch();
    }
  });
}

function closeGlobalSearch() {
  const resultsBox = document.getElementById('global-search-results');
  if (resultsBox) resultsBox.classList.add('hidden');
}

// ============================================================
// 12. BOOTSTRAP
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginScreen = document.getElementById('login-screen');
  const appShell = document.getElementById('app-shell');

  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const roleInput = document.getElementById('login-role');
      const selectedRole = roleInput ? roleInput.value : 'officer';
      CURRENT_ROLE = selectedRole;

      loginScreen.classList.add('hidden');
      appShell.classList.remove('hidden');

      updateNavbar();
      setupGlobalSearch();

      if (selectedRole === 'bidder') {
        openBidderSelfCheck();
      } else {
        openDashboard();
      }
    });
  }

  refreshCaptcha();
  renderIcons();
});
