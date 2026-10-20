export type GrowthLever = "clients" | "transaction_value" | "purchase_frequency";

export type PublicOffer = {
  slug: string;
  name: string;
  eyebrow: string;
  price: string;
  structuredPrice?: string;
  billing: string;
  commercialStatus: string;
  policyVersion: string;
  stripePriceId?: string;
  stripeMode?: "payment" | "subscription";
  checkoutUrl?: string;
  growthLevers: GrowthLever[];
  performancePricing: string;
  summary: string;
  problem: string;
  timeframe: string;
  idealFor: string[];
  deliverables: string[];
  requirements: string[];
  exclusions: string[];
  process: Array<{ title: string; description: string }>;
  faqs: Array<[string, string]>;
};

export const OFFER_POLICY_VERSION = "2026-07-28";

export const growthLeverLabels: Record<GrowthLever, string> = {
  clients: "Number of clients",
  transaction_value: "Average transaction value",
  purchase_frequency: "Purchase frequency",
};

export const publicOffers: PublicOffer[] = [
  {
    slug: "primary-constraint-programme",
    name: "Primary Constraint Programme",
    eyebrow: "Implementation after diagnosis",
    price: "Separately scoped proposal",
    billing: "Written scope and payment terms agreed before work begins",
    commercialStatus: "Enquire after an evidenced priority is established",
    policyVersion: OFFER_POLICY_VERSION,
    growthLevers: ["clients", "transaction_value", "purchase_frequency"],
    performancePricing: "Any performance-linked terms require a separately agreed baseline, attribution and verified contribution.",
    summary: "Turn one evidenced studio priority into a practical change. Agree what will be done, who will own it and how the outcome will be reviewed before implementation starts.",
    problem: "The studio knows what needs attention but needs help turning the findings into a change it can operate and measure.",
    timeframe: "Confirmed in the written proposal after diagnosis, access and delivery responsibilities are agreed.",
    idealFor: ["Established UK tattoo studios with one evidenced priority", "Owners able to approve changes and provide the required information", "Teams ready to own the improved process and review what happens"],
    deliverables: ["A written proposal for one primary commercial constraint", "Agreed implementation work and responsibilities", "A starting baseline and measurement plan where evidence permits", "An outcome review within the agreed engagement scope"],
    requirements: ["An evidenced priority, normally established through diagnosis", "An approved scope and payment terms", "Required access, studio information and timely approvals", "A named owner for the changed process"],
    exclusions: ["Implementation included automatically in the £395 audit", "Unlimited work or unspecified software costs", "Guaranteed rankings, bookings, revenue or return on investment", "Automatic enrolment in ongoing monitoring"],
    process: [
      { title: "Agree the priority", description: "Use the diagnosis to choose the problem worth addressing first." },
      { title: "Scope the work", description: "Agree the intervention, responsibilities, price, dependencies and measures in writing." },
      { title: "Implement and check", description: "Apply the agreed change and verify that the studio can use the improved process." },
      { title: "Review the outcome", description: "Compare what happened with the starting position. Record limitations before deciding whether to stop, refine or monitor." },
    ],
    faqs: [
      ["How much does it cost?", "The price follows the evidenced problem and agreed scope. There is no universal programme price. A written proposal sets the work and payment terms before you commit."],
      ["Do I need the £395 audit first?", "The programme requires a justified priority and enough evidence to scope it. The Studio Intelligence Audit is the normal starting point; discuss fit if you already have a reliable diagnosis."],
      ["Is this the Founding Studio Pilot?", "The programme describes the implementation stage. The Founding Studio Pilot is a separately published, application-only package with its own scope and commitment. It is not an automatic upgrade or a price for every programme."],
      ["What happens after implementation?", "Review the measured outcome and any remaining uncertainty. Ongoing INKSIGHTS Watch is considered only where repeated monitoring would inform useful decisions; its scope and terms are agreed separately."],
    ],
  },
  {
    slug: "studio-intelligence-audit",
    name: "INKSIGHTS Studio Intelligence Audit",
    eyebrow: "Founding validation price · paid diagnosis",
    price: "£395 one-off",
    structuredPrice: "395",
    billing: "One-time payment before the audit begins",
    commercialStatus: "Active public offer",
    policyVersion: OFFER_POLICY_VERSION,
    stripePriceId: "price_1UG09NCX6YhLOssgi93xsGnH",
    stripeMode: "payment",
    checkoutUrl: "https://buy.stripe.com/aFadR85i3bOieZndHt93y00",
    growthLevers: ["clients", "transaction_value", "purchase_frequency"],
    performancePricing: "Fixed one-time audit fee; no performance percentage applies.",
    summary:
      "A structured tattoo studio business audit for established UK studios, combining search visibility, competitor and customer-journey analysis with prioritised recommendations and a 90-day action plan.",
    problem:
      "The studio has demand, activity or revenue but cannot reliably identify which commercial constraint should be fixed first.",
    timeframe: "Onboarding begins after payment; the findings timetable is confirmed once the required studio information is complete.",
    idealFor: [
      "Established UK tattoo studios with three or more artists",
      "Owners who want a commercial baseline before spending more on marketing or software",
      "Studios with several possible growth constraints and no reliable priority",
      "Decision-makers able to provide current website, booking and operating information",
    ],
    deliverables: [
      "Market and search-visibility analysis",
      "Competitor and positioning analysis",
      "Website and customer-journey analysis",
      "Top three commercial opportunities",
      "Prioritised recommendations",
      "90-day action plan",
      "45–60 minute findings session",
      "Baseline for one measurable intervention",
    ],
    requirements: [
      "Payment in full before the audit begins",
      "Accurate studio and decision-maker details",
      "Current website, booking and public-profile links",
      "Representative operating information required for the agreed analysis",
    ],
    exclusions: [
      "Accountancy, tax, legal or regulated financial advice",
      "Guaranteed rankings, enquiries, bookings or revenue",
      "Implementation work not explicitly included in the audit scope",
      "Paid advertising spend",
    ],
    process: [
      { title: "Purchase and intake", description: "Confirm the studio, decision-maker, data available and the questions the audit must answer." },
      { title: "Observe and diagnose", description: "Review visibility, competitors, website, customer journey and commercial evidence without replacing unknowns with assumptions." },
      { title: "Prioritise", description: "Identify the three highest-value opportunities and order recommendations by dependency, effort and commercial usefulness." },
      { title: "Findings and 90-day plan", description: "Present the evidence, recommendations and a practical 90-day action plan with one measurable starting intervention." },
    ],
    faqs: [
      ["What does a tattoo studio business audit cover?", "The Studio Intelligence Audit reviews the studio's public visibility, competitors, website and booking journey, then connects those observations to the commercial constraints affecting enquiries, capacity, retention and revenue. The output is prioritised rather than a generic marketing checklist."],
      ["How is this different from the free Growth Check?", "The free Studio Growth Check is a first-pass estimate based on your answers. The £395 Studio Intelligence Audit is the paid diagnostic that replaces broad assumptions with a structured review of the studio and its commercial journey."],
      ["Is implementation included?", "No. Implementation is scoped separately only when the audit identifies a justified intervention."],
      ["How do I pay?", "The £395 one-off audit payment is handled by Stripe. Review the scope and terms before continuing to checkout."],
      ["What happens after payment?", "INKSIGHTS follows up with the information request needed to begin. The findings timetable is confirmed once the required studio information is complete."],
    ],
  },
  {
    slug: "72-hour-visibility-fix",
    name: "INKSIGHTS 72-Hour Studio Visibility Fix",
    eyebrow: "Founding studio offer",
    price: "£249 one-off",
    structuredPrice: "249",
    billing: "Paid in full before work begins",
    commercialStatus: "Enquire to confirm scope and arrange payment",
    policyVersion: OFFER_POLICY_VERSION,
    growthLevers: ["clients"],
    performancePricing: "Not performance-fee based; this is a fixed-scope intervention.",
    summary:
      "A tightly scoped visibility and conversion correction for UK tattoo studios that already produce strong work but present it through a weak public booking path.",
    problem:
      "Potential clients reach the studio profile or website but cannot quickly understand the work, trust the studio or identify the correct booking action.",
    timeframe: "Three working days after payment, complete intake and the required access are received.",
    idealFor: [
      "Independent and multi-artist UK tattoo studios",
      "Studios with credible work but inconsistent enquiries",
      "Owners able to approve copy, profile and booking-flow changes quickly",
      "Founding participants willing to provide honest implementation feedback",
    ],
    deliverables: [
      "Profile headline, bio and booking call-to-action review",
      "Pinned-post and first-impression assessment",
      "Website or booking-link friction review",
      "Priority Google Business Profile and local visibility checks",
      "Exact copy corrections and recommended public changes",
      "Three-working-day implementation checklist and follow-up review",
    ],
    requirements: [
      "Payment in full before delivery begins",
      "Acceptance of the INKSIGHTS Terms of Service at checkout",
      "Current website, profile and booking links",
      "Permission to recommend or apply the agreed public changes",
      "A named decision-maker and accurate studio information",
    ],
    exclusions: [
      "Ongoing social media management",
      "Guaranteed rankings, enquiries, bookings or revenue",
      "Full website redevelopment",
      "Paid advertising spend or campaign management",
      "Complex CRM or booking-system migration",
    ],
    process: [
      { title: "Day 1 — Diagnose", description: "Review the public profile, website, booking route, local search presentation and first-impression proof." },
      { title: "Day 2 — Correct", description: "Produce exact copy, CTA, pinned-content and visibility corrections within the agreed scope." },
      { title: "Day 3 — Implement and verify", description: "Apply or hand over approved corrections, verify the route and identify the next measurable constraint." },
    ],
    faqs: [
      ["When does the three-day period begin?", "Only after payment, complete intake, required access and a named approver are in place."],
      ["How do I book this service?", "Enquire first so we can confirm fit, scope, access and payment arrangements. Work starts after the required information, payment and approvals are in place."],
      ["Does £249 include ad spend?", "No. The offer fixes the public conversion foundation before paid traffic is considered."],
      ["What happens afterwards?", "The studio receives a follow-up review and a recommendation to stop, maintain, or consider a larger system only where the evidence supports it."],
    ],
  },
  {
    slug: "visibility-watch",
    name: "Tattoo Studio Visibility Watch",
    eyebrow: "Monitoring and early warning",
    price: "£99/month",
    structuredPrice: "99",
    billing: "Billed monthly in advance until cancelled",
    commercialStatus: "Enquire to confirm scope and arrange payment",
    policyVersion: OFFER_POLICY_VERSION,
    growthLevers: ["clients"],
    performancePricing: "Fixed monthly subscription; no performance percentage applies.",
    summary:
      "Keep track of agreed changes in local search, public profiles and reputation after a visibility baseline is established. Receive prioritised actions when something needs attention; correction work is governed by the agreed scope.",
    problem:
      "Visibility problems are often noticed only after enquiries fall, a listing changes, a competitor overtakes the studio or a public detail becomes inaccurate.",
    timeframe: "Recurring monthly monitoring after the baseline and account details are confirmed.",
    idealFor: [
      "Studios dependent on local Google and Maps discovery",
      "Owners who do not have time to repeatedly check public profiles",
      "Multi-location studios needing consistent monitoring",
      "Studios already implementing a clear visibility baseline",
    ],
    deliverables: [
      "Search and public-profile health monitoring",
      "Google Business Profile issue checks where data and access permit",
      "Review, reputation and public-detail change alerts",
      "Competitor visibility observations",
      "Prioritised actions rather than raw alerts",
      "Periodic visibility summary",
    ],
    requirements: [
      "A verified studio identity and location",
      "Current public profile URLs",
      "A named recipient and escalation route",
      "Accurate billing and contact details",
    ],
    exclusions: [
      "Automatic acceptance of Google-suggested edits",
      "Unapproved public changes",
      "Guaranteed local rankings, enquiries or revenue",
      "Review manipulation or fabricated reviews",
    ],
    process: [
      { title: "Baseline", description: "Record the studio's current public profiles, local visibility and known risks." },
      { title: "Monitor", description: "Check agreed signals and compare meaningful changes against the baseline." },
      { title: "Escalate", description: "Send a prioritised correction with evidence when a relevant threshold is crossed." },
    ],
    faqs: [
      ["Does this include the 72-Hour Visibility Fix?", "No. Visibility Watch is the separately published £99/month monitoring service. The £249 visibility fix is a one-off engagement; neither automatically enrols you in the other."],
      ["Is this rank tracking only?", "No. It combines available search signals with public-profile, reputation and conversion checks."],
      ["Will every fluctuation create an alert?", "No. The goal is to escalate changes that affect action, trust or booking potential."],
      ["How does cancellation work?", "Cancel before the next renewal to avoid the next charge. Service continues until the end of the paid billing period."],
    ],
  },
  {
    slug: "revenue-audit",
    name: "Tattoo Studio Revenue Audit",
    eyebrow: "Commercial diagnosis",
    price: "Scoped quote after the Growth Check",
    billing: "Written scope and payment schedule before work begins",
    commercialStatus: "Active sales-assisted service",
    policyVersion: OFFER_POLICY_VERSION,
    growthLevers: ["clients", "transaction_value", "purchase_frequency"],
    performancePricing: "May define a later performance-linked arrangement, but the audit itself is quoted in writing.",
    summary:
      "A separately scoped review for revenue questions that extend beyond the published £395 Studio Intelligence Audit. Start with that defined audit scope and enquire if your studio needs a wider investigation.",
    problem:
      "A studio may know revenue is inconsistent without knowing whether the main leak is client volume, transaction value, purchase frequency, cancellations, pricing, retention or owner workload.",
    timeframe: "Scope and turnaround are confirmed after the free Studio Growth Check.",
    idealFor: [
      "Studios with several possible problems and no reliable priority",
      "Owners considering software, advertising or operational changes",
      "Studios able to provide accurate process and performance information",
      "Teams needing a shared commercial baseline",
    ],
    deliverables: [
      "Commercial workflow and revenue-lever map",
      "Client acquisition and enquiry diagnosis",
      "Average transaction value and offer review",
      "Booking, cancellation, retention and purchase-frequency review",
      "Baseline, measurement and attribution assessment",
      "Prioritised action plan with dependencies",
    ],
    requirements: [
      "Honest current-state information",
      "Representative booking and enquiry examples",
      "Available performance and transaction data",
      "A decision-maker for the findings review",
    ],
    exclusions: [
      "A financial audit or accountancy service",
      "Tax, legal or regulated financial advice",
      "Guaranteed financial projections",
      "Implementation not explicitly included in the written scope",
    ],
    process: [
      { title: "Map", description: "Document the current path from discovery to repeat purchase." },
      { title: "Measure", description: "Establish clients, average transaction value, frequency and material operating conditions." },
      { title: "Prioritise", description: "Rank corrections by dependency, effort, risk and likely commercial usefulness." },
    ],
    faqs: [
      ["Is this accountancy advice?", "No. It is an operational and commercial systems diagnosis."],
      ["Do we need perfect data?", "No, but missing information is marked as unknown rather than replaced with invented assumptions."],
      ["Can it lead to performance pricing?", "Yes, only where a later written scope defines the baseline, fee percentage, attribution rules, adjustments, evidence and approval process."],
      ["How does this relate to the £395 audit?", "The Studio Intelligence Audit is the defined £395 starting diagnosis. This wider service is only quoted where the locations, data or questions require a separate written scope; it is not another name for the free Growth Check."],
    ],
  },
  {
    slug: "booking-retention-engine",
    name: "Booking & Retention Engine",
    eyebrow: "System implementation",
    price: "Scoped quote after diagnosis",
    billing: "Written scope, dependencies and payment schedule before work begins",
    commercialStatus: "Active sales-assisted implementation capability",
    policyVersion: OFFER_POLICY_VERSION,
    growthLevers: ["clients", "transaction_value", "purchase_frequency"],
    performancePricing: "Optional verified-uplift terms may be included in the written scope where attribution is defensible.",
    summary:
      "An implementation option within a Primary Constraint Programme when the evidence points to enquiry handling, booking control or client return. The agreed scope uses tools the studio can realistically maintain.",
    problem:
      "Enquiries are fragmented, responses are inconsistent, booking protection is manual and clients leave without a structured return path.",
    timeframe: "Phased implementation after workflow mapping, scope approval and access confirmation.",
    idealFor: [
      "Studios handling meaningful enquiry volume manually",
      "Teams losing time to repetitive booking administration",
      "Studios with cancellation, no-show or follow-up problems",
      "Owners willing to standardise the client journey",
    ],
    deliverables: [
      "Qualified enquiry form and routing",
      "Controlled consultation or booking process",
      "Deposit and cancellation workflow design",
      "Confirmation and reminder sequences",
      "Aftercare, review and healed-photo follow-up",
      "Rebooking, referral or client-reactivation workflow",
      "Performance and exception tracking",
    ],
    requirements: [
      "A mapped current process",
      "Approved booking and cancellation policies",
      "Access to the selected tools",
      "Named owners for exceptions and escalation",
    ],
    exclusions: [
      "Replacing professional legal advice",
      "Sending unapproved marketing communications",
      "Automation without human exception handling",
      "Guaranteed booking, retention or revenue results",
    ],
    process: [
      { title: "Design", description: "Agree the controlled client journey, ownership, measures and exception paths." },
      { title: "Build", description: "Configure forms, records, routing, reminders and follow-up in the approved stack." },
      { title: "Validate", description: "Run labelled sample records and dry-run scenarios before a controlled live launch." },
      { title: "Measure", description: "Track clients, transaction value, frequency, response time, cancellations and return activity." },
    ],
    faqs: [
      ["Does INKSIGHTS replace the studio's booking platform?", "Not automatically. The first preference is to improve the existing stack where it can support the required workflow."],
      ["Can every message be automated?", "No. High-risk, emotional, unusual or clinically relevant situations need human escalation."],
      ["What will it cost?", "The price is quoted after diagnosis confirms locations, workflows, integrations, users and exception routes. Where appropriate, the Founding Studio Pilot package is used."],
    ],
  },
  {
    slug: "founding-studio-pilot",
    name: "INKSIGHTS Founding Studio Pilot",
    eyebrow: "Application-only implementation package",
    price: "£1,500 setup + £750/month for 3 months",
    billing: "£1,500 before implementation; £750 monthly in advance; minimum three-month management term",
    commercialStatus: "Active application-only package",
    policyVersion: OFFER_POLICY_VERSION,
    growthLevers: ["clients", "transaction_value", "purchase_frequency"],
    performancePricing: "An optional agreed percentage of verified uplift may be added only through the signed service order.",
    summary:
      "A controlled implementation and management engagement for one UK tattoo studio location, focused on one primary commercial constraint and up to two workflows.",
    problem:
      "The studio has a clear commercial constraint but needs diagnosis, implementation, monitoring and exception handling rather than another disconnected tactic.",
    timeframe: "The implementation schedule is confirmed after qualification, payment, intake and access approval.",
    idealFor: [
      "One-location UK tattoo studios with a named decision-maker",
      "Studios able to provide the data and account access required",
      "Owners prepared to standardise one primary workflow before expanding",
      "Founding studios willing to participate in controlled validation and honest feedback",
    ],
    deliverables: [
      "Baseline and primary-constraint diagnosis",
      "Configuration and controlled launch for one location",
      "Up to two agreed workflows",
      "Workflow monitoring and exception review",
      "Operational and commercial reporting",
      "One monthly performance review",
      "Implementation and handover documentation",
    ],
    requirements: [
      "Approved written scope and service order",
      "£1,500 installation payment before client-specific work begins",
      "A three-month management commitment at £750 per month",
      "A named decision-maker",
      "Required lawful access, data and timely approvals",
    ],
    exclusions: [
      "Multiple locations unless separately scoped",
      "More than one primary constraint or two workflows unless separately scoped",
      "Unlimited revisions or open-ended support",
      "Guaranteed rankings, enquiries, bookings, revenue or return on investment",
      "Professional legal, tax, accountancy or regulated financial advice",
    ],
    process: [
      { title: "Qualify and scope", description: "Confirm fit, one primary constraint, up to two workflows, dependencies, access and success measures." },
      { title: "Baseline and design", description: "Document the current three-lever position, risks, data quality and implementation plan." },
      { title: "Build and validate", description: "Configure the agreed system, run labelled sample records and complete acceptance checks before live use." },
      { title: "Manage and improve", description: "Monitor exceptions, report performance and review the next constraint during the management term." },
    ],
    faqs: [
      ["What is the minimum commitment?", "£1,500 installation plus £750 per month for three months, totalling £3,750."],
      ["Can it be purchased through open checkout?", "No. It is application-only and requires qualification, an approved scope and a quote or invoice."],
      ["Is a performance fee included automatically?", "No. A percentage of verified uplift applies only where the signed service order states the percentage, baseline, measurement window, attribution rules and approval process."],
      ["What happens if scope changes?", "New locations, workflows, integrations or requirements may require a revised scope, schedule and price."],
    ],
  },
];

export function getPublicOffer(slug: string) {
  return publicOffers.find((offer) => offer.slug === slug);
}
