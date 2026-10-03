const RESERVED_EMAIL_PATTERNS = [
  /@example\.com$/i,
  /@example\.org$/i,
  /@example\.net$/i,
  /\.invalid$/i
];

export const PRODUCTION_SUPABASE_PROJECT_ID = 'ukaxsqwnkoqbbsufpzga';

export function assertSandboxEnv(env = process.env) {
  if (env.APP_ENV !== 'sandbox') {
    throw new Error('INKSIGHTS Sandbox refused to start: APP_ENV must equal sandbox.');
  }
}

export function isReservedSyntheticEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return RESERVED_EMAIL_PATTERNS.some((pattern) => pattern.test(email.trim()));
}

export function assertSyntheticStudio(studio) {
  if (!studio || studio.synthetic !== true) {
    throw new Error('Blocked: studio record is not explicitly synthetic.');
  }
  if (studio.contact_email && !isReservedSyntheticEmail(studio.contact_email)) {
    throw new Error('Blocked: contact email is not a reserved synthetic domain.');
  }
  return true;
}

export function validateStripeConfig(config = {}) {
  const mode = config.mode || 'off';
  if (mode === 'off') return { ready: false, safe: true, reason: 'Connector disabled.' };
  if (mode !== 'test') return { ready: false, safe: false, reason: 'Only Stripe test mode is allowed.' };

  const key = config.secretKey || '';
  if (key.startsWith('sk_live_')) {
    return { ready: false, safe: false, reason: 'Live Stripe secret key rejected.' };
  }
  if (key && !key.startsWith('sk_test_')) {
    return { ready: false, safe: false, reason: 'Stripe key must be a test key.' };
  }
  if (!key || !config.priceId || !config.webhookSecret) {
    return { ready: false, safe: true, reason: 'Test connector is incomplete.' };
  }
  return { ready: true, safe: true, reason: 'Test-mode values pass local validation.' };
}

export function validateStripeEvent(event) {
  if (event && event.livemode === true) {
    throw new Error('Blocked: live Stripe event rejected.');
  }
  return true;
}

export function validateSupabaseConfig(config = {}) {
  const mode = config.mode || 'off';
  if (mode === 'off') return { ready: false, safe: true, reason: 'Connector disabled.' };
  if (mode !== 'local') return { ready: false, safe: false, reason: 'Only local Supabase CLI mode is allowed.' };

  const url = String(config.url || '');
  if (url.includes(PRODUCTION_SUPABASE_PROJECT_ID)) {
    return { ready: false, safe: false, reason: 'Canonical production Supabase project rejected.' };
  }
  if (/\.supabase\.co/i.test(url)) {
    return { ready: false, safe: false, reason: 'Hosted Supabase endpoint rejected.' };
  }
  if (url && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
    return { ready: false, safe: false, reason: 'Only localhost Supabase endpoints are allowed.' };
  }
  if (!url || !config.serviceRoleKey) {
    return { ready: false, safe: true, reason: 'Local connector is incomplete.' };
  }
  return { ready: true, safe: true, reason: 'Local-only Supabase values pass validation.' };
}

export function validateHubSpotConfig(config = {}) {
  const mode = config.mode || 'off';
  if (mode === 'off') return { ready: false, safe: true, reason: 'Connector disabled.' };
  if (mode !== 'test') return { ready: false, safe: false, reason: 'Only HubSpot developer test portals are allowed.' };

  const blocked = new Set((config.blockedPortalIds || []).map(String));
  const portalId = String(config.portalId || '');
  if (blocked.has(portalId)) {
    return { ready: false, safe: false, reason: 'Blocked production portal ID.' };
  }
  if (!portalId || !config.allowWrites) {
    return { ready: false, safe: true, reason: 'Test portal or explicit write permission is missing.' };
  }
  return { ready: true, safe: true, reason: 'Developer test-portal settings pass local validation.' };
}

export function validateN8nConfig(config = {}) {
  const mode = config.mode || 'off';
  if (mode === 'off') return { ready: false, safe: true, reason: 'Connector disabled.' };
  if (mode !== 'local') return { ready: false, safe: false, reason: 'Only local n8n mode is allowed.' };
  const url = String(config.url || '');
  if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
    return { ready: false, safe: false, reason: 'n8n must resolve to localhost.' };
  }
  return { ready: true, safe: true, reason: 'Local n8n endpoint passes validation.' };
}

export function runSafetyTests() {
  const tests = [];
  const add = (name, fn) => {
    try {
      fn();
      tests.push({ name, status: 'PASS' });
    } catch (error) {
      tests.push({ name, status: 'FAIL', detail: error.message });
    }
  };

  add('Reserved example email accepted', () => {
    if (!isReservedSyntheticEmail('owner@example.com')) throw new Error('Expected acceptance.');
  });

  add('Real-looking email rejected', () => {
    if (isReservedSyntheticEmail('owner@realstudio.co.uk')) throw new Error('Expected rejection.');
  });

  add('Live Stripe event rejected', () => {
    let blocked = false;
    try { validateStripeEvent({ livemode: true }); } catch { blocked = true; }
    if (!blocked) throw new Error('Live event was not blocked.');
  });

  add('Production Supabase ID rejected', () => {
    const result = validateSupabaseConfig({
      mode: 'local',
      url: 'https://' + PRODUCTION_SUPABASE_PROJECT_ID + '.supabase.co',
      serviceRoleKey: 'synthetic'
    });
    if (result.safe) throw new Error('Production project was not rejected.');
  });

  add('Synthetic studio accepted', () => {
    assertSyntheticStudio({ synthetic: true, contact_email: 'studio@example.com' });
  });

  return tests;
}
