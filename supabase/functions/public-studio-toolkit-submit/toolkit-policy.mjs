// INKSIGHTS Studio Growth Toolkit scoring and validation, 2026-10-v1.
// Pure JavaScript: shared by the intake function and Node regression tests.
// All public inputs are self-reported. No result becomes a verified benchmark.
export const TOOL_VERSION = "2026-10-toolkit-v1";
export const CONSENT_VERSION = "2026-10-tool-v1";
export const KEYS = ["studio_growth_constraint","revenue_lift_90_day","studio_revenue_scenario","revenue_leakage_27","studio_partnership_planner"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_NAME = /^[\p{L}\p{N}][\p{L}\p{N} .,'&()\/+\-]{1,119}$/u;
const categories = ["Acquisition and enquiries","Booking and transaction value","Project continuity and retention"];
const questionsPerGroup = 4;
const weakestActions = [
  ["Document one source-to-enquiry journey and its conversion rate.","Audit Google, social, referrals and response handling before spending more on ads."],
  ["Review enquiries to deposit, session pricing and qualification.","Compare realised revenue per attended artist-hour before raising or discounting prices."],
  ["Add a project-continuation and healed-work follow-up workflow.","Measure repeat sessions and referrals by client cohort, without double-counting revenue."],
];
const leakageCategories = [
  "Enquiry and booking conversion","Studio capacity and commercial economics","Client continuity and partner leverage"
];
const leakageActions = [
  "Trace each enquiry through qualification, deposit and attended session; remove the largest proven drop-off.",
  "Compare sellable artist-hours with attended session-hours, including workstation limits and diary fragmentation.",
  "Set up measured follow-ups for unfinished projects, healed results, rebooking and suitable partners.",
];
const partnerFields = ["audience_fit","trust","distribution","mutual_value","decision_access"];
function own(o,k) { return Object.prototype.hasOwnProperty.call(o,k); }
function fail(message) { throw new Error(message); }
function cleanText(x,max=120) { if (typeof x !== "string") return ""; return x.trim().replace(/\s+/g," ").slice(0,max); }
function num(x,min,max,key) {
  if (typeof x !== "number" || !Number.isFinite(x) || x < min || x > max) fail("Invalid or missing value: "+key+".");
  return Math.round(x * 100) / 100;
}
function int(x,min,max,key) {
  if (!Number.isInteger(x) || x < min || x > max) fail("Invalid or missing value: "+key+".");
  return x;
}
function compact(n) {return Math.round(n*100)/100}
function urlValue(raw) {
  if (raw === "") return null;
  if (raw.length > 240) fail("Studio website is too long.");
  let u; try { u = new URL(raw); } catch { fail("Enter a full website URL, starting with https://."); }
  if (!["http:","https:"].includes(u.protocol) || !u.hostname.includes(".") || u.username || u.password) fail("Invalid public studio website.");
  return u.origin + u.pathname.replace(/\/+$/,"");
}
function normalizeStudio(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) fail("Studio information is required.");
  const name=cleanText(data.name,120);
  if (!VALID_NAME.test(name)) fail("Enter a valid studio name.");
  const area=cleanText(data.area,100);
  const website=urlValue(cleanText(data.website,240));
  const artists=int(data.artistCount,1,100,"artist count");
  return {name,area:area||null,website,artist_count:artists};
}
function normalizeContact(data) {
  if (!data || typeof data!=="object" || Array.isArray(data)) data={};
  const name=cleanText(data.name,100);
  const email=cleanText(data.email,180).toLowerCase();
  if (email && (!EMAIL.test(email) || email.length>180)) fail("Enter a valid email address.");
  if (data.followUpRequested === true && !email) fail("Add an email address to request follow-up.");
  if (data.marketingConsent === true && !email) fail("Add an email address to opt in to updates.");
  return {name:name||null,email:email||null,follow_up_requested:data.followUpRequested===true,marketing_consent:data.marketingConsent===true};
}
function diagnostic(answers) {
  if (!answers || !Array.isArray(answers.ratings) || answers.ratings.length!==12) fail("Answer all 12 diagnostic questions.");
  const ratings=answers.ratings.map((n,i)=>int(n,1,5,"diagnostic question "+(i+1)));
  const sections=categories.map((name,i)=>({name,score:ratings.slice(i*questionsPerGroup,(i+1)*questionsPerGroup).reduce((a,b)=>a+b,0),max_score:20}));
  const total=sections.reduce((n,g)=>n+g.score,0);
  const lowest=sections.reduce((best,g,i)=>g.score<sections[best].score?i:best,0);
  return {answers:{ratings},result:{
    kind:"score",title:"Studio Growth Constraint Diagnostic",score:total,max_score:60,sections,
    headline:"Start by investigating "+categories[lowest].toLowerCase()+".",
    priority:categories[lowest],actions:weakestActions[lowest],
    evidence_label:"SELF_REPORTED",caveats:["A low score identifies a reported system weakness, not proven lost revenue.","Ratings are not representative industry benchmarks. Validate the priority with enquiry, booking and capacity records."]}};
}
const ECON_FIELDS=[
  ["new_enquiries",0,100000],["enquiry_to_deposit_pct",0,100],["repeat_booked_sessions",0,30000],
  ["attendance_pct",0,100],["value_per_session_gbp",0.01,50000],
  ["session_hours",0.25,16],["sellable_artist_hours",1,30000]
];
function model(input,label) {
  if(!input || typeof input!=="object" || Array.isArray(input)) fail(label+" figures are missing.");
  const x={};
  for(const [key,min,max] of ECON_FIELDS) x[key]=num(input[key],min,max,label+" "+key);
  const booked=x.new_enquiries*x.enquiry_to_deposit_pct/100 + x.repeat_booked_sessions;
  const demand=booked*x.attendance_pct/100;
  const capacity=x.sellable_artist_hours/x.session_hours;
  const completed=Math.min(demand,capacity);
  const revenue=completed*x.value_per_session_gbp;
  const utilization=completed*x.session_hours/x.sellable_artist_hours*100;
  return {input:x,booked:compact(booked),demand_sessions:compact(demand),capacity_sessions:compact(capacity),completed_sessions:compact(completed),monthly_revenue_gbp:compact(revenue),utilisation_pct:compact(utilization),capacity_limited:demand>capacity};
}
function economic(answers,key) {
  const current=model(answers?.current,"Current");
  const target=model(answers?.target,"Target");
  const uplift=compact(target.monthly_revenue_gbp-current.monthly_revenue_gbp);
  const percent=current.monthly_revenue_gbp>0 ? compact(uplift/current.monthly_revenue_gbp*100):null;
  const gap= current.capacity_limited ? "Available sellable artist-hours currently cap modelled session throughput." : "Modelled session demand is currently below sellable artist-hour capacity.";
  return {answers:{current:current.input,target:target.input},result:{
    kind:"economics",title:key==="revenue_lift_90_day"?"90-Day Revenue Lift Assessment":"Studio Revenue Scenario Calculator",
    headline:uplift>=0?"Modelled monthly revenue upside: £"+uplift.toLocaleString("en-GB"):"Target scenario models a revenue decline.",
    priority:current.capacity_limited?"Capacity and delivery":"Enquiry conversion and session demand",
    current,target,monthly_difference_gbp:uplift,relative_difference_pct:percent,
    actions:current.capacity_limited?[
      "Validate available chair-hours, workstation capacity, artist schedules and session duration before attracting more demand.",
      "Pilot diary design or conversion of fragmented gaps; compare attended revenue per sellable hour."
    ]:[
      "Measure the enquiry-to-deposit journey and separate new project enquiries from existing booked repeat sessions.",
      "Pilot one controlled improvement and compare attended sessions over the next 90 days."
    ],
    evidence_label:"MODELLED",
    caveats:[gap,"Both scenarios are arithmetic illustrations using your inputs, not revenue forecasts or measured leakage.","Gross revenue is not contribution or profit. Returning booked sessions must not be included again in new enquiries.","Capacity is simplified to sellable artist-hours divided by typical session length; validate workstation and artist constraints."]}};
}
function leakage(answers) {
  if(!answers||!Array.isArray(answers.checks)||answers.checks.length!==27||!answers.checks.every(v=>typeof v==="boolean")) fail("Provide all 27 checklist responses.");
  const checks=[...answers.checks], sections=leakageCategories.map((name,i)=>({
    name,score:checks.slice(i*9,(i+1)*9).filter(Boolean).length,max_score:9
  }));
  const total=sections.reduce((n,x)=>n+x.score,0);
  const weakest=sections.reduce((best,g,i)=>g.score<sections[best].score?i:best,0);
  return {answers:{checks},result:{
    kind:"score",title:"27-Point Revenue Leakage Audit",score:total,max_score:27,sections,
    headline:"Investigate "+leakageCategories[weakest].toLowerCase()+" first.",
    priority:leakageCategories[weakest],open_checks:checks.map((v,i)=>v?null:i+1).filter(Boolean),
    actions:[leakageActions[weakest],"Verify the commercial impact before assigning a pound-value to unchecked controls."],
    evidence_label:"SELF_REPORTED",caveats:["An unchecked control is an investigation opportunity, not evidence of revenue loss.","All controls have equal questionnaire weight; prioritise by expected impact, confidence, effort and available capacity."]}};
}
function partnerships(answers){
  if(!answers||!Array.isArray(answers.partners)||answers.partners.length<1||answers.partners.length>3) fail("Score between one and three partners.");
  const partners=answers.partners.map((p,i)=>{
    if(!p||typeof p!=="object"||Array.isArray(p)) fail("Invalid partner entry.");
    const name=cleanText(p.name,90); if(name.length<2) fail("Enter a partner name for row "+(i+1)+".");
    const criteria={};
    for(const f of partnerFields)criteria[f]=int(p[f],1,5,"partner "+name+" "+f);
    return {name,criteria,score:Object.values(criteria).reduce((a,b)=>a+b,0),max_score:25};
  });
  const sorted=[...partners].sort((a,b)=>b.score-a.score);
  return {answers:{partners:partners.map(p=>({name:p.name,...p.criteria}))},result:{
    kind:"partners",title:"Studio Partnership Opportunity Planner",
    headline:"Highest-scoring potential partner: "+sorted[0].name+".",
    priority:sorted[0].name,partners:sorted,
    actions:["Agree the audience, reciprocal value, tracking method and decision-maker before launching.","Record attributed enquiries, deposits and attended sessions; check advertising disclosures, consent and fair referral terms."],
    evidence_label:"SELF_REPORTED",caveats:["Scores describe preliminary partner fit; they do not predict referral volumes or commercial outcomes.","Never share customer contact lists without a lawful basis and appropriate permissions."]}};
}
export function validateToolkitInput(data) {
  try {
    if(!data||typeof data!=="object"||Array.isArray(data)) fail("Invalid submission.");
    if(!KEYS.includes(data.toolKey)) fail("Unknown assessment type.");
    if(data.toolVersion!==TOOL_VERSION || data.consentVersion!==CONSENT_VERSION || data.dataNoticeAccepted!==true) fail("Outdated form or missing data-use acknowledgement.");
    if(typeof data.submissionKey!=="string"||!UUID.test(data.submissionKey)) fail("Invalid submission identifier.");
    if(data.website_honeypot) fail("Submission rejected.");
    const studio=normalizeStudio(data.studio),contact=normalizeContact(data.contact);
    let computed;
    if(data.toolKey==="studio_growth_constraint") computed=diagnostic(data.answers);
    else if(data.toolKey==="revenue_leakage_27") computed=leakage(data.answers);
    else if(data.toolKey==="studio_partnership_planner") computed=partnerships(data.answers);
    else computed=economic(data.answers,data.toolKey);
    return {ok:true,toolKey:data.toolKey,submissionKey:data.submissionKey,
      normalized:{studio,contact,answers:computed.answers},result:{...computed.result,tool_version:TOOL_VERSION}};
  } catch(e){return {ok:false,error:e instanceof Error?e.message:"Invalid assessment."};}
}
function canonical(v) {
  if(Array.isArray(v)) return v.map(canonical);
  if(v!==null&&typeof v==="object") return Object.keys(v).sort().reduce((o,k)=>(o[k]=canonical(v[k]),o),{});
  return v;
}
export function isSameToolkitSubmission(existing,checked) {
  if(!existing||!checked?.ok||existing.tool_key!==checked.toolKey||existing.tool_version!==TOOL_VERSION||existing.consent_version!==CONSENT_VERSION)return false;
  return JSON.stringify(canonical(existing.normalized_inputs))===JSON.stringify(canonical(checked.normalized));
}
