import test from "node:test";
import assert from "node:assert/strict";
import {
  TOOL_VERSION, CONSENT_VERSION, validateToolkitInput, isSameToolkitSubmission
} from "../supabase/functions/public-studio-toolkit-submit/toolkit-policy.mjs";

const base={
  toolVersion:TOOL_VERSION,consentVersion:CONSENT_VERSION,dataNoticeAccepted:true,
  submissionKey:"a69a36ab-8427-4951-afc0-638d9fe71011",
  studio:{name:"Example UK Tattoo Studio",area:"Croydon",artistCount:5,website:"https://example.com/studio/"},
  contact:{name:"Alex",email:"alex@example.com",followUpRequested:true,marketingConsent:false},
};
function check(toolKey,answers){return validateToolkitInput({...base,toolKey,answers})}
const current={
  new_enquiries:100,enquiry_to_deposit_pct:50,repeat_booked_sessions:10,
  attendance_pct:90,value_per_session_gbp:300,session_hours:4,sellable_artist_hours:160,
};
const target={...current,new_enquiries:130,sellable_artist_hours:240};

test("scores 12 questions and selects weakest studio lever",()=>{
  const x=check("studio_growth_constraint",{ratings:[...Array(4).fill(5),...Array(4).fill(2),...Array(4).fill(4)]});
  assert.equal(x.ok,true);
  assert.equal(x.result.score,44);
  assert.equal(x.result.max_score,60);
  assert.equal(x.result.priority,"Booking and transaction value");
  assert.equal(x.result.evidence_label,"SELF_REPORTED");
});

test("rejects missing or exaggerated diagnostic responses",()=>{
  assert.equal(check("studio_growth_constraint",{ratings:Array(11).fill(2)}).ok,false);
  assert.equal(check("studio_growth_constraint",{ratings:Array(12).fill(8)}).ok,false);
});

test("models attended sessions without double counting repeats, then caps chair-hours",()=>{
  const x=check("studio_revenue_scenario",{current,target});
  assert.equal(x.ok,true);
  assert.equal(x.result.current.completed_sessions,40);
  assert.equal(x.result.current.monthly_revenue_gbp,12000);
  assert.equal(x.result.target.completed_sessions,60);
  assert.equal(x.result.target.monthly_revenue_gbp,18000);
  assert.equal(x.result.monthly_difference_gbp,6000);
  assert.equal(x.result.evidence_label,"MODELLED");
});
test("rejects unrealistic economics and nonnumeric inputs",()=>{
  assert.equal(check("revenue_lift_90_day",{current:{...current,attendance_pct:110},target}).ok,false);
  assert.equal(check("revenue_lift_90_day",{current:{...current,session_hours:0},target}).ok,false);
  assert.equal(check("revenue_lift_90_day",{current:{...current,value_per_session_gbp:"300"},target}).ok,false);
});

test("27-control audit reports a score not an invented revenue value",()=>{
  const empty=check("revenue_leakage_27",{checks:Array(27).fill(false)});
  assert.equal(empty.result.score,0);
  assert.equal(empty.result.open_checks.length,27);
  const complete=check("revenue_leakage_27",{checks:Array(27).fill(true)});
  assert.equal(complete.result.score,27);
  assert.equal("monthly_difference_gbp" in complete.result,false);
});

test("partner scoring sorts strongest first and requires complete ratings",()=>{
  const a={name:"Supplier A",audience_fit:3,trust:3,distribution:3,mutual_value:3,decision_access:3};
  const b={name:"Convention B",audience_fit:5,trust:5,distribution:5,mutual_value:5,decision_access:5};
  const x=check("studio_partnership_planner",{partners:[a,b]});
  assert.equal(x.result.partners[0].name,"Convention B");
  assert.equal(x.result.partners[0].score,25);
  assert.equal(check("studio_partnership_planner",{partners:[{...a,trust:null}]}).ok,false);
});

test("consent, contact and website validation",()=>{
  assert.equal(validateToolkitInput({...base,toolKey:"revenue_leakage_27",answers:{checks:Array(27).fill(true)},dataNoticeAccepted:false}).ok,false);
  assert.equal(validateToolkitInput({...base,toolKey:"revenue_leakage_27",answers:{checks:Array(27).fill(true)},contact:{email:"",marketingConsent:true}}).ok,false);
  assert.equal(validateToolkitInput({...base,toolKey:"revenue_leakage_27",answers:{checks:Array(27).fill(true)},studio:{...base.studio,website:"javascript:alert(1)"}}).ok,false);
});

test("idempotency replay accepts identical canonical input, rejects altered identity or answers",()=>{
  const x=check("studio_growth_constraint",{ratings:Array(12).fill(3)});
  assert.equal(x.ok,true);
  const existing={tool_key:x.toolKey,tool_version:TOOL_VERSION,consent_version:CONSENT_VERSION,normalized_inputs:x.normalized};
  assert.equal(isSameToolkitSubmission(existing,x),true);
  const tampered=check("studio_growth_constraint",{ratings:[4,...Array(11).fill(3)]});
  assert.equal(isSameToolkitSubmission(existing,tampered),false);
  const different=validateToolkitInput({...base,toolKey:"studio_growth_constraint",answers:{ratings:Array(12).fill(3)},studio:{...base.studio,name:"Another Tattoo Studio"}});
  assert.equal(isSameToolkitSubmission(existing,different),false);
});
