import test from 'node:test';
import assert from 'node:assert/strict';
import { websiteDomain, identityKey, artistCount, qualify, assessCandidates, csvSerialize, normalisePostcode } from './qualify.mjs';

const base = {id:'studio-1',name:'Sample Tattoo',town:'Bristol',postcode:'BS1 2AA',
  website_url:'https://www.exampletattoo.co.uk/',source_url:'https://www.exampletattoo.co.uk/',
  phone:'0117 000 1111',source_key:'studio_website',identity_status:'unresolved',
  payload:{artist_count:'5'}};
test('postcode normalisation retains UK alphanumeric identity',()=>{
  assert.equal(normalisePostcode('bs1 2aa'),'BS12AA');
});
test('website domain parsing rejects social platforms and javascript schemes',()=>{
  assert.equal(websiteDomain('https://www.exampletattoo.co.uk/'),'exampletattoo.co.uk');
  assert.equal(websiteDomain('javascript:alert(1)'),null);
  assert.equal(websiteDomain('https://instagram.com/studio'),null);
});
test('exact artist count is required; approximate ranges do not become facts',()=>{
  assert.equal(artistCount(base),5);
  assert.equal(artistCount({...base,payload:{artist_count:'3-8'}}),null);
  assert.equal(artistCount({...base,payload:{artist_count:'15+'}}),null);
});
test('candidate is always research only, regardless of score',()=>{
  const r=qualify(base);
  assert.equal(r.review_gate,'RESEARCH_ONLY');
  assert.equal(r.crm_eligible,false);
  assert.ok(r.score>50);
  assert.ok(r.evidence_gaps.includes('Resolve candidate against canonical studio'));
});
test('test and duplicate records never enter the queue as active leads',()=>{
  const r=qualify({...base,name:'[TEST — EXCLUDE] Example'});
  assert.equal(r.review_gate,'EXCLUDED');
});
test('different locations sharing a website are not automatically merged',()=>{
  const a=identityKey(base), b=identityKey({...base,postcode:'BS2 3ZZ'});
  assert.notEqual(a,b);
});
test('identical location identity produces review not destructive merging',()=>{
  const r=assessCandidates([base,{...base,id:'studio-2',name:'Sample TATTOO LTD'}]);
  assert.equal(r.duplicate_review_count,1);
  assert.equal(r.candidates.length,2);
  assert.equal(r.candidates.filter(x=>x.review_gate==='POSSIBLE_DUPLICATE').length,1);
});
test('missing postcode and website does not invent an identity',()=>{
  assert.equal(identityKey({name:'Potential shop'}),null);
});
test('CSV escapes quotes and does not open new records',()=>{
  const csv=csvSerialize([qualify({...base,name:'Alpha, "Beta" Tattoo'})]);
  assert.ok(csv.includes('""Beta""'));
  assert.equal(csv.trim().split('\n').length,2);
});

test('spreadsheet formula input is neutralised in CSV exports',()=>{
  const row=qualify({...base,name:'=HYPERLINK("https://malicious.invalid")'});
  const csv=csvSerialize([row]);
  assert.ok(csv.includes('"\'=HYPERLINK'));
});
