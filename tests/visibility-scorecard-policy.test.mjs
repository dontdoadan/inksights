import test from "node:test";
import assert from "node:assert/strict";
import { validateScorecardInput, isSameScorecard, SCORECARD_VERSION, CONSENT_VERSION } from "../supabase/functions/public-visibility-scorecard-submit/scorecard-policy.mjs";
const key="423e4567-e89b-42d3-a456-426614174003";
const valid=()=>({checkedIds:["gbp-complete","indexable","reviews"],submissionKey:key,scorecardVersion:SCORECARD_VERSION,consentVersion:CONSENT_VERSION,dataNoticeAccepted:true});

test("Scorecard: deterministic 15-point self-report calculation",()=>{
 const x=validateScorecardInput(valid());assert.equal(x.ok,true);
 assert.equal(x.result.score,20);assert.equal(x.result.checked_count,3);
 assert.equal(x.result.sections.length,5);
 assert.equal(x.result.quality_status,"unverified_self_report");
 assert.equal(x.result.gaps.length,12);
 assert.equal(x.result.weakest_area,"conversion");
});
test("Scorecard: unknown, repeated and malformed IDs or consent are rejected",()=>{
 for(const change of [{checkedIds:["unknown"]},{checkedIds:["gbp-complete","gbp-complete"]},{checkedIds:"gbp-complete"},{checkedIds:new Array(16).fill("gbp-complete")},{scorecardVersion:"invalid"},{consentVersion:"invalid"},{dataNoticeAccepted:false},{submissionKey:"bad"}]){
  assert.equal(validateScorecardInput({...valid(),...change}).ok,false,JSON.stringify(change));
 }
 assert.equal(validateScorecardInput(null).ok,false);
});
test("Scorecard: zero answers is valid but gives no manufactured positive score",()=>{
 const x=validateScorecardInput({...valid(),checkedIds:[]});assert.equal(x.ok,true);assert.equal(x.result.score,0);assert.equal(x.result.gaps.length,15);
});
test("Scorecard: exact replay matches; changed selections cannot reuse key",()=>{
 const x=validateScorecardInput(valid());
 const old={normalized_inputs:x.normalized,consent_version:CONSENT_VERSION};
 assert.equal(isSameScorecard(old,x),true);
 assert.equal(isSameScorecard({...old,consent_version:"wrong"},x),false);
 assert.equal(isSameScorecard({...old,normalized_inputs:{...x.normalized,checked_ids:["reviews"]}},x),false);
});
