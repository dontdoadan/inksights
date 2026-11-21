import test from 'node:test';
import assert from 'node:assert/strict';
import { createCompaniesHouseClient, CompaniesHouseError } from '../scripts/companies-house/client.mjs';
import { discoverCompanies, normalizeCompany, toCsv, validateSearchOptions } from '../scripts/companies-house/discovery.mjs';
import { parseArgs, run } from '../scripts/companies-house/discover.mjs';

const record = (num, name, address = 'London') => ({ company_number:num,title:name,company_status:'active',date_of_creation:'2020-02-02',address_snippet:address });
const fixed = () => new Date('2026-10-23T09:00:00.000Z');
const fakeClient = (byQuery) => ({search:async(q,{start}) => ({items:start===0?(byQuery[q]??[]):[]}),stats:()=>({requests:2})});

test('normalization has persistent registry ID, provenance and explicit not-a-studio status', () => {
  const n = normalizeCompany(record('01234567','Example Tattoo Ltd'), 'tattoo',fixed().toISOString());
  assert.equal(n.registry_candidate_key,'companies_house:01234567');
  assert.equal(n.source.official_company_url,'https://find-and-update.company-information.service.gov.uk/company/01234567');
  assert.equal(n.assessment.operating_tattoo_studio_verified,false);
  assert.equal(n.assessment.approval_for_crm,false);
  assert.equal(normalizeCompany(record('bad number','invalid'), 'tattoo',fixed().toISOString()),null);
});

test('deduplicates across queries, filters registered address without claiming site location', async () => {
  const result = await discoverCompanies({client:fakeClient({
    tattoo:[record('01234567','Example Tattoo Ltd','Croydon'),record('05678901','Another Tattoo Ltd','Bristol')],
    tattoos:[record('01234567','Example Tattoo Ltd','Croydon'),record('09876543','Third Tattoos Ltd','Croydon')],
  }),options:{queries:['tattoo','tattoos'],limit:20,maxPages:1,addressContains:'Croydon'},clock:fixed});
  assert.equal(result.summary.unique_candidates,2);
  assert.equal(result.summary.registered_address_exclusions,1);
  assert.equal(result.summary.duplicate_results,1);
  assert.deepEqual(result.candidates[0].matched_queries,['tattoo','tattoos']);
  assert.equal(result.summary.api_requests,2);
});

test('rejects bad query budgets and CLI limits', () => {
  assert.throws(()=>validateSearchOptions({queries:['x']}),RangeError);
  assert.throws(()=>validateSearchOptions({queries:['tattoo'],limit:1001}),RangeError);
  assert.throws(()=>parseArgs(['--format','xml']),RangeError);
  assert.throws(()=>parseArgs(['--limit','NaN']),RangeError);
  assert.throws(()=>parseArgs(['--query','tattoo','--max-pages','6']),RangeError);
});

test('CSV safely neutralizes spreadsheet formulas and preserves quotes', () => {
  const c = normalizeCompany(record('01234567','=HYPERLINK("bad")'), 'tattoo',fixed().toISOString());
  const csv = toCsv({candidates:[c]});
  assert.match(csv,/"'=HYPERLINK\(""bad""\)"/);
  assert.match(csv,/"false"/);
});

test('client uses Companies House fixed origin, basic auth, and limited endpoint paths', async () => {
  const calls=[];
  const client=createCompaniesHouseClient({apiKey:'test-key',fetchImpl:async(url,opts)=>{
    calls.push({url:String(url),options:opts});return new Response(JSON.stringify({items:[]}),{status:200});
  }});
  await client.search('tattoo',{start:0,pageSize:20});
  assert.match(calls[0].url,/^https:\/\/api\.company-information\.service\.gov\.uk\/search\/companies\?/);
  assert.equal(calls[0].options.headers.authorization,`Basic ${Buffer.from('test-key:').toString('base64')}`);
  assert.equal(calls[0].options.redirect,'error');
  assert.equal(client.stats().requests,1);
  await assert.rejects(()=>client.profile('not/valid'),{code:'BAD_PATH'});
});

test('honours Retry-After bounded retry, then stops with budget when exceeded', async()=>{
  let n=0; const sleeps=[];
  const fetchImpl=async()=>{n++;return n===1?new Response('',{status:429,headers:{'retry-after':'1'}}):new Response('{"items":[]}',{status:200});};
  const client=createCompaniesHouseClient({apiKey:'x',fetchImpl,sleep:async(ms)=>sleeps.push(ms),maxRequests:2});
  await client.search('tattoo');
  assert.deepEqual(sleeps,[1000]);
  assert.equal(client.stats().requests,2);
  await assert.rejects(()=>client.search('tattoo'),{code:'BUDGET_EXCEEDED'});
});

test('auth failure is explicit but does not leak key or upstream content',async()=>{
  const client=createCompaniesHouseClient({apiKey:'TOP_SECRET',fetchImpl:async()=>new Response('TOP_SECRET',{status:401})});
  await assert.rejects(()=>client.search('tattoo'),(error)=>error instanceof CompaniesHouseError && error.code==='AUTH' && !error.message.includes('TOP_SECRET'));
});

test('dry-run validates and never requires API key',async()=>{
  const messages=[];
  await run(['--query','tattoo','--dry-run'],{env:{},output:(message)=>messages.push(message)});
  const plan=JSON.parse(messages[0]);
  assert.equal(plan.writes_to_crm_or_database,false);
  assert.equal(plan.mode,'DRY_RUN_NO_API_REQUESTS');
});
