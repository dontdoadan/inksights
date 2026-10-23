/**
 * INKSIGHTS registry discovery — candidate evidence, NOT verified tattoo studios.
 * Search-by-name is partial and can include irrelevant companies.
 */
const numberPattern = /^[A-Z0-9]{2,10}$/;
const string = (v, max = 240) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const safeDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v ?? '') ? v : null;
const officialUrl = (number) => `https://find-and-update.company-information.service.gov.uk/company/${encodeURIComponent(number)}`;

export function normalizeCompany(raw, query, observedAt) {
  if (!raw || typeof raw !== 'object') return null;
  const number = string(raw.company_number, 12).toUpperCase();
  const name = string(raw.title || raw.company_name);
  if (!numberPattern.test(number) || !name) return null;
  return {
    registry_candidate_key: `companies_house:${number}`,
    company_number: number,
    company_name: name,
    company_status: string(raw.company_status, 50) || 'not_reported',
    company_type: string(raw.company_type, 80) || null,
    incorporated_on: safeDate(raw.date_of_creation),
    registered_address_text: string(raw.address_snippet, 450) || null,
    matched_queries: [query],
    source: {
      provider: 'companies_house',
      api_resource: 'GET /search/companies',
      official_company_url: officialUrl(number),
      observed_at: observedAt,
      classification: 'OBSERVED',
    },
    assessment: {
      legal_entity_record_observed: true,
      operating_tattoo_studio_verified: false,
      registration_to_trading_site_match: 'unreviewed',
      approval_for_crm: false,
    },
  };
}

export function validateSearchOptions({ queries, limit = 20, maxPages = 2, addressContains = '' }) {
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 4 ||
      queries.some((q) => typeof q !== 'string' || q.trim().length < 3 || q.trim().length > 80)) {
    throw new RangeError('Supply 1–4 queries, each 3–80 characters long.');
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('limit must be 1–100.');
  if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 5) throw new RangeError('maxPages must be 1–5.');
  if (typeof addressContains !== 'string' || addressContains.length > 80) throw new RangeError('addressContains max length is 80.');
  return {
    queries: [...new Set(queries.map((q) => q.trim()))],
    limit, maxPages, addressContains: addressContains.trim(),
  };
}

export async function discoverCompanies({ client, options, clock = () => new Date() }) {
  const { queries, limit, maxPages, addressContains } = validateSearchOptions(options);
  const records = new Map();
  let rawResults = 0;
  let duplicateResults = 0;
  let rejectedResults = 0;
  let addressExclusions = 0;
  let pagesFetched = 0;
  const capturedAt = clock().toISOString();
  outer: for (const query of queries) {
    for (let page = 0; page < maxPages && records.size < limit; page++) {
      const pageSize = Math.min(100, Math.max(20, limit));
      const response = await client.search(query, { start: page * pageSize, pageSize });
      pagesFetched++;
      const items = Array.isArray(response.items) ? response.items : [];
      if (!items.length) break;
      rawResults += items.length;
      for (const item of items) {
        const candidate = normalizeCompany(item, query, capturedAt);
        if (!candidate) { rejectedResults++; continue; }
        if (addressContains && !candidate.registered_address_text?.toLowerCase().includes(addressContains.toLowerCase())) {
          addressExclusions++;
          continue;
        }
        const existing = records.get(candidate.company_number);
        if (existing) {
          duplicateResults++;
          if (!existing.matched_queries.includes(query)) existing.matched_queries.push(query);
        } else {
          records.set(candidate.company_number, candidate);
        }
        if (records.size >= limit) break outer;
      }
      if (items.length < pageSize) break;
    }
  }
  return {
    schema_version: 'inksights.companies-house.discovery.v1',
    generated_at: capturedAt,
    scope: 'UK legal-company candidates only; not verified tattoo studios',
    input: { queries, limit, max_pages: maxPages, registered_address_contains: addressContains || null },
    summary: { unique_candidates: records.size, raw_results_inspected: rawResults, duplicate_results: duplicateResults,
      invalid_items_skipped: rejectedResults, registered_address_exclusions: addressExclusions, pages_fetched: pagesFetched,
      ...(typeof client.stats === 'function' ? { api_requests: client.stats().requests } : {}) },
    candidates: [...records.values()],
  };
}

function excelSafe(value) {
  const s = String(value ?? '');
  // Treat CSV as an untrusted spreadsheet import format; block formula injection.
  return /^[\s]*[=+\-@]/.test(s) ? `'${s}` : s;
}
function csvField(value) { return `"${excelSafe(value).replaceAll('"', '""')}"`; }

export function toCsv(result) {
  const columns = ['registry_candidate_key','company_number','company_name','company_status','company_type',
    'incorporated_on','registered_address_text','matched_queries','source_url','observed_at',
    'operating_tattoo_studio_verified','approval_for_crm'];
  const rows = result.candidates.map((c) => [c.registry_candidate_key,c.company_number,c.company_name,
    c.company_status,c.company_type,c.incorporated_on,c.registered_address_text,c.matched_queries.join('; '),
    c.source.official_company_url,c.source.observed_at,c.assessment.operating_tattoo_studio_verified,
    c.assessment.approval_for_crm]);
  return [columns.map(csvField).join(','),...rows.map((r) => r.map(csvField).join(','))].join('\r\n') + '\r\n';
}
