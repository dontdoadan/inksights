import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { saveReport } from './db.js';

const WATERMARK = 'SYNTHETIC SANDBOX — NOT FOR CLIENT USE';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
}

function section(title, body) {
  return '<section><h2>' + escapeHtml(title) + '</h2>' + body + '</section>';
}

export function generateReport(db, studio, reportType, payload) {
  const id = 'report_' + reportType + '_' + studio.id + '_' + Date.now();
  const createdAt = new Date().toISOString();
  const content = reportType === 'growth_check'
    ? renderGrowth(payload)
    : renderAudit(payload);

  const html = '<!doctype html><html><head><meta charset="utf-8"><title>INKSIGHTS Sandbox Report</title>' +
    '<style>body{font-family:Arial,sans-serif;background:#071019;color:#eaf1f4;margin:0;padding:48px;line-height:1.5}main{max-width:900px;margin:auto}.wm{position:fixed;inset:0;display:grid;place-items:center;pointer-events:none;opacity:.07;font-size:56px;transform:rotate(-24deg);font-weight:800}.tag{display:inline-block;padding:6px 10px;border:1px solid #58f0c5;border-radius:999px;color:#58f0c5;font-size:12px;font-weight:700}section{padding:24px 0;border-top:1px solid #20303c}h1{font-size:34px}h2{font-size:18px;color:#8fa8b7}li{margin:8px 0}.meta{color:#8fa8b7;font-size:13px}</style></head><body>' +
    '<div class="wm">' + WATERMARK + '</div><main><div class="tag">SYNTHETIC</div><h1>' + escapeHtml(studio.name) + '</h1>' +
    '<p class="meta">' + escapeHtml(WATERMARK) + ' · ' + escapeHtml(createdAt) + '</p>' + content + '</main></body></html>';

  const report = { id, studio_id: studio.id, report_type: reportType, html, created_at: createdAt };
  saveReport(db, report);

  const dir = resolve('generated');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, id + '.html'), html, 'utf8');
  return report;
}

function renderGrowth(result) {
  const opportunities = result.opportunities.map((item) => '<li><strong>' + escapeHtml(item.title) + '</strong> — ' + escapeHtml(item.recommendation) + '</li>').join('');
  return section('Primary constraint', '<p>' + escapeHtml(result.primary_constraint) + '</p>') +
    section('Finding', '<p>' + escapeHtml(result.finding) + '</p>') +
    section('Diagnosis', '<p>' + escapeHtml(result.diagnosis) + '</p>') +
    section('Top opportunities', '<ol>' + opportunities + '</ol>');
}

function renderAudit(result) {
  const sections = Object.entries(result.sections).map(([key, value]) =>
    '<li><strong>' + escapeHtml(key.replaceAll('_', ' ')) + '</strong>: ' + escapeHtml(value.score) + '/100 — ' + escapeHtml(value.summary) + '</li>'
  ).join('');
  const actions = result.action_plan_90_days.map((item) => '<li><strong>' + escapeHtml(item.period) + '</strong>: ' + escapeHtml(item.action) + '</li>').join('');
  return section('Audit sections', '<ul>' + sections + '</ul>') +
    section('Diagnosis', '<p>' + escapeHtml(result.diagnosis) + '</p>') +
    section('90-day action plan', '<ol>' + actions + '</ol>');
}

export { WATERMARK };
