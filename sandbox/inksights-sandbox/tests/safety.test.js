import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertSandboxEnv, isReservedSyntheticEmail, assertSyntheticStudio,
  validateStripeConfig, validateStripeEvent, validateSupabaseConfig,
  validateHubSpotConfig, validateN8nConfig, PRODUCTION_SUPABASE_PROJECT_ID
} from '../src/safety.js';

test('APP_ENV must be sandbox', () => {
  assert.doesNotThrow(() => assertSandboxEnv({ APP_ENV: 'sandbox' }));
  assert.throws(() => assertSandboxEnv({ APP_ENV: 'production' }));
});

test('only reserved synthetic email domains are allowed', () => {
  assert.equal(isReservedSyntheticEmail('owner@example.com'), true);
  assert.equal(isReservedSyntheticEmail('owner@studio.invalid'), true);
  assert.equal(isReservedSyntheticEmail('owner@realstudio.co.uk'), false);
});

test('synthetic studio guard rejects real-looking records', () => {
  assert.doesNotThrow(() => assertSyntheticStudio({ synthetic: true, contact_email: 'a@example.org' }));
  assert.throws(() => assertSyntheticStudio({ synthetic: false, contact_email: 'a@example.org' }));
  assert.throws(() => assertSyntheticStudio({ synthetic: true, contact_email: 'a@realstudio.co.uk' }));
});

test('Stripe live values are blocked', () => {
  const result = validateStripeConfig({ mode: 'test', secretKey: 'sk_live_123', priceId: 'price_test', webhookSecret: 'whsec_test' });
  assert.equal(result.safe, false);
  assert.throws(() => validateStripeEvent({ livemode: true }));
});

test('production and hosted Supabase endpoints are blocked', () => {
  const production = validateSupabaseConfig({ mode: 'local', url: 'https://' + PRODUCTION_SUPABASE_PROJECT_ID + '.supabase.co', serviceRoleKey: 'x' });
  assert.equal(production.safe, false);
  const hosted = validateSupabaseConfig({ mode: 'local', url: 'https://abc.supabase.co', serviceRoleKey: 'x' });
  assert.equal(hosted.safe, false);
  const local = validateSupabaseConfig({ mode: 'local', url: 'http://127.0.0.1:54321', serviceRoleKey: 'local' });
  assert.equal(local.safe, true);
});

test('HubSpot must be an explicitly allowed test portal', () => {
  const blocked = validateHubSpotConfig({ mode: 'test', portalId: '148925665', allowWrites: true, blockedPortalIds: ['148925665'] });
  assert.equal(blocked.safe, false);
  const off = validateHubSpotConfig({ mode: 'off' });
  assert.equal(off.safe, true);
});

test('n8n must be local', () => {
  assert.equal(validateN8nConfig({ mode: 'local', url: 'http://127.0.0.1:5678' }).safe, true);
  assert.equal(validateN8nConfig({ mode: 'local', url: 'https://example.com' }).safe, false);
});
