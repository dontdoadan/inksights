import { appendEvent, getState, setState, getStudio, updateStudio } from './db.js';

export const SCENARIOS = [
  'happy_path',
  'incomplete_evidence',
  'low_icp_fit',
  'failed_payment',
  'connector_unavailable',
  'duplicate_event',
  'report_generation_failure',
  'cancelled_at_renewal',
  'attribution_inconclusive'
];

export function runScenario(db, name) {
  if (!SCENARIOS.includes(name)) throw new Error('Unknown sandbox scenario: ' + name);

  setState(db, 'active_scenario', name);
  const started = appendEvent(db, 'scenario.started', { name, synthetic: true }, 'scenario:' + name + ':' + Date.now());

  let result = { name, status: 'SIMULATED', detail: 'Scenario activated.' };

  if (name === 'duplicate_event') {
    const key = 'synthetic:duplicate:demo';
    const first = appendEvent(db, 'synthetic.event', { example: true }, key);
    const second = appendEvent(db, 'synthetic.event', { example: true }, key);
    result = { name, status: 'SIMULATED', detail: 'Duplicate idempotency key attempted twice.', first, second };
  }

  if (name === 'low_icp_fit') {
    const studio = getStudio(db, 'studio_northstar');
    if (studio) {
      const modified = {
        ...studio,
        artists: 2,
        years_established: 1,
        hourly_rate: 80,
        instagram_followers: 250,
        reviews_count: 8,
        owner_digital_literacy: 1
      };
      updateStudio(db, modified);
      result.detail = 'Northstar temporarily modified to low ICP fit.';
    }
  }

  if (name === 'incomplete_evidence') {
    result.detail = 'Growth Check output will flag missing-evidence conditions.';
  }

  if (name === 'failed_payment') result.detail = 'Synthetic payment decline recorded; no payment provider contacted.';
  if (name === 'connector_unavailable') result.detail = 'Synthetic connector outage recorded; workflows remain local.';
  if (name === 'report_generation_failure') result.detail = 'Next report generation can be treated as failed by the UI/API.';
  if (name === 'cancelled_at_renewal') result.detail = 'Synthetic subscription cancellation-at-renewal state recorded.';
  if (name === 'attribution_inconclusive') result.detail = 'Synthetic intervention outcome recorded with low attribution confidence.';

  appendEvent(db, 'scenario.completed', { ...result, started }, null);
  return result;
}

export function getActiveScenario(db) {
  return getState(db, 'active_scenario', 'happy_path');
}
