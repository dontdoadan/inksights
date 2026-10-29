/**
 * INKSIGHTS Commercial Simulator Lab — canonical, server-side scenario policy.
 * Numerical estimates are MODELLED, not measured outcomes.
 * Values are GBP and percentage inputs use 0..100, not fractions.
 */
export const CONSENT_VERSION = "2026-10-commercial-tools-v1";
export const MODEL_VERSION = "commercial-simulators-v1";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const money = n => Math.round((n + Number.EPSILON) * 100) / 100;
const pct = (n) => n / 100;

export const TOOLS = Object.freeze({
  campaign_economics: {
    label: "Campaign Economics Simulator",
    inputs: { spend: [0, 1000000, 500], impressions: [0, 100000000, 20000], ctr_pct: [0, 100, 2], landing_conversion_pct: [0, 100, 8], enquiry_booking_pct: [0, 100, 30], booking_value: [0, 100000, 400], variable_cost_pct: [0, 100, 35] },
  },
  lead_conversion: {
    label: "Lead Conversion Scenario",
    inputs: { monthly_enquiries: [0, 1000000, 100], current_booking_pct: [0, 100, 25], improved_booking_pct: [0, 100, 35], booking_value: [0, 100000, 400], variable_cost_pct: [0, 100, 35] },
  },
  revenue_target: {
    label: "Revenue Target Planner",
    inputs: { target_revenue: [0, 100000000, 20000], booking_value: [0.01, 100000, 400], enquiry_booking_pct: [0.01, 100, 30] },
  },
  lifetime_value: {
    label: "Client Lifetime Value & Referrals",
    inputs: { average_session_value: [0, 100000, 400], sessions_per_client: [0, 100, 3], referrals_per_client: [0, 50, 0.5], referral_booking_pct: [0, 100, 40], variable_cost_pct: [0, 100, 35] },
  },
  studio_capacity: {
    label: "Studio Capacity & Utilisation",
    inputs: { artists: [1, 300, 4], working_days: [1, 31, 20], hours_per_day: [0.5, 24, 7], current_utilisation_pct: [0, 100, 55], improved_utilisation_pct: [0, 100, 70], revenue_per_booked_hour: [0, 10000, 65] },
  },
  pricing_sensitivity: {
    label: "Pricing Sensitivity",
    inputs: { baseline_bookings: [0, 100000, 50], baseline_price: [0, 100000, 350], proposed_price: [0, 100000, 400], booking_attrition_pct: [0, 100, 10], variable_cost_pct: [0, 100, 35] },
  },
  booking_leakage: {
    label: "No-Show & Booking Leakage",
    inputs: { scheduled_bookings: [0, 100000, 80], cancellation_pct: [0, 100, 7], no_show_pct: [0, 100, 3], recovery_pct: [0, 100, 40], booking_value: [0, 100000, 400], variable_cost_pct: [0, 100, 35] },
  },
});

export function evaluate(toolKey, x) {
  switch (toolKey) {
    case "campaign_economics": {
      const clicks = x.impressions * pct(x.ctr_pct);
      const enquiries = clicks * pct(x.landing_conversion_pct);
      const bookings = enquiries * pct(x.enquiry_booking_pct);
      const revenue = bookings * x.booking_value;
      const grossContribution = revenue * (1 - pct(x.variable_cost_pct));
      return { clicks:money(clicks), enquiries:money(enquiries), bookings:money(bookings), revenue_gbp:money(revenue), roas: x.spend > 0 ? money(revenue/x.spend) : null, cost_per_booking_gbp:bookings > 0?money(x.spend/bookings):null, campaign_contribution_gbp:money(grossContribution-x.spend), break_even_bookings:x.booking_value*(1-pct(x.variable_cost_pct))>0?Math.ceil(x.spend/(x.booking_value*(1-pct(x.variable_cost_pct)))):null };
    }
    case "lead_conversion": {
      const current = x.monthly_enquiries*pct(x.current_booking_pct), improved = x.monthly_enquiries*pct(x.improved_booking_pct);
      return { current_bookings:money(current), improved_bookings:money(improved), additional_bookings:money(improved-current), monthly_revenue_change_gbp:money((improved-current)*x.booking_value), monthly_contribution_change_gbp:money((improved-current)*x.booking_value*(1-pct(x.variable_cost_pct))) };
    }
    case "revenue_target": {
      const bookings = Math.ceil(x.target_revenue/x.booking_value);
      return { required_bookings:bookings, required_enquiries:Math.ceil(bookings/pct(x.enquiry_booking_pct)), target_revenue_gbp:money(x.target_revenue) };
    }
    case "lifetime_value": {
      const base=x.average_session_value*x.sessions_per_client;
      const firstGen=base*x.referrals_per_client*pct(x.referral_booking_pct);
      return { direct_client_value_gbp:money(base), first_generation_referral_value_gbp:money(firstGen), combined_first_generation_value_gbp:money(base+firstGen), combined_first_generation_contribution_gbp:money((base+firstGen)*(1-pct(x.variable_cost_pct))) };
    }
    case "studio_capacity": {
      const available=x.artists*x.working_days*x.hours_per_day;
      const current=available*pct(x.current_utilisation_pct), improved=available*pct(x.improved_utilisation_pct);
      return { available_hours:money(available), current_booked_hours:money(current), improved_booked_hours:money(improved), additional_booked_hours:money(improved-current), monthly_revenue_change_gbp:money((improved-current)*x.revenue_per_booked_hour) };
    }
    case "pricing_sensitivity": {
      const current=x.baseline_bookings*x.baseline_price;
      const projected=x.baseline_bookings*(1-pct(x.booking_attrition_pct))*x.proposed_price;
      return { current_revenue_gbp:money(current), projected_revenue_gbp:money(projected), revenue_change_gbp:money(projected-current), contribution_change_gbp:money((projected-current)*(1-pct(x.variable_cost_pct))) };
    }
    case "booking_leakage": {
      const missed=x.scheduled_bookings*pct(x.cancellation_pct+x.no_show_pct);
      const recovered=missed*pct(x.recovery_pct);
      return { missed_bookings:money(missed), modelled_at_risk_revenue_gbp:money(missed*x.booking_value), recoverable_bookings:money(recovered), recovered_revenue_gbp:money(recovered*x.booking_value), recovered_contribution_gbp:money(recovered*x.booking_value*(1-pct(x.variable_cost_pct))) };
    }
    default: throw new Error("Unknown simulator");
  }
}

export function validateScenario(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {ok:false,error:"Invalid submission"};
  const spec=TOOLS[data.toolKey];
  if (!spec) return {ok:false,error:"Unknown simulator"};
  if (typeof data.submissionKey!=="string" || !UUID.test(data.submissionKey)) return {ok:false,error:"Invalid submission key"};
  if (data.dataNoticeAccepted!==true || data.consentVersion!==CONSENT_VERSION) return {ok:false,error:"Data use acknowledgement required"};
  if (!data.inputs || typeof data.inputs!=="object" || Array.isArray(data.inputs)) return {ok:false,error:"Invalid inputs"};
  if (Object.keys(data.inputs).length!==Object.keys(spec.inputs).length) return {ok:false,error:"Unexpected or missing fields"};
  const normalized={};
  for (const [name, bounds] of Object.entries(spec.inputs)) {
    const v=data.inputs[name];
    if (typeof v!=="number" || !Number.isFinite(v) || v<bounds[0] || v>bounds[1]) return {ok:false,error:"Invalid input: "+name};
    normalized[name]=Math.round(v*10000)/10000;
  }
  if (data.toolKey==="booking_leakage" && normalized.cancellation_pct+normalized.no_show_pct>100) return {ok:false,error:"Cancellation and no-show rates cannot exceed 100% combined"};
  const studioName=data.studioName===undefined?"":typeof data.studioName==="string"?data.studioName.trim():"";
  if (studioName.length>120 || (data.studioName!==undefined && typeof data.studioName!=="string")) return {ok:false,error:"Invalid studio name"};
  const studioWebsite=data.studioWebsite===undefined?"":typeof data.studioWebsite==="string"?data.studioWebsite.trim():"";
  if (studioWebsite.length>250 || (data.studioWebsite!==undefined && typeof data.studioWebsite!=="string")) return {ok:false,error:"Invalid studio website"};
  if (studioWebsite) {
    try { const url=new URL(studioWebsite);if(!["https:","http:"].includes(url.protocol)||!url.hostname.includes(".")) throw new Error(); }
    catch { return {ok:false,error:"Invalid studio website"}; }
  }
  const requestedStudioId=data.verifiedStudioId;
  if (requestedStudioId!==undefined && (typeof requestedStudioId!=="string"||!UUID.test(requestedStudioId))) return {ok:false,error:"Invalid studio identity"};
  const results=evaluate(data.toolKey,normalized);
  return {ok:true,submissionKey:data.submissionKey,toolKey:data.toolKey,normalized,results,studioName:studioName||null,studioWebsite:studioWebsite||null,requestedStudioId:requestedStudioId||null};
}

export function isSameScenario(previous, checked, studioId) {
  return Boolean(previous &&
    previous.tool_key===checked.toolKey &&
    previous.tool_version==="1" &&
    previous.consent_version===CONSENT_VERSION &&
    (previous.studio_id||null)===(studioId||null) &&
    (previous.studio_name||null)===checked.studioName &&
    (previous.studio_website||null)===checked.studioWebsite &&
    JSON.stringify(previous.normalized_inputs)===JSON.stringify(checked.normalized));
}
