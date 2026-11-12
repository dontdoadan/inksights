import test from "node:test";
import assert from "node:assert/strict";
import { VERSION } from "../supabase/functions/public-studio-journey/journey-policy.mjs";
import { projectJourneyHistory } from "../supabase/functions/public-studio-journey/projection-policy.mjs";
const row=(stage,id,t,answer={},result={})=>({
  stage,submission_id:id,submitted_at:"2026-10-23T00:00:"+String(t).padStart(2,"0")+".000Z",
  submission:{id,normalized_inputs:{step:stage,calculation_version:VERSION,answer},result_snapshot:result}
});
test("all four stages project into one profile without copying unrelated IDs",()=>{
  const h=projectJourneyHistory([row("growth","a",1),row("revenue","b",2),row("visibility","c",3),row("summary","d",4)]);
  assert.deepEqual(Object.keys(h),["growth","revenue","visibility","summary"]);
  assert.equal(h.revenue.submissionId,"b");
});
test("changed growth baseline invalidates stale revenue, visibility and summary",()=>{
  const h=projectJourneyHistory([row("growth","old",1),row("revenue","r",2),row("visibility","v",3),row("summary","s",4),row("growth","new",5)]);
  assert.deepEqual(Object.keys(h),["growth"]);
  assert.equal(h.growth.submissionId,"new");
});
test("changed visibility finding invalidates summary, preserves other saved stages",()=>{
  const h=projectJourneyHistory([row("growth","g",1),row("revenue","r",2),row("visibility","v1",3),row("summary","s",4),row("visibility","v2",5)]);
  assert.deepEqual(Object.keys(h),["growth","revenue","visibility"]);
  assert.equal(h.visibility.submissionId,"v2");
});
test("unsorted records are ordered deterministically and wrong calculation version excluded",()=>{
  const bad=row("revenue","bad",5);bad.submission.normalized_inputs.calculation_version="unsupported-v0";
  const h=projectJourneyHistory([row("summary","s",4),row("growth","g",1),row("revenue","r",2),row("visibility","v",3),bad]);
  assert.deepEqual(Object.keys(h),["growth","revenue","visibility","summary"]);
  assert.equal(h.revenue.submissionId,"r");
});
test("unknown stage, mismatched stage and malformed rows never become intelligence",()=>{
  const fake=row("growth","fake",1);fake.submission.normalized_inputs.step="revenue";
  assert.deepEqual(projectJourneyHistory([fake,{stage:"unknown",submitted_at:"",submission:null}]),{});
});
