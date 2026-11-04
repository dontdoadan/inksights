#!/usr/bin/env node
/**
 * INKSIGHTS research queue generator — read-only.
 *
 * npm not required: node scripts/industry-intelligence/run.mjs
 *   --input /secure/export.json --out ./out/intelligence
 * or --from-supabase with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *
 * NEVER writes to Supabase or HubSpot; all outputs require manual review.
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { assessCandidates, csvSerialize } from './qualify.mjs';

const args = process.argv.slice(2);
const flag = name => args.includes('--' + name);
const opt = name => {
  const i = args.indexOf('--' + name);
  return i === -1 ? null : args[i + 1];
};
function fail(msg) { throw new Error(msg); }
function config() {
  const input = opt('input');
  const supabase = flag('from-supabase');
  if (Boolean(input) === supabase) fail('Choose exactly one of --input FILE or --from-supabase');
  const out = opt('out');
  if (!out || out.startsWith('--')) fail('Provide --out OUTPUT_DIRECTORY');
  return {input, supabase, out:resolve(out)};
}
async function getRecordsViaRest(url,key,path) {
  const response = await fetch(url.replace(/\/$/,'') + '/rest/v1/' + path, {
    headers:{'apikey':key,'Authorization':'Bearer '+key,'Accept':'application/json'}
  });
  if (!response.ok) fail('Supabase read failed ('+response.status+')');
  return await response.json();
}
async function readSupabase() {
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) fail('Missing server-only Supabase environment credentials');
  const base = new URL(url);
  if (base.protocol !== 'https:' || !base.hostname.endsWith('.supabase.co'))
    fail('Refusing non-Supabase API endpoint');
  const sources=await getRecordsViaRest(url,key,'studio_sources?select=id,source_key&limit=1000');
  const byId=new Map(sources.map(row=>[row.id,row.source_key]));
  const items=[];
  for(let offset=0;offset<100000;offset+=500){
    const batch=await getRecordsViaRest(url,key,'studio_candidates?select=*&order=id.asc&limit=500&offset='+offset);
    if (!Array.isArray(batch)) fail('Expected Supabase JSON array');
    items.push(...batch.map(row=>({...row,source_key:byId.get(row.source_id)||''})));
    if (batch.length < 500) break;
  }
  return items;
}
async function main(){
  const conf=config();
  const input=conf.supabase?await readSupabase():JSON.parse(await readFile(conf.input,'utf8'));
  const candidates=Array.isArray(input)?input:input.candidates;
  const result=assessCandidates(candidates);
  await mkdir(conf.out,{recursive:true});
  await Promise.all([
    writeFile(resolve(conf.out,'research_queue.json'),JSON.stringify(result,null,2)+'\n'),
    writeFile(resolve(conf.out,'research_queue.csv'),csvSerialize(result.candidates)),
    writeFile(resolve(conf.out,'run_summary.json'),JSON.stringify({
      version:result.version,generated_at:result.generated_at,input_count:result.input_count,
      excluded_count:result.excluded_count,duplicate_review_count:result.duplicate_review_count,
      crm_synced:0,crm_eligible:0,manual_approval_required:true
    },null,2)+'\n')
  ]);
  console.log(JSON.stringify({total:result.input_count,excluded:result.excluded_count,
    duplicate_review:result.duplicate_review_count,exported:result.candidates.length,
    status:'research queue generated; no CRM/database writes'},null,2));
}
main().catch(e=>{console.error('Intelligence run failed:',e.message);process.exitCode=1;});
