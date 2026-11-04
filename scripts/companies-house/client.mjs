/**
 * INKSIGHTS — Companies House public-data adapter.
 * Server/CLI use only. Do not import into browser bundles.
 * No persistence, CRM mutations or company-to-studio auto-matching.
 */
const API_BASE = 'https://api.company-information.service.gov.uk';
const MAX_BODY_CHARS = 1_500_000;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class CompaniesHouseError extends Error {
  constructor(code, message, status = undefined) {
    super(message);
    this.name = 'CompaniesHouseError';
    this.code = code;
    this.status = status;
  }
}

function integer(value, name, lower, upper) {
  if (!Number.isInteger(value) || value < lower || value > upper) {
    throw new RangeError(`${name} must be an integer from ${lower} to ${upper}.`);
  }
  return value;
}

export function createCompaniesHouseClient({
  apiKey,
  fetchImpl = globalThis.fetch,
  sleep = wait,
  now = () => Date.now(),
  maxRequests = 35,
  retries = 2,
  timeoutMs = 10_000,
} = {}) {
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    throw new CompaniesHouseError('CONFIGURATION', 'COMPANIES_HOUSE_API_KEY is not configured.');
  }
  if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl must be a function.');
  integer(maxRequests, 'maxRequests', 1, 100);
  integer(retries, 'retries', 0, 3);
  integer(timeoutMs, 'timeoutMs', 1, 30_000);
  let calls = 0;
  let lastRequestAt = null;
  const auth = `Basic ${Buffer.from(`${apiKey}:`, 'utf8').toString('base64')}`;

  async function get(path, params = {}) {
    // Protect fixed-origin server credential; callers cannot supply arbitrary URLs.
    if (!/^\/(?:search\/companies|company\/[A-Za-z0-9]{1,10})$/.test(path)) {
      throw new CompaniesHouseError('BAD_PATH', 'Unsupported Companies House endpoint.');
    }
    const url = new URL(path, API_BASE);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
    let attempt = 0;
    while (true) {
      if (calls >= maxRequests) {
        throw new CompaniesHouseError('BUDGET_EXCEEDED', 'Per-run Companies House request budget reached.');
      }
      calls++;
      lastRequestAt = new Date(now()).toISOString();
      let response;
      try {
        response = await fetchImpl(url, {
          method: 'GET',
          headers: { authorization: auth, accept: 'application/json' },
          redirect: 'error',
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch {
        if (attempt++ < retries) {
          await sleep(Math.min(2000, 250 * 2 ** attempt));
          continue;
        }
        throw new CompaniesHouseError('NETWORK', 'Companies House request failed or timed out.');
      }
      if (response.status === 401 || response.status === 403) {
        throw new CompaniesHouseError('AUTH', 'Companies House rejected the API credentials.', response.status);
      }
      if (response.status === 429 || response.status >= 500) {
        if (attempt++ < retries) {
          const header = Number(response.headers.get('retry-after'));
          const waitMs = Number.isFinite(header) && header > 0
            ? Math.min(30_000, Math.ceil(header * 1000))
            : Math.min(4000, 500 * 2 ** attempt);
          await sleep(waitMs);
          continue;
        }
        throw new CompaniesHouseError(response.status === 429 ? 'RATE_LIMIT' : 'UPSTREAM',
          'Companies House is temporarily unavailable or rate-limited.', response.status);
      }
      if (!response.ok) {
        throw new CompaniesHouseError('UPSTREAM', `Companies House returned status ${response.status}.`, response.status);
      }
      let content;
      try {
        content = await response.text();
        if (content.length > MAX_BODY_CHARS) throw new Error('response exceeds limit');
        const json = JSON.parse(content);
        if (!json || typeof json !== 'object' || Array.isArray(json)) throw new Error('invalid shape');
        return json;
      } catch {
        throw new CompaniesHouseError('BAD_RESPONSE', 'Companies House returned invalid or oversized JSON.');
      }
    }
  }
  return {
    search: (query, { start = 0, pageSize = 20 } = {}) => get('/search/companies', {
      q: query, items_per_page: pageSize, start_index: start,
    }),
    profile: (companyNumber) => get(`/company/${companyNumber}`),
    stats: () => ({ requests: calls, last_request_at: lastRequestAt }),
  };
}
