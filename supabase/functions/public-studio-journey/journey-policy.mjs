// INKSIGHTS shared public journey policy — pure, testable and side-effect free.
// All inputs are self-reported; all financial outputs are hypothetical.
export const VERSION = "2026-10-unified-journey-v1";
export const CONSENT_VERSION = "2026-10-tool-v1";
export const STAGES = ["growth", "revenue", "visibility", "summary"];
const fail = (msg) => { throw new Error(msg); };
const integer = (x, key, min, max) => {
  if (typeof x !== "number" || !Number.isInteger(x) || x < min || x > max) fail("Invalid " + key + ".");
  return x;
};
const numeric = (x, key, min, max) => {
  if (typeof x !== "number" || !Number.isFinite(x) || x < min || x > max) fail("Invalid " + key + ".");
  return Math.round(x * 100) / 100;
};
const round = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
const text = (s, max, key) => {
  if (typeof s !== "string") fail("Invalid " + key + ".");
  const v = s.trim().replace(/\s+/g, " ");
  if (!v || v.length > max || /[<>\\]/.test(v)) fail("Invalid " + key + ".");
  return v;
};
const site = (s) => {
  if (s == null || s === "") return null;
  if (typeof s !== "string" || s.length > 240) fail("Invalid website.");
  let u;
  try { u = new URL(s); } catch { fail("Website must be a public HTTP(S) URL."); }
  if (!["https:", "http:"].includes(u.protocol) || !u.hostname.includes(".") ||
      u.username || u.password || u.hostname === "localhost" ||
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(u.hostname)) fail("Website must be a public HTTP(S) URL.");
  return u.origin + u.pathname.replace(/\/+$/, "");
};
const object = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const bool = (x, key) => {
  if (typeof x !== "boolean") fail("Invalid " + key + ".");
  return x;
};
export function evaluateStage(stage, input, history = {}) {
  if (!STAGES.includes(stage) || !object(input)) fail("Invalid assessment stage.");
  if (stage === "growth") {
    if (input.dataNoticeAccepted !== true || input.consentVersion !== CONSENT_VERSION) fail("Data-use acknowledgement is required.");
    const studio = object(input.studio) ? input.studio : {};
    const figures = object(input.figures) ? input.figures : {};
    const name = text(studio.name, 120, "studio name");
    const area = text(studio.area, 100, "studio area");
    const website = site(studio.website);
    const artists = integer(studio.artistCount, "artist count", 1, 100);
    const month = text(figures.month, 7, "reporting month");
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) fail("Reporting month must be YYYY-MM.");
    const enquiries = integer(figures.enquiries, "enquiries", 1, 100000);
    const bookings = integer(figures.bookings, "bookings", 1, enquiries);
    const averageValue = numeric(figures.averageBookingGbp, "booking value", 1, 50000);
    const available = numeric(figures.availableHours, "available hours", 1, 30000);
    const booked = numeric(figures.bookedHours, "booked hours", 0.25, available);
    const normalized = {studio:{name,area,website,artist_count:artists},figures:{month,enquiries,bookings,average_booking_gbp:averageValue,available_hours:available,booked_hours:booked}};
    const conversion = round(100 * bookings / enquiries);
    const utilization = round(100 * booked / available);
    return {normalized,result:{step:"growth",conversion_pct:conversion,utilisation_pct:utilization,booked_value_gbp:round(bookings*averageValue),priority:conversion < 35?"Investigate enquiry-to-booking conversion":utilization < 65?"Investigate unfilled artist capacity":"Validate current booking and retention constraints",evidence:"SELF_REPORTED",limitations:["Based on figures supplied by the visitor; not a verified business audit.","Booked value is not necessarily cash received in the same month."],calculation_version:VERSION}};
  }
  const growth = history.growth?.normalized || null;
  if (!growth) fail("Complete and save the Growth Check first.");
  if (stage === "revenue") {
    const target = numeric(input.targetConversionPct, "target conversion rate", 0, 100);
    const targetValue = numeric(input.targetBookingGbp, "target booking value", 1, 50000);
    const b = growth.figures;
    const initialRate = 100*b.bookings/b.enquiries;
    const hoursPerBooking = b.booked_hours/b.bookings;
    const demandChange = Math.max(0,b.enquiries*target/100-b.bookings);
    const capacityAdditional = Math.max(0,(b.available_hours-b.booked_hours)/hoursPerBooking);
    const additionalBookings = Math.min(demandChange,capacityAdditional);
    const baseline=round(b.bookings*b.average_booking_gbp);
    const potential=round(baseline + additionalBookings*targetValue + b.bookings*(targetValue-b.average_booking_gbp));
    return {normalized:{target_conversion_pct:target,target_booking_gbp:targetValue},result:{step:"revenue",baseline_booked_value_gbp:baseline,modelled_booked_value_gbp:potential,modelled_difference_gbp:round(potential-baseline),additional_bookings:round(additionalBookings),capacity_bound:capacityAdditional < demandChange,target_above_current:target>=initialRate,evidence:"MODELLED",limitations:["Scenario only: not recovered revenue, profit, cash, or a forecast.","Assumes representative demand, average session duration and sellable hours remain stable.","Do not add this opportunity to separate capacity or retention estimates."],calculation_version:VERSION}};
  }
  if (stage === "visibility") {
    const fields=["listingClaimed","bookingLinkWorks","mobileBookingClear","EnquiriesRespondedPromptly"];
    for (const k of fields) bool(input[k], k);
    const faults=[];
    if (!input.listingClaimed) faults.push("Check and claim the business listing");
    if (!input.bookingLinkWorks) faults.push("Repair the public booking link");
    if (!input.mobileBookingClear) faults.push("Clarify mobile booking instructions");
    if (!input.EnquiriesRespondedPromptly) faults.push("Review enquiry response handling");
    return {normalized:Object.fromEntries(fields.map(k=>[k,input[k]])),result:{step:"visibility",reported_friction_count:faults.length,reported_friction_points:faults,priority:faults[0]||"Request independent visibility evidence",evidence:"SELF_REPORTED",limitations:["These are visitor answers, not a live crawl, search rank observation or verified defect.","A 72-hour fix is conditional on access, scope and feasibility."],calculation_version:VERSION}};
  }
  const revenue=history.revenue?.result;
  const visibility=history.visibility?.result;
  if (!revenue || !visibility) fail("Save the revenue and visibility assessments first.");
  const priority=visibility.reported_friction_count>0?"Inspect the reported booking-path defects":revenue.modelled_difference_gbp>0?"Verify the revenue scenario with booking records":"Validate the baseline and investigate the next constraint";
  return {normalized:{sources:["growth","revenue","visibility"]},result:{step:"summary",priority,plan:[{days:"1–30",action:"Confirm ownership, consent, baseline and supporting data sources"},{days:"31–60",action:"Investigate the primary constraint and test one measured intervention"},{days:"61–90",action:"Review outcomes, quantify attributable change and decide next action"}],evidence:"MODELLED",limitations:["This summary does not constitute the £395 paid Studio Intelligence Audit.","No studio ownership or verified audit evidence is established by this anonymous assessment."],calculation_version:VERSION}};
}
export function sameReplay(existing, context) {
  return existing?.tool_key === "unified_studio_journey_" + context.stage &&
    existing?.tool_version === VERSION &&
    existing?.consent_version === CONSENT_VERSION &&
    existing?.normalized_inputs?.journey_hash === context.journeyHash &&
    JSON.stringify(existing?.normalized_inputs?.answer) === JSON.stringify(context.answer);
}
