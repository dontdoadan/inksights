import { assertSandboxEnv, validateStripeConfig, validateSupabaseConfig, validateHubSpotConfig, validateN8nConfig } from '../src/safety.js';

assertSandboxEnv();

const blockedPortalIds = (process.env.BLOCKED_HUBSPOT_PORTAL_IDS || '148925665').split(',').filter(Boolean);
const checks = {
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

let unsafe = false;
for (const [name, result] of Object.entries(checks)) {
  console.log(name.padEnd(10), result.safe ? 'SAFE' : 'UNSAFE', result.ready ? 'READY' : 'NOT_READY', '-', result.reason);
  if (!result.safe) unsafe = true;
}
if (unsafe) process.exitCode = 1;
