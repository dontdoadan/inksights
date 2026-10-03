import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase, resetDatabase, getStudios, appendEvent, listEvents } from '../src/db.js';
import { calculateIcpScore, buildGrowthCheck, buildAudit } from '../src/domain.js';
import { runScenario } from '../src/scenarios.js';

function fixtureDb() {
  const db = openDatabase(':memory:');
  resetDatabase(db);
  return db;
}

test('seed contains four explicitly synthetic studios', () => {
  const db = fixtureDb();
  const studios = getStudios(db);
  assert.equal(studios.length, 4);
  assert.equal(studios.every((studio) => studio.synthetic === true), true);
});

test('ICP score stays within 0-100 and includes breakdown', () => {
  const studio = getStudios(fixtureDb())[0];
  const result = calculateIcpScore(studio);
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.ok(result.breakdown.length >= 10);
});

test('Growth Check returns evidence, diagnosis and opportunities', () => {
  const studio = getStudios(fixtureDb())[0];
  const result = buildGrowthCheck(studio);
  assert.equal(result.synthetic, true);
  assert.ok(result.evidence.length >= 3);
  assert.ok(result.diagnosis);
  assert.ok(result.opportunities.length >= 1);
});

test('Intelligence Audit preserves the canonical lineage', () => {
  const studio = getStudios(fixtureDb())[0];
  const result = buildAudit(studio);
  assert.equal(result.status, 'COMPLETE');
  assert.deepEqual(result.lineage.stages.slice(0, 4), ['Provider Observation', 'Normalised Data', 'Metric', 'Evidence']);
  assert.equal(result.lineage.stages.at(-1), 'Learning');
});

test('duplicate events are idempotent', () => {
  const db = fixtureDb();
  const first = appendEvent(db, 'test.event', { synthetic: true }, 'same-key');
  const second = appendEvent(db, 'test.event', { synthetic: true }, 'same-key');
  assert.equal(first.inserted, true);
  assert.equal(second.duplicate, true);
  assert.equal(listEvents(db).filter((event) => event.idempotency_key === 'same-key').length, 1);
});

test('scenario engine activates failure cases without external actions', () => {
  const db = fixtureDb();
  const result = runScenario(db, 'failed_payment');
  assert.equal(result.status, 'SIMULATED');
});
