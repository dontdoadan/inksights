import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const cli=resolve('scripts/industry-intelligence/run.mjs');
test('CLI creates a review-only queue from JSON without external credentials',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'inksights-research-'));
  try {
    const input=join(dir,'input.json'), out=join(dir,'out');
    await writeFile(input,JSON.stringify([{id:'test-1',name:'Sample Studio',postcode:'SW1A 1AA',
      town:'London',website_url:'https://studio.example',source_url:'https://studio.example',
      identity_status:'unresolved',source_key:'studio_website',payload:{artist_count:5}}]));
    const result=spawnSync(process.execPath,[cli,'--input',input,'--out',out],{
      encoding:'utf8',env:{PATH:process.env.PATH}
    });
    assert.equal(result.status,0,result.stderr);
    const run=JSON.parse(await readFile(join(out,'run_summary.json'),'utf8'));
    const resultJson=JSON.parse(await readFile(join(out,'research_queue.json'),'utf8'));
    assert.equal(run.crm_synced,0);
    assert.equal(run.manual_approval_required,true);
    assert.equal(resultJson.candidates[0].crm_eligible,false);
    assert.equal(resultJson.candidates[0].review_gate,'RESEARCH_ONLY');
    const csv=await readFile(join(out,'research_queue.csv'),'utf8');
    assert.ok(csv.includes('Sample Studio'));
  } finally {await rm(dir,{recursive:true,force:true});}
});
test('CLI cannot run without an explicit source and destination',()=>{
  const result=spawnSync(process.execPath,[cli],{encoding:'utf8',env:{PATH:process.env.PATH}});
  assert.notEqual(result.status,0);
  assert.ok(result.stderr.includes('Choose exactly one'));
});
