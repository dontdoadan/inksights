#!/usr/bin/env node
/** Read-only command line research tool; nothing is sent to Supabase or HubSpot. */
import { writeFile } from 'node:fs/promises';
import { createCompaniesHouseClient, CompaniesHouseError } from './client.mjs';
import { discoverCompanies, toCsv, validateSearchOptions } from './discovery.mjs';

const HELP = `INKSIGHTS — Companies House Discovery v1 (read-only)

Usage:
  COMPANIES_HOUSE_API_KEY=... node scripts/companies-house/discover.mjs \\
    --query "tattoo" --query "tattoos" --limit 20 --format csv --out candidates.csv

Options:
  --query TEXT                 Search company name (1–4; default: tattoo)
  --limit N                    Max distinct candidates, 1–100 (default: 20)
  --max-pages N                Max pages per query, 1–5 (default: 2)
  --registered-address TEXT    Optional registry-address text filter (NOT trading area)
  --format json|csv            Output format (default: json)
  --out PATH                   Write output file (otherwise stdout)
  --dry-run                    Validate input and show request plan; no credentials/API calls
  --help                       Display help

Registry matches are not verified tattoo studios. No HubSpot or database writes.
`;

export function parseArgs(args) {
  const opts = { queries: [], limit: 20, maxPages: 2, addressContains: '', format: 'json', out: null, dryRun: false, help: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') { opts.help = true; continue; }
    if (arg === '--dry-run') { opts.dryRun = true; continue; }
    if (!['--query', '--limit', '--max-pages', '--registered-address', '--format', '--out'].includes(arg)) {
      throw new RangeError(`Unknown argument: ${arg}`);
    }
    const value = args[++i];
    if (!value || value.startsWith('--')) throw new RangeError(`${arg} requires a value.`);
    if (arg === '--query') opts.queries.push(value);
    if (arg === '--limit') opts.limit = Number(value);
    if (arg === '--max-pages') opts.maxPages = Number(value);
    if (arg === '--registered-address') opts.addressContains = value;
    if (arg === '--format') opts.format = value;
    if (arg === '--out') opts.out = value;
  }
  if (opts.queries.length === 0) opts.queries = ['tattoo'];
  validateSearchOptions(opts);
  if (!['csv', 'json'].includes(opts.format)) throw new RangeError('--format must be json or csv.');
  if (opts.out !== null && (opts.out.length > 260 || opts.out.includes('\0'))) throw new RangeError('Invalid output path.');
  return opts;
}

export async function run(args = process.argv.slice(2), { env = process.env, output = console.log } = {}) {
  const opts = parseArgs(args);
  if (opts.help) { output(HELP); return; }
  if (opts.dryRun) {
    output(JSON.stringify({ mode:'DRY_RUN_NO_API_REQUESTS', provider:'companies_house',
      queries:opts.queries, limit:opts.limit,max_pages:opts.maxPages,registered_address_contains:opts.addressContains || null,
      exports:opts.format, writes_to_crm_or_database:false },null,2));
    return;
  }
  const client = createCompaniesHouseClient({ apiKey: env.COMPANIES_HOUSE_API_KEY, maxRequests: Math.min(35, opts.queries.length * opts.maxPages + 5) });
  const result = await discoverCompanies({ client, options:opts });
  const serialized = opts.format === 'csv' ? toCsv(result) : JSON.stringify(result,null,2) + '\n';
  if (opts.out) {
    await writeFile(opts.out,serialized,{encoding:'utf8',flag:'wx',mode:0o600});
    output(`Saved ${result.summary.unique_candidates} unverified registry candidates to ${opts.out}.`);
  } else output(serialized);
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  run().catch((error) => {
    // Never echo credentials, provider raw bodies, or request headers.
    const message = error instanceof CompaniesHouseError || error instanceof RangeError
      ? error.message : 'Unexpected error while running registry discovery.';
    console.error(`INKSIGHTS discovery error: ${message}`);
    process.exitCode = 1;
  });
}
