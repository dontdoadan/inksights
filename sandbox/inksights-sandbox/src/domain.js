export const EVIDENCE_LABELS = ['VERIFIED', 'OBSERVED', 'MODELLED', 'CALCULATED', 'HYPOTHESIS'];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const pct = (value) => Math.round(value * 1000) / 10;

export function calculateMetrics(studio) {
  const utilisation = studio.available_hours > 0 ? studio.booked_hours / studio.available_hours : 0;
  const enquiryConversion = studio.enquiries > 0 ? studio.bookings / studio.enquiries : 0;
  const averageBookingValue = studio.bookings > 0 ? studio.revenue_monthly / studio.bookings : 0;
  const revenuePerAvailableHour = studio.available_hours > 0 ? studio.revenue_monthly / studio.available_hours : 0;

  return {
    revenue: studio.revenue_monthly,
    bookings: studio.bookings,
    utilisation_pct: pct(utilisation),
    new_clients: studio.new_clients,
    repeat_clients: studio.repeat_clients,
    average_booking_value: Math.round(averageBookingValue),
    cancellation_rate_pct: studio.cancellation_rate_pct,
    ltv: studio.ltv,
    revenue_per_available_hour: Math.round(revenuePerAvailableHour),
    contribution: studio.contribution,
    retention_pct: studio.retention_pct,
    deposit_conversion_pct: studio.deposit_conversion_pct,
    enquiry_conversion_pct: pct(enquiryConversion),
    consultation_conversion_pct: studio.consultation_conversion_pct,
    no_show_rate_pct: studio.no_show_rate_pct
  };
}

export function calculateIcpScore(studio) {
  const items = [
    ['3–8 artists', studio.artists >= 3 && studio.artists <= 8, 15],
    ['2+ years established', studio.years_established >= 2, 8],
    ['UK city / urban-suburban', Boolean(studio.city), 7],
    ['Premium pricing', studio.hourly_rate >= (studio.city === 'London' ? 150 : 120), 12],
    ['Professional website', studio.website_score >= 70, 10],
    ['Review footprint', studio.reviews_count >= 20, 8],
    ['Instagram presence', studio.instagram_followers >= 1000, 8],
    ['Manual booking friction', studio.manual_booking === true, 10],
    ['Deposit/process gap', studio.has_deposit === false, 8],
    ['Artist page gap', studio.artist_pages_complete === false, 6],
    ['Owner digital literacy', studio.owner_digital_literacy >= 2, 8]
  ];

  const score = items.reduce((sum, [, pass, weight]) => sum + (pass ? weight : 0), 0);
  return {
    score: clamp(score, 0, 100),
    breakdown: items.map(([criterion, pass, weight]) => ({
      criterion,
      points: pass ? weight : 0,
      possible: weight,
      status: pass ? 'MATCH' : 'NO_MATCH'
    }))
  };
}

function opportunity(id, title, impact, evidence, recommendation) {
  return { id, title, impact, evidence, recommendation };
}

export function buildGrowthCheck(studio) {
  const metrics = calculateMetrics(studio);
  const icp = calculateIcpScore(studio);

  const candidates = [
    {
      key: 'enquiry_conversion',
      severity: metrics.enquiry_conversion_pct < 35 ? 100 - metrics.enquiry_conversion_pct : 0,
      finding: 'A material share of enquiries is not converting into bookings.',
      diagnosis: 'Enquiry-to-booking conversion is the primary commercial constraint.',
      opportunity: opportunity('opp_conversion', 'Improve enquiry-to-booking conversion', 'HIGH', 'CALCULATED', 'Standardise enquiry handling, response SLAs, qualification and deposit collection.')
    },
    {
      key: 'utilisation',
      severity: metrics.utilisation_pct < 65 ? 65 - metrics.utilisation_pct : 0,
      finding: 'Available artist capacity is not being fully monetised.',
      diagnosis: 'Under-utilised bookable capacity is suppressing revenue.',
      opportunity: opportunity('opp_utilisation', 'Recover unused chair capacity', 'HIGH', 'CALCULATED', 'Match demand generation to artist availability and monitor revenue per available hour.')
    },
    {
      key: 'deposit',
      severity: studio.has_deposit ? 0 : 40,
      finding: 'The studio has no consistent deposit mechanism.',
      diagnosis: 'Booking commitment and cash collection are weaker than they need to be.',
      opportunity: opportunity('opp_deposit', 'Implement a standard deposit policy', 'MEDIUM', 'OBSERVED', 'Introduce an explicit deposit workflow tied to booking confirmation.')
    },
    {
      key: 'website',
      severity: studio.website_score < 70 ? 70 - studio.website_score : 0,
      finding: 'The website/customer journey is below the target quality threshold.',
      diagnosis: 'Digital conversion friction may be reducing qualified enquiry flow.',
      opportunity: opportunity('opp_journey', 'Improve the website booking journey', 'MEDIUM', 'OBSERVED', 'Clarify artist fit, pricing expectations, trust evidence and the next booking action.')
    },
    {
      key: 'retention',
      severity: metrics.retention_pct < 35 ? 35 - metrics.retention_pct : 0,
      finding: 'Repeat-client contribution is relatively low.',
      diagnosis: 'Retention is leaving lifetime value unrealised.',
      opportunity: opportunity('opp_retention', 'Increase repeat booking and reactivation', 'MEDIUM', 'CALCULATED', 'Introduce structured rebooking, follow-up and lapsed-client reactivation.')
    }
  ].sort((a, b) => b.severity - a.severity);

  const primary = candidates[0];
  const top = candidates.filter((item) => item.severity > 0).slice(0, 3);
  const selected = top.length ? top : candidates.slice(0, 3);

  return {
    studio_id: studio.id,
    studio_name: studio.name,
    synthetic: true,
    generated_at: new Date().toISOString(),
    icp,
    metrics,
    evidence: [
      { label: 'OBSERVED', statement: 'Synthetic studio profile and operating inputs.' },
      { label: 'CALCULATED', statement: 'Commercial KPIs derived from synthetic operating inputs.' },
      { label: 'MODELLED', statement: 'Opportunity impact is directional and not a client forecast.' }
    ],
    finding: primary.finding,
    diagnosis: primary.diagnosis,
    primary_constraint: primary.key,
    opportunities: selected.map((item) => item.opportunity)
  };
}

export function buildAudit(studio) {
  const growth = buildGrowthCheck(studio);
  const marketVisibility = clamp(Math.round((studio.website_score * 0.55) + (Math.min(studio.instagram_followers / 40, 100) * 0.25) + (Math.min(studio.reviews_count, 100) * 0.2)), 0, 100);
  const journeyScore = clamp(Math.round((studio.website_score * 0.7) + (growth.metrics.enquiry_conversion_pct * 0.3)), 0, 100);

  return {
    audit_id: 'audit_' + studio.id + '_' + Date.now(),
    synthetic: true,
    studio_id: studio.id,
    generated_at: new Date().toISOString(),
    status: 'COMPLETE',
    sections: {
      market_search_visibility: {
        score: marketVisibility,
        evidence: 'MODELLED',
        summary: 'Synthetic composite of website quality, social footprint and review footprint.'
      },
      competitor_context: {
        score: clamp(marketVisibility - 8, 0, 100),
        evidence: 'HYPOTHESIS',
        summary: 'Synthetic benchmark for workflow testing only.'
      },
      website_customer_journey: {
        score: journeyScore,
        evidence: 'CALCULATED',
        summary: 'Derived from synthetic website quality and enquiry conversion.'
      },
      operational_commercial: {
        score: clamp(Math.round((growth.metrics.utilisation_pct + growth.metrics.enquiry_conversion_pct + growth.metrics.retention_pct) / 3), 0, 100),
        evidence: 'CALCULATED',
        summary: 'Composite of utilisation, enquiry conversion and retention.'
      }
    },
    primary_constraint: growth.primary_constraint,
    findings: [growth.finding],
    diagnosis: growth.diagnosis,
    opportunities: growth.opportunities,
    recommendations: growth.opportunities.map((item, index) => ({
      priority: index + 1,
      title: item.recommendation,
      expected_impact: item.impact,
      effort: index === 0 ? 'MEDIUM' : 'LOW_TO_MEDIUM',
      evidence: item.evidence
    })),
    action_plan_90_days: [
      { period: 'Days 1–30', action: 'Instrument baseline metrics and implement the highest-priority workflow change.' },
      { period: 'Days 31–60', action: 'Measure movement, remove implementation friction and iterate the intervention.' },
      { period: 'Days 61–90', action: 'Validate outcome, assess attribution confidence and capture the learning.' }
    ],
    lineage: {
      stages: ['Provider Observation', 'Normalised Data', 'Metric', 'Evidence', 'Finding', 'Diagnosis', 'Opportunity', 'Recommendation', 'Intervention', 'Outcome', 'Attribution', 'Learning']
    }
  };
}
