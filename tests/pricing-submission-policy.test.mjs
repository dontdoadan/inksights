import test from "node:test";
import assert from "node:assert/strict";
import { validatePricingSubmission, isSamePricingSubmission, CONSENT_VERSION, DATASET_VERSION } from "../supabase/functions/public-pricing-benchmark-submit/pricing-policy.mjs";

const key = "123e4567-e89b-42d3-a456-426614174000";
const valid = () => ({
  region:"uk",prices:[100,null,650,120,70],leadTimeWeeks:4,
  submissionKey:key,consentVersion:CONSENT_VERSION,dataNoticeAccepted:true,
});

test("pricing: valid partial prices yield versioned, bounded model", () => {
  const result = validatePricingSubmission(valid());
  assert.equal(result.ok, true);
  assert.deepEqual(result.normalized, {region:"uk",prices:[100,null,650,120,70],lead_time_weeks:4});
  assert.deepEqual(result.result.positions, ["within",null,"within","within","within"]);
  assert.equal(result.result.dataset_version, DATASET_VERSION);
});

test("pricing: invalid, malformed, excessive or missing fields are rejected", () => {
  const changes = [
    {region:"invalid"}, {prices:[]}, {prices:[100]}, {prices:[100,20,30,40,0]},
    {prices:[100,20,30,40,50000.001]}, {prices:[100,20,30,40,NaN]},
    {prices:[100,20,30,40,Infinity]}, {prices:[null,null,null,null,null]},
    {prices:[100,"99",null,null,null]}, {leadTimeWeeks:0},{leadTimeWeeks:27},
    {leadTimeWeeks:"6"}, {submissionKey:"bad-key"},
    {dataNoticeAccepted:false}, {consentVersion:"wrong"},
  ];
  for (const change of changes) {
    assert.equal(validatePricingSubmission({...valid(),...change}).ok,false,JSON.stringify(change));
  }
  assert.equal(validatePricingSubmission(null).ok,false);
  assert.equal(validatePricingSubmission([]).ok,false);
});

test("pricing: London and demand signals are computed from validated input", () => {
  const result = validatePricingSubmission({...valid(),region:"london",leadTimeWeeks:7,prices:[80,null,1600,100,70]});
  assert.equal(result.ok,true);
  assert.equal(result.result.lead_time_signal,"strong");
  assert.deepEqual(result.result.positions,["below",null,"above","below","below"]);
  assert.equal(result.result.below,3);
  assert.equal(result.result.above,1);
});

test("pricing: identical replay accepted; changed inputs or consent rejected", () => {
  const incoming=validatePricingSubmission(valid());
  assert.equal(incoming.ok,true);
  const existing={normalized_inputs:incoming.normalized,consent_version:CONSENT_VERSION};
  assert.equal(isSamePricingSubmission(existing,incoming),true);
  assert.equal(isSamePricingSubmission({...existing,consent_version:"obsolete"},incoming),false);
  assert.equal(isSamePricingSubmission({...existing,normalized_inputs:{...incoming.normalized,lead_time_weeks:5}},incoming),false);
  assert.equal(isSamePricingSubmission({...existing,normalized_inputs:{...incoming.normalized,prices:[500,null,650,120,70]}},incoming),false);
});
