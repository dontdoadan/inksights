const state = {
  view: 'overview',
  studios: [],
  selectedStudioId: null,
  growth: null,
  audit: null
};

const view = document.querySelector('#view');
const title = document.querySelector('#page-title');
const nav = document.querySelector('#nav');
const studioSelect = document.querySelector('#studio-select');
const toast = document.querySelector('#toast');

const labels = {
  overview: 'Overview',
  studios: 'Studios',
  growth: 'Growth Check',
  audit: 'Intelligence Audit',
  evidence: 'Evidence & Metrics',
  findings: 'Findings / Diagnosis',
  recommendations: 'Recommendations',
  interventions: 'Interventions & Outcomes',
  reports: 'Reports',
  scenarios: 'Scenarios',
  connectors: 'Connectors',
  events: 'Event Log',
  safety: 'Settings / Safety'
};

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
};

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 2600);
}

function money(value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value || 0);
}

function chip(text, tone = '') {
  return '<span class="chip ' + tone + '">' + text + '</span>';
}

function card(label, value, foot = '') {
  return '<div class="card"><div class="kpi-label">' + label + '</div><div class="kpi-value">' + value + '</div><div class="kpi-foot">' + foot + '</div></div>';
}

function selectedStudio() {
  return state.studios.find((studio) => studio.id === state.selectedStudioId) || state.studios[0];
}

async function init() {
  state.studios = await api('/api/studios');
  state.selectedStudioId = state.studios[0]?.id || null;
  studioSelect.innerHTML = state.studios.map((studio) => '<option value="' + studio.id + '">' + studio.name + ' · SYNTHETIC</option>').join('');
  studioSelect.value = state.selectedStudioId;
  await render();
}

nav.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-view]');
  if (!button) return;
  state.view = button.dataset.view;
  nav.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
  await render();
});

studioSelect.addEventListener('change', async () => {
  state.selectedStudioId = studioSelect.value;
  state.growth = null;
  state.audit = null;
  await render();
});

document.querySelector('#refresh').addEventListener('click', async () => {
  state.studios = await api('/api/studios');
  await render();
  showToast('Sandbox refreshed');
});

async function render() {
  title.textContent = labels[state.view] || 'INKSIGHTS Sandbox';
  const renderers = {
    overview: renderOverview,
    studios: renderStudios,
    growth: renderGrowth,
    audit: renderAudit,
    evidence: renderEvidence,
    findings: renderFindings,
    recommendations: renderRecommendations,
    interventions: renderInterventions,
    reports: renderReports,
    scenarios: renderScenarios,
    connectors: renderConnectors,
    events: renderEvents,
    safety: renderSafety
  };
  view.innerHTML = '<div class="card">Loading synthetic sandbox state…</div>';
  try {
    await renderers[state.view]();
  } catch (error) {
    view.innerHTML = '<div class="card"><h2>Sandbox error</h2><p>' + error.message + '</p></div>';
  }
}

async function ensureGrowth() {
  if (state.growth) return state.growth;
  state.growth = await api('/api/growth-check', {
    method: 'POST',
    body: JSON.stringify({ studioId: state.selectedStudioId })
  });
  return state.growth;
}

async function ensureAudit() {
  if (state.audit) return state.audit;
  state.audit = await api('/api/audit', {
    method: 'POST',
    body: JSON.stringify({ studioId: state.selectedStudioId })
  });
  return state.audit;
}

async function renderOverview() {
  const data = await api('/api/overview');
  const testsPassed = data.safety_tests.filter((item) => item.status === 'PASS').length;
  view.innerHTML =
    '<div class="banner"><strong>Safety boundary active.</strong> This environment contains synthetic records only and has no production adapters.</div>' +
    '<div class="grid kpis">' +
      card('Synthetic studios', data.studios, 'Fixture records only') +
      card('Active scenario', data.active_scenario, 'Scenario engine') +
      card('Safety tests', testsPassed + '/' + data.safety_tests.length, 'Runtime policy checks') +
      card('Generated reports', data.reports, 'Watermarked local HTML') +
    '</div>' +
    '<div class="section-title"><h2>Connector readiness</h2>' + chip('OFF BY DEFAULT', 'warn') + '</div>' +
    '<div class="grid two">' +
      Object.entries(data.connector_readiness).map(([name, item]) =>
        '<div class="card"><div class="row"><h3>' + name.toUpperCase() + '</h3>' + chip(item.safe ? (item.ready ? 'READY' : 'SAFE / OFF') : 'UNSAFE', item.safe ? 'green' : 'red') + '</div><p>' + item.reason + '</p></div>'
      ).join('') +
    '</div>' +
    '<div class="section-title"><h2>Latest event log</h2></div>' +
    eventTable(data.latest_events);
}

async function renderStudios() {
  view.innerHTML =
    '<div class="card"><div class="row"><div><h2>Synthetic studio registry</h2><p>Fixture records used to validate qualification, diagnostics and reporting.</p></div>' + chip('SYNTHETIC', 'green') + '</div>' +
    '<table><thead><tr><th>Studio</th><th>City</th><th>Artists</th><th>ICP</th><th>Website</th><th>Booking</th><th>Contact</th></tr></thead><tbody>' +
    state.studios.map((studio) =>
      '<tr><td><strong>' + studio.name + '</strong><br>' + chip('SYNTHETIC', 'green') + '</td><td>' + studio.city + '</td><td>' + studio.artists + '</td><td><strong>' + studio.icp.score + '/100</strong><div class="meter"><span style="width:' + studio.icp.score + '%"></span></div></td><td>' + studio.website_score + '/100</td><td>' + (studio.manual_booking ? 'Manual / DM' : 'Structured') + '</td><td class="mono">' + studio.contact_email + '</td></tr>'
    ).join('') +
    '</tbody></table></div>';
}

async function renderGrowth() {
  const studio = selectedStudio();
  const result = await ensureGrowth();
  view.innerHTML =
    '<div class="grid two">' +
      '<div class="card"><div class="row"><h2>' + studio.name + '</h2>' + chip('SYNTHETIC', 'green') + '</div><p>Fast indicative diagnostic using fixture inputs.</p><div class="actions"><button class="action" id="rerun-growth">Run Growth Check</button><button class="secondary" id="growth-report">Generate report</button></div></div>' +
      '<div class="card"><div class="kpi-label">ICP SCORE</div><div class="kpi-value">' + result.icp.score + '/100</div><div class="meter"><span style="width:' + result.icp.score + '%"></span></div></div>' +
    '</div>' +
    (result.warning ? '<div class="banner"><strong>' + result.warning + '</strong> — evidence completeness is intentionally degraded by the active scenario.</div>' : '') +
    '<div class="section-title"><h2>Primary diagnosis</h2>' + chip(result.primary_constraint.toUpperCase(), 'warn') + '</div>' +
    '<div class="grid two"><div class="card"><h3>Finding</h3><p>' + result.finding + '</p></div><div class="card"><h3>Diagnosis</h3><p>' + result.diagnosis + '</p></div></div>' +
    '<div class="section-title"><h2>Top opportunities</h2></div>' +
    '<div class="grid three">' + result.opportunities.map((item) => '<div class="card"><div class="row"><h3>' + item.title + '</h3>' + chip(item.impact, item.impact === 'HIGH' ? 'warn' : '') + '</div><p>' + item.recommendation + '</p><div class="kpi-foot">' + item.evidence + '</div></div>').join('') + '</div>' +
    '<div class="section-title"><h2>Calculated metrics</h2></div>' + metricsTable(result.metrics);

  document.querySelector('#rerun-growth').onclick = async () => {
    state.growth = await api('/api/growth-check', { method: 'POST', body: JSON.stringify({ studioId: state.selectedStudioId, idempotencyKey: 'growth:' + Date.now() }) });
    await renderGrowth();
    showToast('Growth Check completed');
  };
  document.querySelector('#growth-report').onclick = () => createReport('growth_check');
}

async function renderAudit() {
  const studio = selectedStudio();
  const result = await ensureAudit();
  view.innerHTML =
    '<div class="card"><div class="row"><div><h2>' + studio.name + ' · Studio Intelligence Audit</h2><p>Full synthetic audit workspace.</p></div>' + chip('COMPLETE', 'green') + '</div><div class="actions"><button class="action" id="rerun-audit">Run audit</button><button class="secondary" id="audit-report">Generate report</button></div></div>' +
    '<div class="section-title"><h2>Audit sections</h2></div>' +
    '<div class="grid two">' + Object.entries(result.sections).map(([key, item]) =>
      '<div class="card"><div class="row"><h3>' + key.replaceAll('_', ' ') + '</h3>' + chip(item.evidence, item.evidence === 'CALCULATED' ? 'green' : '') + '</div><div class="kpi-value">' + item.score + '/100</div><div class="meter"><span style="width:' + item.score + '%"></span></div><p>' + item.summary + '</p></div>'
    ).join('') + '</div>' +
    '<div class="section-title"><h2>90-day action plan</h2></div><div class="grid three">' +
    result.action_plan_90_days.map((item) => '<div class="card"><h3>' + item.period + '</h3><p>' + item.action + '</p></div>').join('') + '</div>' +
    '<div class="section-title"><h2>Reasoning lineage</h2></div><div class="card"><div class="pipeline">' +
    result.lineage.stages.map((stage, index) => '<span><b>' + (index + 1) + '</b>' + stage + '</span>').join('') + '</div></div>';

  document.querySelector('#rerun-audit').onclick = async () => {
    state.audit = await api('/api/audit', { method: 'POST', body: JSON.stringify({ studioId: state.selectedStudioId, idempotencyKey: 'audit:' + Date.now() }) });
    await renderAudit();
    showToast('Intelligence Audit completed');
  };
  document.querySelector('#audit-report').onclick = () => createReport('audit');
}

async function renderEvidence() {
  const growth = await ensureGrowth();
  view.innerHTML =
    '<div class="card"><h2>Evidence lineage</h2><p>Each conclusion remains traceable to its synthetic observation and evidence class.</p><div class="pipeline">' +
      ['Provider Observation','Normalised Data','Metric','Evidence','Finding','Diagnosis','Opportunity','Recommendation','Intervention','Outcome','Attribution','Learning'].map((stage, i) => '<span><b>' + (i + 1) + '</b>' + stage + '</span>').join('') +
    '</div></div>' +
    '<div class="section-title"><h2>Evidence classes</h2></div><div class="grid three">' +
    growth.evidence.map((item) => '<div class="card"><div>' + chip(item.label, item.label === 'CALCULATED' ? 'green' : '') + '</div><p>' + item.statement + '</p></div>').join('') +
    '</div><div class="section-title"><h2>KPI dictionary output</h2></div>' + metricsTable(growth.metrics);
}

async function renderFindings() {
  const growth = await ensureGrowth();
  view.innerHTML =
    '<div class="grid two"><div class="card"><div class="kpi-label">PRIMARY CONSTRAINT</div><div class="kpi-value">' + growth.primary_constraint.replaceAll('_', ' ') + '</div></div>' +
    '<div class="card"><div class="kpi-label">EVIDENCE CONFIDENCE</div><div class="kpi-value">Synthetic</div><div class="kpi-foot">Directional test data only</div></div></div>' +
    '<div class="section-title"><h2>Finding</h2></div><div class="card"><p>' + growth.finding + '</p></div>' +
    '<div class="section-title"><h2>Diagnosis</h2></div><div class="card"><p>' + growth.diagnosis + '</p></div>';
}

async function renderRecommendations() {
  const audit = await ensureAudit();
  view.innerHTML = '<div class="card"><h2>Recommendation backlog</h2><table><thead><tr><th>Priority</th><th>Recommendation</th><th>Expected impact</th><th>Effort</th><th>Evidence</th></tr></thead><tbody>' +
    audit.recommendations.map((item) => '<tr><td>' + item.priority + '</td><td><strong>' + item.title + '</strong></td><td>' + item.expected_impact + '</td><td>' + item.effort + '</td><td>' + chip(item.evidence, item.evidence === 'CALCULATED' ? 'green' : '') + '</td></tr>').join('') +
    '</tbody></table></div>';
}

async function renderInterventions() {
  const audit = await ensureAudit();
  view.innerHTML =
    '<div class="card"><div class="row"><div><h2>Intervention & outcome simulation</h2><p>No client action occurs. This models the measurement loop only.</p></div>' + chip('SIMULATION', 'warn') + '</div>' +
    '<div class="grid two"><div><h3>Intervention</h3><p>' + audit.recommendations[0].title + '</p><div class="kpi-foot">Status: READY_TO_SIMULATE</div></div>' +
    '<div><h3>Outcome / attribution</h3><p>Run a scenario to test conclusive or inconclusive attribution handling.</p><div class="kpi-foot">Confidence: NOT_MEASURED</div></div></div></div>';
}

async function renderReports() {
  const reports = await api('/api/reports');
  view.innerHTML =
    '<div class="card"><div class="row"><div><h2>Synthetic reports</h2><p>Every generated report is locally stored and permanently watermarked.</p></div>' + chip('NOT FOR CLIENT USE', 'warn') + '</div><div class="actions"><button class="action" id="make-growth-report">Growth Check report</button><button class="secondary" id="make-audit-report">Audit report</button></div></div>' +
    '<div class="section-title"><h2>Generated reports</h2></div>' +
    (reports.length ? '<div class="card"><table><thead><tr><th>ID</th><th>Studio</th><th>Type</th><th>Created</th><th>Preview</th></tr></thead><tbody>' +
      reports.map((report) => '<tr><td class="mono">' + report.id + '</td><td>' + report.studio_id + '</td><td>' + report.report_type + '</td><td>' + report.created_at + '</td><td><a class="link" target="_blank" href="/reports/' + report.id + '">Open</a></td></tr>').join('') +
      '</tbody></table></div>' : '<div class="card empty">No reports generated yet.</div>');

  document.querySelector('#make-growth-report').onclick = () => createReport('growth_check');
  document.querySelector('#make-audit-report').onclick = () => createReport('audit');
}

async function createReport(type) {
  try {
    const report = await api('/api/reports', { method: 'POST', body: JSON.stringify({ studioId: state.selectedStudioId, reportType: type }) });
    showToast('Synthetic report generated');
    window.open(report.preview_url, '_blank', 'noopener');
    if (state.view === 'reports') await renderReports();
  } catch (error) {
    showToast(error.message);
  }
}

async function renderScenarios() {
  const data = await api('/api/scenarios');
  view.innerHTML =
    '<div class="card"><div class="row"><div><h2>Scenario engine</h2><p>Run repeatable failure and edge cases without external side effects.</p></div>' + chip('ACTIVE: ' + data.active.toUpperCase(), 'warn') + '</div></div>' +
    '<div class="section-title"><h2>Available scenarios</h2></div><div class="grid three">' +
    data.available.map((name) => '<div class="card"><h3>' + name.replaceAll('_', ' ') + '</h3><p>Repeatable synthetic workflow state.</p><button class="action scenario" data-name="' + name + '">Run scenario</button></div>').join('') +
    '</div>';

  document.querySelectorAll('.scenario').forEach((button) => {
    button.onclick = async () => {
      const result = await api('/api/scenarios/' + button.dataset.name, { method: 'POST', body: '{}' });
      state.growth = null;
      state.audit = null;
      showToast(result.detail);
      await renderScenarios();
    };
  });
}

async function renderConnectors() {
  const data = await api('/api/connectors');
  view.innerHTML =
    '<div class="banner"><strong>All external connectors are test/local-only and disabled by default.</strong> The sandbox remains fully usable with every connector unconfigured.</div>' +
    '<div class="grid two">' + data.cards.map((item) => {
      const key = item.name.toLowerCase().startsWith('stripe') ? 'stripe' :
        item.name.toLowerCase().startsWith('hubspot') ? 'hubspot' :
        item.name.toLowerCase().startsWith('local supabase') ? 'supabase' :
        item.name.toLowerCase().startsWith('local n8n') ? 'n8n' : null;
      const ready = key ? data.readiness[key] : { safe: true, ready: true, reason: item.detail };
      return '<div class="card"><div class="row"><h3>' + item.name + '</h3>' + chip(ready.ready ? 'READY' : item.status, ready.safe ? 'green' : 'red') + '</div><p>' + ready.reason + '</p><div class="kpi-foot">Mode: ' + item.mode + '</div><div class="actions"><button class="secondary connector-sim" data-name="' + item.name + '">Simulate action</button></div></div>';
    }).join('') + '</div>';

  document.querySelectorAll('.connector-sim').forEach((button) => {
    button.onclick = async () => {
      if (!confirm('This will simulate a connector action only. No external request will be sent. Continue?')) return;
      await api('/api/connectors/simulate', { method: 'POST', body: JSON.stringify({ name: button.dataset.name }) });
      showToast('Connector action simulated');
    };
  });
}

async function renderEvents() {
  const events = await api('/api/events');
  view.innerHTML = '<div class="card"><div class="row"><div><h2>Immutable-style sandbox event log</h2><p>Scenario events, blocked actions and generated artefacts.</p></div>' + chip(events.length + ' EVENTS') + '</div></div><div class="section-title"><h2>Timeline</h2></div>' + eventTable(events);
}

function eventTable(events) {
  if (!events.length) return '<div class="card empty">No events yet.</div>';
  return '<div class="card"><table><thead><tr><th>ID</th><th>Event</th><th>Time</th><th>Idempotency</th><th>Payload</th></tr></thead><tbody>' +
    events.map((event) => '<tr><td>' + event.id + '</td><td><strong>' + event.event_type + '</strong></td><td>' + event.created_at + '</td><td class="mono">' + (event.idempotency_key || '—') + '</td><td class="mono">' + JSON.stringify(event.payload) + '</td></tr>').join('') +
    '</tbody></table></div>';
}

async function renderSafety() {
  const tests = await api('/api/safety-tests');
  view.innerHTML =
    '<div class="grid two">' +
      '<div class="card"><div class="kpi-label">APP_ENV</div><div class="kpi-value">sandbox</div><div class="kpi-foot">Fixed runtime boundary</div></div>' +
      '<div class="card"><div class="kpi-label">PRODUCTION ACCESS</div><div class="kpi-value">Blocked</div><div class="kpi-foot">No production adapters exist in v1</div></div>' +
    '</div>' +
    '<div class="section-title"><h2>Safety tests</h2></div><div class="grid two">' +
      tests.map((item) => '<div class="card"><div class="row"><h3>' + item.name + '</h3>' + chip(item.status, item.status === 'PASS' ? 'green' : 'red') + '</div>' + (item.detail ? '<p>' + item.detail + '</p>' : '') + '</div>').join('') +
    '</div>' +
    '<div class="section-title"><h2>Hard blocks</h2></div><div class="card"><ul class="muted"><li>Canonical production Supabase project ukaxsqwnkoqbbsufpzga</li><li>Hosted *.supabase.co endpoints</li><li>Stripe sk_live_* and livemode=true</li><li>Non-test HubSpot modes and blocked portal IDs</li><li>Non-reserved contact email domains</li><li>External email delivery</li></ul><div class="actions"><button class="secondary" id="reset-sandbox">Reset sandbox data</button></div></div>';

  document.querySelector('#reset-sandbox').onclick = async () => {
    if (!confirm('Reset all local sandbox records, generated report references and scenario state?')) return;
    await api('/api/reset', { method: 'POST', body: '{}' });
    state.studios = await api('/api/studios');
    state.selectedStudioId = state.studios[0].id;
    studioSelect.value = state.selectedStudioId;
    state.growth = null;
    state.audit = null;
    showToast('Sandbox reset');
    await renderSafety();
  };
}

function metricsTable(metrics) {
  return '<div class="card"><table><thead><tr><th>Metric</th><th>Value</th><th>Evidence</th></tr></thead><tbody>' +
    Object.entries(metrics).map(([key, value]) => '<tr><td>' + key.replaceAll('_', ' ') + '</td><td><strong>' + (key === 'revenue' || key === 'average_booking_value' || key === 'ltv' || key === 'revenue_per_available_hour' || key === 'contribution' ? money(value) : value) + '</strong></td><td>' + chip('CALCULATED', 'green') + '</td></tr>').join('') +
    '</tbody></table></div>';
}

init().catch((error) => {
  view.innerHTML = '<div class="card"><h2>Unable to initialise sandbox</h2><p>' + error.message + '</p></div>';
});
