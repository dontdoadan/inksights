import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Eye, ShieldCheck, Workflow } from "lucide-react";
import {
  CtaSection,
  JsonLd,
  PageHero,
  PublicShell,
  SectionHeading,
} from "@/components/public-site";

const CANONICAL_URL = "https://getinksight.co.uk/about";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About INKSIGHT | Built Inside the Tattoo Industry" },
      {
        name: "description",
        content:
          "Why INKSIGHT is building practical visibility, booking, retention and revenue systems specifically for tattoo studios.",
      },
      { property: "og:title", content: "About INKSIGHT" },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const principles = [
  {
    icon: Eye,
    title: "Show evidence, not theatre",
    description:
      "Demonstrations are labelled as demonstrations. Unknown values stay unknown. Client outcomes are not invented to make an early-stage business appear larger.",
  },
  {
    icon: Workflow,
    title: "Fix the workflow before adding software",
    description:
      "A new platform cannot repair unclear ownership, weak policies or an undefined booking journey. Map the process first, then select the tool.",
  },
  {
    icon: ShieldCheck,
    title: "Automate with boundaries",
    description:
      "Automations require consent, human escalation, dry-run validation and a way to stop. High-risk or unusual situations should not be hidden inside a workflow.",
  },
  {
    icon: CheckCircle2,
    title: "Use the smallest useful offer",
    description:
      "A studio with one visibility problem should not be sold a large ongoing engagement. Scope should expand only when evidence and capacity justify it.",
  },
] as const;

function AboutPage() {
  return (
    <PublicShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About INKSIGHT",
          url: CANONICAL_URL,
          mainEntity: {
            "@type": "Organization",
            name: "INKSIGHT",
            foundingLocation: { "@type": "Country", name: "United Kingdom" },
            description:
              "Growth systems for UK tattoo studios, built from direct tattoo-industry experience.",
          },
        }}
      />
      <PageHero
        eyebrow="Built inside tattooing"
        title={<>A tattoo studio is not a generic appointment business.</>}
        description={
          <>
            INKSIGHT exists because custom tattoo work has a distinct commercial journey: portfolios
            create trust, enquiries require qualification, deposits protect project time, sleeves
            span months, healing affects outcomes and the relationship continues after the session.
          </>
        }
      />

      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1fr_1fr] lg:items-center md:py-28">
          <div>
            <SectionHeading
              eyebrow="Founder context"
              title="Direct operating experience, not niche selection."
              description="INKSIGHT was started by a working black-and-grey realism tattoo artist. The business is being built around problems observed from inside tattooing rather than by selecting tattoo studios from a marketing niche list."
            />
            <div className="mt-7 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                That experience does not automatically make every INKSIGHT recommendation correct.
                It does make the starting assumptions more relevant: custom projects are qualified
                before booking, artists have different styles and availability, and client trust is
                built through healed work and communication—not only lead volume.
              </p>
              <p>
                The operating goal is to combine that industry context with measurable systems,
                transparent limitations and evidence as real studio implementations accumulate.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-mint/35 bg-gradient-to-br from-ink-elev to-ink p-8 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">
              What INKSIGHT is building
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <li className="rounded-xl border border-border bg-ink-deep p-4">
                <strong className="text-ice">Visibility intelligence:</strong> identify where
                studios disappear or lose trust before the enquiry.
              </li>
              <li className="rounded-xl border border-border bg-ink-deep p-4">
                <strong className="text-ice">Booking control:</strong> qualify projects, protect
                appointments and preserve human exceptions.
              </li>
              <li className="rounded-xl border border-border bg-ink-deep p-4">
                <strong className="text-ice">Retention systems:</strong> connect aftercare, healed
                work, reviews, rebooking and client return.
              </li>
              <li className="rounded-xl border border-border bg-ink-deep p-4">
                <strong className="text-ice">Owner control:</strong> make work, approvals, metrics
                and integration health visible.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Operating principles"
            title="How early trust should be earned."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <div
                  key={principle.title}
                  className="rounded-2xl border border-border bg-ink-deep p-7"
                >
                  <Icon className="h-7 w-7 text-mint" />
                  <h2 className="mt-5 font-display text-2xl font-black text-ice">
                    {principle.title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20 text-center md:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Current stage</p>
          <h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-6xl">
            Founding systems, controlled pilots and transparent proof.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            INKSIGHT is early-stage. The public proof library therefore shows methodology, working
            infrastructure and clearly labelled demonstrations until genuine client outcomes can be
            documented with permission.
          </p>
          <a
            href="/case-studies"
            className="mt-8 inline-flex rounded-full border border-mint px-6 py-3 font-bold text-mint hover:bg-mint/10"
          >
            Review the proof library
          </a>
        </div>
      </section>
      <CtaSection />
    </PublicShell>
  );
}
