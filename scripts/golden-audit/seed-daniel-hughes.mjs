import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
const LEDGER_PATH = process.env.DANIEL_LEDGER_PATH || '';
const WEBSITE_URL = process.env.DANIEL_WEBSITE_URL || 'https://danhughestattoos.co.uk';

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('SUPABASE_URL and service-role/secret key are required');
if (!LEDGER_PATH) throw new Error('DANIEL_LEDGER_PATH is required and must point to the private ledger outside git');

const headers = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };
const slug = 'daniel-hughes-tattoos-internal-validation';
const studioName = 'Daniel Hughes Tattoos';
const auditVersion = '1.1';
const mode = 'B';

async function rest(table, { method = 'GET', query = '', body } = {}) {
  const requestHeaders = { ...headers };
  if (method === 'POST') requestHeaders.Prefer = 'return=representation';
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ''}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`${table}:${response.status}:${text}`);
  return payload;
}

async function invoke(functionName, body) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST', headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok || payload?.ok === false) throw new Error(`${functionName}:${response.status}:${JSON.stringify(payload)}`);
  return payload;
}

async function ensureCanonicalStudio() {
  const found = await rest('visibility_studios', {
    query: `select=id,studio_name,website_url&studio_name=eq.${encodeURIComponent(studioName)}&limit=1`,
  });
  if (found?.[0]) return found[0];
  const created = await rest('visibility_studios', { method: 'POST', body: {
    studio_name: studioName,
    website_url: WEBSITE_URL,
    region: 'UK',
    canonical_status: 'observed',
    status: 'draft',
  }});
  return created[0];
}

async function ensureGoldenStudio(canonicalStudio) {
  const found = await rest('studios', { query: `select=*&id=eq.${canonicalStudio.id}&limit=1` });
  if (found?.[0]) return found[0];
  const created = await rest('studios', { method: 'POST', body: {
    id: canonicalStudio.id,
    name: studioName,
    slug,
    website_url: WEBSITE_URL,
    primary_location: null,
    internal_validation: true,
  }});
  return created[0];
}

async function ensureAudit(studioId) {
  const query = `select=*&studio_id=eq.${studioId}&audit_version=eq.${auditVersion}&mode=eq.${mode}&order=created_at.desc&limit=1`;
  const found = await rest('audits', { query });
  if (found?.[0] && !['failed'].includes(found[0].status)) return found[0];
  const created = await rest('audits', { method: 'POST', body: {
    studio_id: studioId,
    audit_type: 'studio_intelligence', audit_version: auditVersion, mode, status: 'draft',
    context: {
      material_owner_availability_constraint: true,
      trading_pattern: 'sparse_recent_activity',
      pricing_context: { hourly_gbp: 70, day_gbp: 400 },
      large_project_context: { minimum_sessions: 6, initial_booking_days: 2 },
      validation_purpose: 'internal_golden_audit_e2e',
    },
  }});
  return created[0];
}

async function uploadPrivateLedger(studioId, auditId) {
  const bytes = await fs.readFile(LEDGER_PATH);
  const filename = path.basename(LEDGER_PATH).replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `studio/${studioId}/audit/${auditId}/${filename}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/audit-sources/${storagePath}`, {
    method: 'POST', headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'text/plain; charset=utf-8', 'x-upsert': 'true' }, body: bytes,
  });
  if (!response.ok) throw new Error(`storage_upload:${response.status}:${await response.text()}`);
  return storagePath;
}

async function main() {
  const canonicalStudio = await ensureCanonicalStudio();
  const studio = await ensureGoldenStudio(canonicalStudio);
  if (studio.id !== canonicalStudio.id) throw new Error('golden_studio_identity_mismatch');
  const audit = await ensureAudit(studio.id);
  const storagePath = await uploadPrivateLedger(studio.id, audit.id);
  const ingest = await invoke('golden-audit-ingest', { audit_id: audit.id, source_type: 'transaction_ledger', storage_path: storagePath });
  const run = await invoke('golden-audit-run', { audit_id: audit.id });
  console.log(JSON.stringify({ canonical_studio_id: canonicalStudio.id, studio_id: studio.id, audit_id: audit.id, storage_path: storagePath, ingest, run }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
