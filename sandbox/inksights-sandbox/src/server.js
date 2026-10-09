import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  openDatabase, resetDatabase, getStudios, getStudio, appendEvent, listEvents,
  listReports, getReport, listOutbox, captureEmail, listConnectors, getState
} from './db.js';
import { assertSandboxEnv, assertSyntheticStudio, runSafetyTests, validateStripeConfig, validateSupabaseConfig, validateHubSpotConfig, validateN8nConfig } from './safety.js';
import { buildGrowthCheck, buildAudit, calculateIcpScore } from './domain.js';
import { runScenario, getActiveScenario, SCENARIOS } from './scenarios.js';
import { generateReport } from './reports.js';

assertSandboxEnv();
const db = openDatabase();
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4173);
const root = resolve(fileURLToPath(new URL('../public/', import.meta.url)));

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body, null, 2));
}

async function body(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function notFound(res) {
  json(res, 404, { error: 'Not found' });
}

function connectorReadiness() {
  const blockedPortalIds = (process.env.BLOCKED_HUBSPOT_PORTAL_IDS || '148925665').split(',').filter(Boolean);
  return {
    stripe: validateStripeConfig({
      mode: process.env.STRIPE_CONNECTOR_MODE || 'off',
      secretKey: process.env.STRIPE_TEST_SECRET_KEY,
      priceId: process.env.STRIPE_TEST_PRICE_ID,
      webhookSecret: process.env.STRIPE_TEST_WEBHOOK_SECRET
    }),
    hubspot: validateHubSpotConfig({
      mode: process.env.HUBSPOT_CONNECTOR_MODE || 'off',
      portalId: process.env.HUBSPOT_TEST_PORTAL_ID,
      allowWrites: process.env.HUBSPOT_TEST_ALLOW_WRITES === 'true',
      blockedPortalIds
    }),
    supabase: validateSupabaseConfig({
      mode: process.env.SUPABASE_CONNECTOR_MODE || 'off',
      url: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    }),
    n8n: validateN8nConfig({
      mode: process.env.N8N_CONNECTOR_MODE || 'off',
      url: process.env.N8N_LOCAL_URL || 'http://127.0.0.1:5678'
    })
  };
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://' + host + ':' + port);
    const path = url.pathname;

    if (path === '/api/health' && req.method === 'GET') {
      return json(res, 200, { ok: true, app_env: 'sandbox', synthetic_only: true });
    }

    if (path === '/api/overview' && req.method === 'GET') {
      const studios = getStudios(db);
      const events = listEvents(db, 8);
      const reports = listReports(db);
      return json(res, 200, {
        environment: 'SANDBOX',
        synthetic_only: true,
        active_scenario: getActiveScenario(db),
        strict_synthetic_mode: getState(db, 'strict_synthetic_mode', 'true') === 'true',
        studios: studios.length,
        reports: reports.length,
        blocked_or_logged_events: events.length,
        safety_tests: runSafetyTests(),
        connector_readiness: connectorReadiness(),
        latest_events: events,
        latest_reports: reports.slice(0, 5)
      });
    }

    if (path === '/api/studios' && req.method === 'GET') {
      const studios = getStudios(db).map((studio) => ({ ...studio, icp: calculateIcpScore(studio) }));
      return json(res, 200, studios);
    }

    if (path.startsWith('/api/studios/') && req.method === 'GET') {
      const id = decodeURIComponent(path.split('/').pop());
      const studio = getStudio(db, id);
      if (!studio) return notFound(res);
      return json(res, 200, { ...studio, icp: calculateIcpScore(studio) });
    }

    if (path === '/api/growth-check' && req.method === 'POST') {
      const input = await body(req);
      const studio = getStudio(db, input.studioId);
      if (!studio) return json(res, 404, { error: 'Synthetic studio not found.' });
      assertSyntheticStudio(studio);
      let result = buildGrowthCheck(studio);
      if (getActiveScenario(db) === 'incomplete_evidence') {
        result = { ...result, warning: 'INCOMPLETE_EVIDENCE', evidence: result.evidence.slice(0, 1) };
      }
      appendEvent(db, 'growth_check.completed', { studio_id: studio.id, synthetic: true }, input.idempotencyKey || null);
      return json(res, 200, result);
    }

    if (path === '/api/audit' && req.method === 'POST') {
      const input = await body(req);
      const studio = getStudio(db, input.studioId);
      if (!studio) return json(res, 404, { error: 'Synthetic studio not found.' });
      assertSyntheticStudio(studio);
      const result = buildAudit(studio);
      appendEvent(db, 'audit.completed', { studio_id: studio.id, audit_id: result.audit_id, synthetic: true }, input.idempotencyKey || null);
      return json(res, 200, result);
    }

    if (path === '/api/reports' && req.method === 'GET') {
      return json(res, 200, listReports(db));
    }

    if (path === '/api/reports' && req.method === 'POST') {
      const input = await body(req);
      const studio = getStudio(db, input.studioId);
      if (!studio) return json(res, 404, { error: 'Synthetic studio not found.' });
      assertSyntheticStudio(studio);
      if (getActiveScenario(db) === 'report_generation_failure') {
        appendEvent(db, 'report.blocked', { reason: 'Synthetic report failure scenario', studio_id: studio.id });
        return json(res, 503, { error: 'Synthetic report generation failure scenario is active.' });
      }
      const reportType = input.reportType === 'audit' ? 'audit' : 'growth_check';
      const payload = reportType === 'audit' ? buildAudit(studio) : buildGrowthCheck(studio);
      const report = generateReport(db, studio, reportType, payload);
      appendEvent(db, 'report.generated', { report_id: report.id, studio_id: studio.id, synthetic: true });
      return json(res, 201, { ...report, html: undefined, preview_url: '/reports/' + report.id });
    }

    if (path.startsWith('/reports/') && req.method === 'GET') {
      const id = decodeURIComponent(path.split('/').pop());
      const report = getReport(db, id);
      if (!report) return notFound(res);
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      return res.end(report.html);
    }

    if (path === '/api/scenarios' && req.method === 'GET') {
      return json(res, 200, { active: getActiveScenario(db), available: SCENARIOS });
    }

    if (path.startsWith('/api/scenarios/') && req.method === 'POST') {
      const name = decodeURIComponent(path.split('/').pop());
      return json(res, 200, runScenario(db, name));
    }

    if (path === '/api/connectors' && req.method === 'GET') {
      return json(res, 200, { cards: listConnectors(db), readiness: connectorReadiness() });
    }

    if (path === '/api/connectors/simulate' && req.method === 'POST') {
      const input = await body(req);
      const allowed = ['Stripe Test Mode', 'HubSpot Developer Test Portal', 'Local Supabase CLI', 'Local n8n', 'Email Outbox'];
      if (!allowed.includes(input.name)) return json(res, 400, { error: 'Unknown connector.' });
      appendEvent(db, 'connector.simulated', { connector: input.name, synthetic: true, external_action: false });
      return json(res, 200, { ok: true, simulated: true, external_action: false, connector: input.name });
    }

    if (path === '/api/outbox' && req.method === 'GET') {
      return json(res, 200, listOutbox(db));
    }

    if (path === '/api/outbox' && req.method === 'POST') {
      const input = await body(req);
      if (!String(input.to || '').match(/@(example\.(com|org|net)|[^@]+\.invalid)$/i)) {
        appendEvent(db, 'email.blocked', { to: input.to, reason: 'Non-synthetic email domain' });
        return json(res, 400, { error: 'Only reserved synthetic email domains are accepted.' });
      }
      const captured = captureEmail(db, input.to, input.subject || 'Synthetic sandbox message', input.body || '');
      appendEvent(db, 'email.captured', { outbox_id: captured.id, to: captured.to_email, delivered: false });
      return json(res, 201, { ...captured, delivered: false });
    }

    if (path === '/api/events' && req.method === 'GET') {
      return json(res, 200, listEvents(db, 200));
    }

    if (path === '/api/safety-tests' && req.method === 'GET') {
      return json(res, 200, runSafetyTests());
    }

    if (path === '/api/reset' && req.method === 'POST') {
      resetDatabase(db);
      appendEvent(db, 'sandbox.reset', { synthetic: true });
      return json(res, 200, { ok: true, active_scenario: 'happy_path' });
    }

    if (path.startsWith('/api/')) return notFound(res);

    const relative = path === '/' ? 'index.html' : path.slice(1);
    const safe = normalize(relative).replace(/^\.\.(\/|\\|$)+/, '');
    const file = resolve(root, safe);
    if (!file.startsWith(root)) return notFound(res);
    try {
      const data = await readFile(file);
      res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream' });
      return res.end(data);
    } catch {
      const data = await readFile(resolve(root, 'index.html'));
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(data);
    }
  } catch (error) {
    appendEvent(db, 'server.error', { message: error.message, synthetic: true });
    return json(res, 500, { error: error.message });
  }
});

server.listen(port, host, () => {
  console.log('INKSIGHTS Sandbox running at http://' + host + ':' + port);
  console.log('Synthetic only. No production connectors are active.');
});
