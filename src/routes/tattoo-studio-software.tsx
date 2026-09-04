import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ExternalLink, Workflow } from "lucide-react";
import { CtaSection, JsonLd, PageHero, PublicShell, SectionHeading } from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/tattoo-studio-software";

const platforms = [
  { name: "Tattoo Studio Pro", emphasis: "Tattoo-specific studio administration", strengths: "Client profiles, consent workflows, deposits, point of sale and scheduling.", evaluate: "Confirm current UK payment support, reporting depth, data export and multi-artist controls.", href: "https://tattoostudiopro.com/" },
  { name: "Venue Ink", emphasis: "Tattoo enquiries and booking workflow", strengths: "Request forms, scheduling, deposits and client conversations in one workflow.", evaluate: "Check studio-level permissions, portability and current communication features.", href: "https://venue.ink/" },
  { name: "Fresha", emphasis: "Broader beauty and appointment platform", strengths: "Established booking infrastructure for appointment-led businesses, including tattoo and piercing.", evaluate: "Review marketplace, payment and commercial terms against tattoo-specific alternatives.", href: "https://www.fresha.com/" },
  { name: "Square Appointments", emphasis: "Payments-first operations", strengths: "Scheduling, payments, online booking and team management within the Square ecosystem.", evaluate: "Test whether custom enquiry, reference-image and consent workflows require separate tools.", href: "https://squareup.com/gb/en/appointments" },
  { name: "Setmore", emphasis: "Accessible online scheduling", strengths: "Appointments, reminders and booking links that can be used from studio profiles.", evaluate: "Assess deposits, custom intake, project approval and reporting requirements.", href: "https://www.setmore.com/" },
  { name: "Timely", emphasis: "Multi-service business management", strengths: "Booking and management features for appointment-led businesses, including tattoo studios.", evaluate: "Compare total cost, retail functionality and tattoo-workflow flexibility.", href: "https://www.gettimely.com/" },
  { name: "Linework", emphasis: "Tattoo studio administration", strengths: "Bookings, payments, artist settlement and financial reporting are central to its positioning.", evaluate: "Validate UK availability, integrations, exports and implementation support.", href: "https://linework.com/" },
  { name: "InkDesk", emphasis: "Tattoo booking and client management", strengths: "Scheduling, projects, waivers, messaging and reminders are presented as one platform.", evaluate: "Check current maturity, portability, permissions and multi-location requirements.", href: "https://inkdesk.app/" },
] as const;

const evaluationAreas = [
  ["1. Enquiry and intake", "Can a client submit placement, size, style, budget, reference images and preferred artist without fragmented messages?"],
  ["2. Approval and scheduling", "Can the studio review requests before offering controlled appointment options rather than exposing the entire diary?"],
  ["3. Deposits and no-show protection", "Can deposits be collected, attributed, transferred and reported without manual reconciliation?"],
  ["4. Consent and client records", "Can health questionnaires, policies and signed consent remain linked to the correct client and appointment?"],
  ["5. Communication", "Can confirmations, reminders, preparation, post-session follow-up and review requests be automated with a human escalation path?"],
  ["6. Studio economics", "Can the system report artist revenue, deposits, cancellations, retail, repeat bookings and outstanding balances clearly?"],
] as const;

export const Route = createFileRoute("/tattoo-studio-software")({
  component: TattooStudioSoftwarePage,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Software Comparison 2026 | INKSIGHTS" },
      { name: "description", content: "Compare tattoo studio booking and management software by enquiry, deposits, consent, communication, workflow and reporting." },
      { property: "og:title", content: "Tattoo Studio Software Comparison 2026" },
      { property: "og:description", content: "Compare tattoo studio software by the complete workflow it must support—not feature-count marketing." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function TattooStudioSoftwarePage() {
  return (
    <PublicShell>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Tattoo Studio Software Comparison 2026",
        url: CANONICAL_URL,
        dateModified: "2026-07-26",
        publisher: { "@type": "Organization", name: "INKSIGHTS" },
      }} />
      <PageHero
        eyebrow="Independent workflow guide · Last verified 26 July 2026"
        title={<>Tattoo studio software should fit the way tattoo work is actually sold.</>}
        description={<>The correct platform is not necessarily the one with the longest feature list. It is the one that reliably moves a custom request from enquiry to approval, deposit, consent, appointment, post-session follow-up and repeat booking with the least duplicate administration.</>}
      />

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="rounded-2xl border border-mint/30 bg-mint/5 p-5 text-sm leading-relaxed text-muted-foreground">
            <strong className="text-ice">Methodology:</strong> this guide compares publicly presented workflow positioning. Product functionality, pricing and terms change. Verify current vendor documentation and run a representative workflow test before purchasing.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading eyebrow="Evaluation framework" title="Test the complete workflow, not isolated features." />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {evaluationAreas.map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-border bg-ink p-7">
                <Workflow className="h-6 w-6 text-mint" />
                <h2 className="mt-5 font-display text-xl font-black text-ice">{title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading eyebrow="Platform comparison" title="Where each option currently appears strongest." />
          <div className="mt-10 overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-[1050px] w-full border-collapse text-left">
              <thead className="bg-ink-elev text-sm text-ice">
                <tr><th className="px-5 py-4">Platform</th><th className="px-5 py-4">Primary emphasis</th><th className="px-5 py-4">Publicly presented strengths</th><th className="px-5 py-4">What to verify</th></tr>
              </thead>
              <tbody>
                {platforms.map((platform) => (
                  <tr key={platform.name} className="border-t border-border/60 align-top">
                    <td className="px-5 py-5"><a href={platform.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bold text-mint hover:text-mint-soft">{platform.name}<ExternalLink className="h-3.5 w-3.5" /></a></td>
                    <td className="px-5 py-5 text-ice">{platform.emphasis}</td>
                    <td className="px-5 py-5 leading-relaxed text-muted-foreground">{platform.strengths}</td>
                    <td className="px-5 py-5 leading-relaxed text-muted-foreground">{platform.evaluate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2 md:py-28">
          <Choice title="Choose a tattoo-specific platform when…" items={[
            "Custom requests require approval before scheduling.",
            "Reference images, placement and project notes are central to the sale.",
            "Consent, deposits and multi-session projects must stay linked.",
            "Artists and studio management need different permissions and reporting.",
          ]} />
          <Choice title="Choose a broader platform when…" items={[
            "The studio already uses its payment and accounting ecosystem.",
            "Appointment types are standardised and need little pre-approval.",
            "Retail, staff management or multi-service operations outweigh tattoo-specific intake.",
            "Missing workflow can be added without creating duplicate administration.",
          ]} />
        </div>
      </section>

      <CtaSection
        eyebrow="Before migration"
        title="Map the current workflow before moving client data."
        description="The Studio Growth Check identifies whether software is the current constraint. A larger workflow audit can then map enquiry, deposit, booking, consent, reminder and follow-up requirements."
      />
    </PublicShell>
  );
}

function Choice({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-border bg-ink p-8">
      <h2 className="font-display text-3xl font-black text-ice">{title}</h2>
      <ul className="mt-6 space-y-4 text-muted-foreground">
        {items.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint" />{item}</li>)}
      </ul>
    </div>
  );
}
