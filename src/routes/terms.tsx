import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

const CANONICAL_URL = "https://getinksight.co.uk/terms";
const POLICY_VERSION = "2026-07-28";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Website and Service Terms | INKSIGHT" },
      { name: "description", content: "Terms for using the INKSIGHT website, tools, educational content and scoped tattoo studio services." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal and service terms"
      title="Website and Service Terms"
      description={`Policy version ${POLICY_VERSION}. These terms govern public website use. A paid engagement will also have an offer-specific scope, price, delivery terms and cancellation conditions.`}
    >
      <h2>About the website</h2>
      <p>INKSIGHT provides information, interactive tools and services intended primarily for UK tattoo studios, with a separate client-education resource section. Website access does not create a consultancy or service contract.</p>

      <h2>Educational content</h2>
      <p>Articles, calculators, scorecards and interactive tools are general educational resources. They simplify complex and variable subjects and should not be treated as a guaranteed quote, medical diagnosis, legal opinion, financial advice or replacement for a qualified professional.</p>
      <p>Tattoo aftercare content must be read alongside the specific instructions from the artist who performed the procedure. Medical warning signs require appropriate healthcare assessment.</p>

      <h2>Estimates and projections</h2>
      <p>Any calculator, model, score or projected commercial effect is an illustration based on the information entered and the assumptions shown. Actual prices, rankings, enquiries, bookings, cancellations, retention and revenue can differ materially.</p>

      <h2>How a paid engagement begins</h2>
      <p>A paid engagement begins only when INKSIGHT and the client agree the offer, scope, price, access, dependencies and delivery conditions. Where the public offer page and an agreed written scope differ, the later agreed written scope governs.</p>
      <p>Clients must provide accurate information, lawful access and timely approvals. Delays, withheld access, changed requirements or incomplete information may pause delivery, change delivery dates or require a revised scope and price.</p>

      <h2>Current fixed-price and subscription terms</h2>
      <p><strong>INKSIGHT 72-Hour Studio Visibility Fix:</strong> £249 one-off, paid before work begins. The three-working-day delivery period begins only after payment, complete intake, required access and a named approver are in place.</p>
      <p><strong>Tattoo Studio Visibility Watch:</strong> £99 per month, billed monthly in advance until cancelled. Cancellation must be completed before the next renewal to avoid the next charge. Service continues until the end of the paid billing period.</p>
      <p><strong>INKSIGHT Founding Studio Pilot:</strong> application-only. The standard minimum package is £1,500 installation plus £750 per month for a minimum three-month management term, totalling £3,750. The signed service order governs scope, access, delivery, early termination and any remaining commitment.</p>
      <p>The Tattoo Studio Revenue Audit and Booking &amp; Retention Engine are scoped services. Their price and payment schedule are confirmed in writing after diagnosis; no public fixed price applies unless a later written offer states otherwise.</p>

      <h2>Performance-linked pricing</h2>
      <p>INKSIGHT may offer an optional performance-linked fee only as part of a signed written scope. It is not a standalone public checkout product and there is no default public performance-fee percentage.</p>
      <p>The underlying commercial model is: number of clients × average transaction value × purchase frequency. A performance fee may be calculated only from verified incremental revenue or agreed contribution that meets the written attribution rules.</p>
      <p>Before any performance-linked invoice can be raised, the written scope must define the baseline period, measurement window, fee percentage, eligible revenue or contribution, direct-cost treatment, exclusions, evidence sources, and adjustments for material changes such as pricing, capacity, staffing, advertising, seasonality or opening hours.</p>
      <p>The client must be given the calculation and supporting evidence for review. Sample data, projections, unattributed revenue and changes outside the agreed scope are not billable uplift.</p>

      <h2>Cancellation and refunds</h2>
      <p>Where INKSIGHT cannot accept or commence a fixed-scope engagement, payment should be returned. Once client-specific work has begun, any refund is limited to undelivered work unless the written scope states otherwise or a legal right applies.</p>
      <p>For monthly subscriptions, no partial-period refund is promised except where a legal right applies or INKSIGHT agrees otherwise in writing. For minimum-term implementation or management packages, the signed service order governs early termination, completed work and any remaining commitment.</p>
      <p>Nothing in these terms limits a right that cannot lawfully be excluded.</p>

      <h2>Prices, tax and invoices</h2>
      <p>Public prices are stated in pounds sterling. The live checkout, invoice or written proposal will show the applicable tax treatment. Do not assume that a displayed price is VAT-inclusive or VAT-exclusive unless that is stated on the relevant transaction document.</p>
      <p>A public price does not guarantee availability, qualification or acceptance of a project.</p>

      <h2>No guaranteed commercial outcome</h2>
      <p>INKSIGHT does not guarantee search rankings, platform visibility, enquiry volume, bookings, retention, revenue or a specific return on investment. Results depend on market conditions, studio reputation, offer quality, implementation, access, timing, platform changes and other factors outside INKSIGHT&apos;s control.</p>

      <h2>Third-party services</h2>
      <p>The website may discuss or link to software, platforms and external guidance. Product features, pricing and availability can change. Verify current vendor documentation before purchasing or migrating. INKSIGHT is not responsible for third-party outages, policy changes or external content.</p>

      <h2>Communications and automation</h2>
      <p>Clients remain responsible for approving their booking, cancellation, consent, privacy and marketing policies. INKSIGHT does not replace professional legal advice and will not intentionally send unapproved marketing communications. Automated systems must retain an appropriate human exception and escalation route.</p>

      <h2>Acceptable use</h2>
      <p>Do not attempt to disrupt the website, bypass security controls, submit unlawful or misleading information, scrape personal data, impersonate another studio or use the tools to harm another person or business.</p>

      <h2>Intellectual property</h2>
      <p>Unless stated otherwise, INKSIGHT owns the website design, copy, tools, assessment logic, original graphics and service materials. You may link to public pages and share normal excerpts with attribution. You may not reproduce substantial parts, resell tools or remove branding without permission.</p>

      <h2>Liability</h2>
      <p>Nothing in these terms excludes liability that cannot lawfully be excluded. Subject to that, INKSIGHT is not responsible for indirect or consequential loss arising solely from reliance on free website content, estimates or third-party information. Paid-service liability may also be addressed in the agreed service order.</p>

      <h2>Changes and availability</h2>
      <p>Pages, tools, offers and prices may be updated, withdrawn or replaced. INKSIGHT may suspend access for maintenance, security or legal reasons. Material commercial changes receive a new policy version and should be reflected in the relevant checkout, proposal or service order.</p>

      <h2>Governing law</h2>
      <p>These website terms are governed by the laws of England and Wales, subject to any mandatory consumer or local rights that apply.</p>

      <h2>Contact</h2>
      <p>Questions can be sent to <a href="mailto:contact@getinksight.co.uk">contact@getinksight.co.uk</a>.</p>
    </LegalPage>
  );
}
