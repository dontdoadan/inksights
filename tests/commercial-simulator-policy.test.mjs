import assert from "node:assert/strict";
import { test } from "node:test";
import { TOOLS, CONSENT_VERSION, MODEL_VERSION, evaluate, validateScenario, isSameScenario } from "../supabase/functions/public-commercial-simulator-submit/simulator-policy.mjs";

const key="47763da8-c5ca-47ce-969b-6aaf13b8a161";
function input(toolKey, fields={}) {
  return {
    toolKey, submissionKey:key, consentVersion:CONSENT_VERSION, dataNoticeAccepted:true,
    inputs:Object.fromEntries(Object.entries(TOOLS[toolKey].inputs).map(([field, range])=>[field, fields[field] ?? range[2]])),
  };
}
test("seven models are versioned, validate and yield finite measurements",()=>{
  assert.equal(MODEL_VERSION,"commercial-simulators-v1");
  assert.equal(Object.keys(TOOLS).length,7);
  for(const name of Object.keys(TOOLS)){
    const checked=validateScenario(input(name));
    assert.equal(checked.ok,true,name);
    const result=checked.results;
    for (const [field,value] of Object.entries(result)){
      assert.ok(value===null||(typeof value==="number"&&Number.isFinite(value)),name+":"+field);
    }
  }
});
test("campaign economics computes bookings, contribution and break-even correctly",()=>{
  const result=evaluate("campaign_economics",{
    spend:500,impressions:20000,ctr_pct:2,landing_conversion_pct:8,
    enquiry_booking_pct:25,booking_value:400,variable_cost_pct:35,
  });
  assert.equal(result.clicks,400);
  assert.equal(result.enquiries,32);
  assert.equal(result.bookings,8);
  assert.equal(result.revenue_gbp,3200);
  assert.equal(result.roas,6.4);
  assert.equal(result.campaign_contribution_gbp,1580);
  assert.equal(result.break_even_bookings,2);
});
test("lead conversion differentiates revenue from contribution and preserves negative changes",()=>{
  const result=evaluate("lead_conversion",{monthly_enquiries:100,current_booking_pct:30,improved_booking_pct:20,booking_value:400,variable_cost_pct:35});
  assert.equal(result.additional_bookings,-10);
  assert.equal(result.monthly_revenue_change_gbp,-4000);
  assert.equal(result.monthly_contribution_change_gbp,-2600);
});
test("target enquiries rounds bookings and enquiries upwards",()=>{
  assert.deepEqual(evaluate("revenue_target",{target_revenue:20000,booking_value:400,enquiry_booking_pct:25}),
    {required_bookings:50,required_enquiries:200,target_revenue_gbp:20000});
});
test("capacity and booking leakage avoid double-counting",()=>{
  const capacity=evaluate("studio_capacity",{artists:4,working_days:20,hours_per_day:7,current_utilisation_pct:50,improved_utilisation_pct:75,revenue_per_booked_hour:65});
  assert.equal(capacity.additional_booked_hours,140);
  assert.equal(capacity.monthly_revenue_change_gbp,9100);
  const leakage=evaluate("booking_leakage",{scheduled_bookings:100,cancellation_pct:7,no_show_pct:3,recovery_pct:40,booking_value:400,variable_cost_pct:35});
  assert.equal(leakage.missed_bookings,10);
  assert.equal(leakage.recoverable_bookings,4);
  assert.equal(leakage.recovered_contribution_gbp,1040);
});
test("referral model only counts first-generation bookings",()=>{
  const r=evaluate("lifetime_value",{average_session_value:400,sessions_per_client:3,referrals_per_client:0.5,referral_booking_pct:40,variable_cost_pct:35});
  assert.equal(r.direct_client_value_gbp,1200);
  assert.equal(r.first_generation_referral_value_gbp,240);
  assert.equal(r.combined_first_generation_value_gbp,1440);
});
test("reject invalid numbers, missing input, unknown keys and malicious tool names",()=>{
  let scenario=input("booking_leakage",{no_show_pct:98,cancellation_pct:3});
  assert.equal(validateScenario(scenario).ok,false);
  scenario=input("lead_conversion");
  scenario.inputs.monthly_enquiries=Number.NaN;
  assert.equal(validateScenario(scenario).ok,false);
  scenario=input("lead_conversion");
  scenario.inputs.extra=123;
  assert.equal(validateScenario(scenario).ok,false);
  assert.equal(validateScenario({...input("lead_conversion"),toolKey:"constructor"}).ok,false);
  assert.equal(validateScenario({...input("lead_conversion"),dataNoticeAccepted:false}).ok,false);
  assert.equal(validateScenario({...input("lead_conversion"),submissionKey:"invalid"}).ok,false);
});
test("repeat idempotency requires identical inputs, consent, studio context",()=>{
  const c=validateScenario(input("lead_conversion"));
  assert.equal(c.ok,true);
  const prior={
    tool_key:c.toolKey, tool_version:"1", consent_version:CONSENT_VERSION,
    normalized_inputs:Object.fromEntries(Object.entries(c.normalized).reverse()),
    studio_id:null, studio_name:null, studio_website:null,
  };
  assert.equal(isSameScenario(prior,c,null),true);
  assert.equal(isSameScenario(prior,c,"83c3436e-0ed0-467c-b377-cf19dbcb4f8b"),false);
  assert.equal(isSameScenario({...prior,normalized_inputs:{...prior.normalized_inputs,booking_value:1}},c,null),false);
});
