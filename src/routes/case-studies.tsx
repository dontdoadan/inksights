import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Database, GitPullRequest, ShieldCheck, Workflow } from "lucide-react";
import {
  CtaSection,
  JsonLd,
  PageHero,
  PublicShell,
  SectionHeading,
} from "@/components/public-site";

const CANONICAL_URL = "https://getinksight.co.uk/case-studies";

export const Route = createFileRoute("/case-studies")({
  component: ProofPage,
  head: () => ({
    meta: [
      { title: "INKSIGHT Proof Library | Systems and Demonstrations" },
      {
        name: "description",
        content:
          "Review clearly labelled INKSIGHT demonstrations, working systems, validation standards and future client case-study criteria.",
      },
      { property: "og:title", content: "INKSIGHT Proof Library" },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function ProofPage() {
  return (
    <PublicShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "INKSIGHT proof library",
          url: CANONICAL_URL,
          description: "Transparent demonstrations and system validation for INKSIGHT.",
        }}
      />
      <PageHero
        eyebrow="Proof without fabrication"
        title={<>Demonstrations are labelled. Unknowns stay unknown.</>}
        description={
          <>
            INKSIGHT is early-stage. This library shows working infrastructure, transparent
            methodology and simulated examples until genuine studio outcomes can be published with
            permission.
          </>
        }
      />

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-300/35 bg-amber-300/10 p-5 text-sm leading-relaxed text-amber-100">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <p>
              <strong className="text-amber-200">Current proof status:</strong> no performance
              result on this page is presented as a completed paying-client case study.
              Demonstration numbers illustrate how the reporting system works.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Demonstration case"
            title="Visibility exists, but the booking path is unclear."
            description="A simulated studio profile is used to show the diagnostic output and proposed 72-hour correction without exposing or misrepresenting a real business."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
            <div className="rounded-3xl border border-border bg-ink p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">
                Simulated input
              </p>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li>• Multi-artist UK studio</li>
                <li>• Strong recent portfolio</li>
                <li>• Instagram profile receives traffic</li>
                <li>• Website and enquiry link both available</li>
                <li>• No clear response-time promise</li>
                <li>• Booking instructions split across several highlights</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-mint/35 bg-gradient-to-br from-ink-elev to-ink p-7">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Visibility", "64"],
                  ["Trust", "78"],
                  ["Conversion", "36"],
                  ["Readiness", "85"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-border bg-ink-deep p-4">
                    <div className="font-display text-3xl font-black text-mint">{value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-border bg-ink-deep p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Primary diagnosis
                </p>
                <h2 className="mt-2 font-display text-2xl font-black text-ice">
                  The studio is visible enough to lose enquiries.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Visitors can see credible work but must decide between several unclear routes. The
                  first intervention is conversion clarity, not more content volume.
                </p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  [
                    "Day 1",
                    "Replace vague profile headline and separate client-facing booking action.",
                  ],
                  [
                    "Day 2",
                    "Create one pinned booking explainer and reduce competing profile links.",
                  ],
                  ["Day 3", "Verify mobile journey, enquiry fields and response expectation."],
                ].map(([day, action]) => (
                  <div key={day} className="rounded-xl border border-border bg-ink p-4">
                    <div className="font-bold text-mint">{day}</div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Working system proof"
            title="Infrastructure that can be inspected and validated."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              [
                Database,
                "Server-side lead qualification",
                "Studio answers are scored and stored in Supabase rather than trusted to a browser-only result.",
              ],
              [
                Workflow,
                "Qualified booking routing",
                "Hot and warm leads can request times; lower-readiness leads receive a non-calendar route.",
              ],
              [
                GitPullRequest,
                "Version-controlled changes",
                "Public-site and automation changes are built in GitHub branches, reviewed through pull requests and validated by CI.",
              ],
              [
                ShieldCheck,
                "Approval and dry-run controls",
                "Automation replacements remain gated until credentials, approval and controlled live tests are complete.",
              ],
            ].map(([Icon, title, description]) => {
              const ProofIcon = Icon as typeof Database;
              return (
                <div
                  key={String(title)}
                  className="rounded-2xl border border-border bg-ink-deep p-6"
                >
                  <ProofIcon className="h-7 w-7 text-mint" />
                  <h2 className="mt-5 font-display text-xl font-black text-ice">{String(title)}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {String(description)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Future case-study standard"
            title="What a real client result must include."
            description="A future case study will not be published from one good week or an unattributed screenshot."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              "Client permission and a clear description of the studio context",
              "The starting baseline, including what could not be measured",
              "Exact intervention and implementation period",
              "Relevant external factors such as seasonality, ad spend or staffing changes",
              "Outcome window long enough to avoid claiming short-term noise as a result",
              "Commercial metrics alongside limitations and unsuccessful elements",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-xl border border-border bg-ink p-5 text-sm leading-relaxed text-muted-foreground"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaSection title="Apply as a founding studio and help create the first verified case study." />
    </PublicShell>
  );
}
