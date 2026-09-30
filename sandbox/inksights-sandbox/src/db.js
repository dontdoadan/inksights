import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DEFAULT_DB_PATH = resolve('data/inksights-sandbox.sqlite');

const FIXTURES = [
  {
    id: 'studio_northstar',
    name: 'Northstar Tattoo Studio',
    city: 'Manchester',
    contact_email: 'owner.northstar@example.com',
    synthetic: true,
    artists: 5,
    years_established: 6,
    hourly_rate: 135,
    website_score: 66,
    reviews_count: 48,
    review_rating: 4.6,
    instagram_followers: 5400,
    manual_booking: true,
    has_deposit: false,
    artist_pages_complete: false,
    owner_digital_literacy: 3,
    revenue_monthly: 23500,
    enquiries: 112,
    bookings: 31,
    available_hours: 520,
    booked_hours: 305,
    new_clients: 24,
    repeat_clients: 17,
    cancellation_rate_pct: 9,
    ltv: 1120,
    contribution: 14100,
    retention_pct: 32,
    deposit_conversion_pct: 0,
    consultation_conversion_pct: 54,
    no_show_rate_pct: 5
  },
  {
    id: 'studio_blackline',
    name: 'Blackline Collective',
    city: 'Bristol',
    contact_email: 'ops.blackline@example.org',
    synthetic: true,
    artists: 4,
    years_established: 4,
    hourly_rate: 145,
    website_score: 78,
    reviews_count: 73,
    review_rating: 4.7,
    instagram_followers: 8300,
    manual_booking: true,
    has_deposit: true,
    artist_pages_complete: false,
    owner_digital_literacy: 4,
    revenue_monthly: 24800,
    enquiries: 95,
    bookings: 42,
    available_hours: 420,
    booked_hours: 310,
    new_clients: 27,
    repeat_clients: 23,
    cancellation_rate_pct: 6,
    ltv: 1390,
    contribution: 15800,
    retention_pct: 41,
    deposit_conversion_pct: 78,
    consultation_conversion_pct: 68,
    no_show_rate_pct: 3
  },
  {
    id: 'studio_lantern',
    name: 'Lantern Tattoo Rooms',
    city: 'Birmingham',
    contact_email: 'hello@lanterntattoo.invalid',
    synthetic: true,
    artists: 7,
    years_established: 8,
    hourly_rate: 125,
    website_score: 59,
    reviews_count: 35,
    review_rating: 4.4,
    instagram_followers: 2900,
    manual_booking: true,
    has_deposit: true,
    artist_pages_complete: false,
    owner_digital_literacy: 2,
    revenue_monthly: 27400,
    enquiries: 156,
    bookings: 39,
    available_hours: 720,
    booked_hours: 358,
    new_clients: 32,
    repeat_clients: 19,
    cancellation_rate_pct: 12,
    ltv: 980,
    contribution: 14600,
    retention_pct: 27,
    deposit_conversion_pct: 61,
    consultation_conversion_pct: 49,
    no_show_rate_pct: 7
  },
  {
    id: 'studio_example_london',
    name: 'Example Studio London',
    city: 'London',
    contact_email: 'founder@example.net',
    synthetic: true,
    artists: 6,
    years_established: 5,
    hourly_rate: 210,
    website_score: 84,
    reviews_count: 92,
    review_rating: 4.8,
    instagram_followers: 12400,
    manual_booking: false,
    has_deposit: true,
    artist_pages_complete: true,
    owner_digital_literacy: 5,
    revenue_monthly: 46300,
    enquiries: 132,
    bookings: 66,
    available_hours: 610,
    booked_hours: 472,
    new_clients: 41,
    repeat_clients: 38,
    cancellation_rate_pct: 4,
    ltv: 1860,
    contribution: 30200,
    retention_pct: 49,
    deposit_conversion_pct: 87,
    consultation_conversion_pct: 74,
    no_show_rate_pct: 2
  }
];

export function openDatabase(path = process.env.SANDBOX_DB_PATH || DEFAULT_DB_PATH) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON;');
  createSchema(db);
  seedDatabase(db);
  return db;
}

export function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS studios (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      synthetic INTEGER NOT NULL CHECK (synthetic = 1),
      data_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      idempotency_key TEXT UNIQUE,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      studio_id TEXT NOT NULL,
      report_type TEXT NOT NULL,
      html TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (studio_id) REFERENCES studios(id)
    );

    CREATE TABLE IF NOT EXISTS email_outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS connectors (
      name TEXT PRIMARY KEY,
      mode TEXT NOT NULL,
      status TEXT NOT NULL,
      detail TEXT NOT NULL
    );
  `);
}

export function seedDatabase(db) {
  const insert = db.prepare('INSERT OR IGNORE INTO studios (id, name, city, contact_email, synthetic, data_json) VALUES (?, ?, ?, ?, 1, ?)');
  for (const studio of FIXTURES) {
    insert.run(studio.id, studio.name, studio.city, studio.contact_email, JSON.stringify(studio));
  }

  const setStateStmt = db.prepare('INSERT OR IGNORE INTO state (key, value) VALUES (?, ?)');
  setStateStmt.run('active_scenario', 'happy_path');
  setStateStmt.run('strict_synthetic_mode', 'true');

  const connector = db.prepare('INSERT OR IGNORE INTO connectors (name, mode, status, detail) VALUES (?, ?, ?, ?)');
  const defaults = [
    ['Stripe Test Mode', 'off', 'NOT_CONFIGURED', 'Simulator only; live keys/events are blocked.'],
    ['HubSpot Developer Test Portal', 'off', 'NOT_CONFIGURED', 'No CRM writes; developer test portal only in Phase 2.'],
    ['Local Supabase CLI', 'off', 'NOT_CONFIGURED', 'Hosted Supabase is blocked in this package.'],
    ['Local n8n', 'off', 'NOT_CONFIGURED', 'Local capture workflow only.'],
    ['Email Outbox', 'local', 'READY', 'Messages are captured locally and never delivered.']
  ];
  for (const row of defaults) connector.run(...row);
}

export function resetDatabase(db) {
  db.exec('DELETE FROM reports; DELETE FROM email_outbox; DELETE FROM events; DELETE FROM connectors; DELETE FROM state; DELETE FROM studios;');
  seedDatabase(db);
}

export function getStudios(db) {
  return db.prepare('SELECT * FROM studios ORDER BY name').all().map(hydrateStudio);
}

export function getStudio(db, id) {
  const row = db.prepare('SELECT * FROM studios WHERE id = ?').get(id);
  return row ? hydrateStudio(row) : null;
}

export function updateStudio(db, studio) {
  db.prepare('UPDATE studios SET name = ?, city = ?, contact_email = ?, data_json = ? WHERE id = ?')
    .run(studio.name, studio.city, studio.contact_email, JSON.stringify(studio), studio.id);
  return getStudio(db, studio.id);
}

function hydrateStudio(row) {
  return { ...JSON.parse(row.data_json), synthetic: Boolean(row.synthetic) };
}

export function setState(db, key, value) {
  db.prepare('INSERT INTO state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(key, String(value));
}

export function getState(db, key, fallback = null) {
  const row = db.prepare('SELECT value FROM state WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

export function appendEvent(db, eventType, payload = {}, idempotencyKey = null) {
  const createdAt = new Date().toISOString();
  try {
    const result = db.prepare('INSERT INTO events (event_type, idempotency_key, payload_json, created_at) VALUES (?, ?, ?, ?)')
      .run(eventType, idempotencyKey, JSON.stringify(payload), createdAt);
    return { inserted: true, duplicate: false, id: Number(result.lastInsertRowid), created_at: createdAt };
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed: events.idempotency_key')) {
      return { inserted: false, duplicate: true, idempotency_key: idempotencyKey };
    }
    throw error;
  }
}

export function listEvents(db, limit = 100) {
  return db.prepare('SELECT * FROM events ORDER BY id DESC LIMIT ?').all(limit).map((row) => ({
    ...row,
    payload: JSON.parse(row.payload_json)
  }));
}

export function saveReport(db, report) {
  db.prepare('INSERT INTO reports (id, studio_id, report_type, html, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(report.id, report.studio_id, report.report_type, report.html, report.created_at);
  return report;
}

export function getReport(db, id) {
  return db.prepare('SELECT * FROM reports WHERE id = ?').get(id) || null;
}

export function listReports(db) {
  return db.prepare('SELECT id, studio_id, report_type, created_at FROM reports ORDER BY created_at DESC').all();
}

export function captureEmail(db, toEmail, subject, body) {
  const createdAt = new Date().toISOString();
  const result = db.prepare('INSERT INTO email_outbox (to_email, subject, body, created_at) VALUES (?, ?, ?, ?)')
    .run(toEmail, subject, body, createdAt);
  return { id: Number(result.lastInsertRowid), to_email: toEmail, subject, body, created_at: createdAt };
}

export function listOutbox(db) {
  return db.prepare('SELECT * FROM email_outbox ORDER BY id DESC').all();
}

export function listConnectors(db) {
  return db.prepare('SELECT * FROM connectors ORDER BY name').all();
}
