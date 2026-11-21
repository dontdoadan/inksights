import test from "node:test";
import assert from "node:assert/strict";
import {evaluateStage,VERSION,CONSENT_VERSION,STAGES,sameReplay} from "../supabase/functions/public-studio-journey/journey-policy.mjs";
const growthInput={
  dataNoticeAccepted:true,consentVersion:CONSENT_VERSION,
  studio:{name:"Example Studio",area:"London",website:"https://example.org",artistCount:5},
  figures:{month:"2026-10",enquiries:100,bookings:20,averageBookingGbp:400,availableHours:400,bookedHours:200,averageSessionHours:10}
};
const growth=evaluateStage("growth",growthInput);
const income=evaluateStage("revenue",{targetConversionPct:40,targetBookingGbp:400},{growth});
const visibility=evaluateStage("visibility",{
  listingClaimed:true,bookingLinkWorks:false,mobileBookingClear:false,EnquiriesRespondedPromptly:true,
},{growth});
test("four versioned stages exist",()=>assert.deepEqual(STAGES,["growth","revenue","visibility","summary"]));
test("Growth Check returns an unverified result and accurate ratios",()=>{
  assert.equal(growth.result.evidence,"SELF_REPORTED");
  assert.equal(growth.result.conversion_pct,20);
  assert.equal(growth.result.utilisation_pct,50);
  assert.equal(growth.result.booked_value_gbp,8000);
  assert.equal(growth.result.calculation_version,VERSION);
});
test("consent must be explicit; marketing consent not implied",()=>{
  assert.throws(()=>evaluateStage("growth",{...growthInput,dataNoticeAccepted:false}),/acknowledgement/);
  assert.deepEqual(growth.normalized.studio,{name:"Example Studio",area:"London",website:"https://example.org",artist_count:5});
});
test("impossible booking and capacity figures rejected",()=>{
  assert.throws(()=>evaluateStage("growth",{...growthInput,figures:{...growthInput.figures,bookings:101}}),/bookings/);
  assert.throws(()=>evaluateStage("growth",{...growthInput,figures:{...growthInput.figures,bookedHours:500}}),/booked hours/);
  assert.throws(()=>evaluateStage("growth",{...growthInput,figures:{...growthInput.figures,enquiries:Infinity}}),/enquiries/);
});
test("unsafe URL schemes and HTML input rejected",()=>{
  assert.throws(()=>evaluateStage("growth",{...growthInput,studio:{...growthInput.studio,website:"file:///etc/passwd"}}),/Website/);
  assert.throws(()=>evaluateStage("growth",{...growthInput,studio:{...growthInput.studio,name:"<script>alert(1)</script>"}}),/studio name/);
});
test("stage prerequisite fails closed",()=>{
  assert.throws(()=>evaluateStage("revenue",{targetConversionPct:40,targetBookingGbp:400}),/Growth Check/);
  assert.throws(()=>evaluateStage("summary",{}, {growth}),/revenue and visibility/);
});
test("financial scenario respects actual hours and never fabricates unlimited sales",()=>{
  assert.equal(income.result.baseline_booked_value_gbp,8000);
  assert.equal(income.result.additional_bookings,20);
  assert.equal(income.result.modelled_difference_gbp,8000);
  const full=evaluateStage("growth",{...growthInput,figures:{...growthInput.figures,bookedHours:400}});
  const limited=evaluateStage("revenue",{targetConversionPct:100,targetBookingGbp:400},{growth:full});
  assert.equal(limited.result.additional_bookings,0);
  assert.equal(limited.result.modelled_difference_gbp,0);
  assert.equal(limited.result.capacity_bound,true);
  assert.equal(limited.result.evidence,"MODELLED");
});
test("revenue scenario does not overwrite baseline nor claim profit",()=>{
  assert.equal(growth.normalized.figures.bookings,20);
  assert.ok(income.result.limitations.some(s=>/not recovered revenue, profit/.test(s)));
});
test("visibility self reports cannot become verified rankings",()=>{
  assert.equal(visibility.result.reported_friction_count,2);
  assert.equal(visibility.result.evidence,"SELF_REPORTED");
  assert.ok(visibility.result.limitations.some(s=>/not a live crawl/.test(s)));
});
test("summary requires upstream saved stage results",()=>{
  const summary=evaluateStage("summary",{},{growth,revenue:income,visibility});
  assert.equal(summary.result.step,"summary");
  assert.equal(summary.result.evidence,"MODELLED");
  assert.equal(summary.result.plan.length,3);
  assert.ok(summary.result.limitations.some(s=>s.includes("£395")));
});
test("idempotent replay only accepts same session, stage, consent and answers",()=>{
  const answer=growth.normalized;
  const row={tool_key:"unified_studio_journey_growth",tool_version:VERSION,consent_version:CONSENT_VERSION,normalized_inputs:{journey_hash:"abc",answer}};
  const context={stage:"growth",journeyHash:"abc",answer};
  assert.equal(sameReplay(row,context),true);
  assert.equal(sameReplay(row,{...context,journeyHash:"attacker"}),false);
  assert.equal(sameReplay(row,{...context,stage:"revenue"}),false);
  assert.equal(sameReplay(row,{...context,answer:{...answer,studio:{name:"different"}}}),false);
});

test("zero-booking studio can diagnose unfilled capacity without NaN",()=>{
  const zero=evaluateStage("growth",{...growthInput,figures:{...growthInput.figures,bookings:0,bookedHours:0}});
  assert.equal(zero.result.conversion_pct,0);
  assert.equal(zero.result.utilisation_pct,0);
  const scenario=evaluateStage("revenue",{targetConversionPct:20,targetBookingGbp:400},{growth:zero});
  assert.equal(scenario.result.additional_bookings,20);
  assert.equal(scenario.result.modelled_booked_value_gbp,8000);
});
test("invalid hours and contradictory zero-booking inputs rejected",()=>{
  assert.throws(()=>evaluateStage("growth",{...growthInput,figures:{...growthInput.figures,averageSessionHours:0}}),/session hours/);
  assert.throws(()=>evaluateStage("growth",{...growthInput,figures:{...growthInput.figures,bookings:0,bookedHours:20}}),/internally consistent/);
  assert.throws(()=>evaluateStage("growth",{...growthInput,figures:{...growthInput.figures,bookings:5,bookedHours:0}}),/internally consistent/);
});
