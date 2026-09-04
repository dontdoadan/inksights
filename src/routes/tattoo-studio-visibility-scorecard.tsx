import { createFileRoute } from "@tanstack/react-router";
import { Check, Clipboard, RotateCcw, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { JsonLd, PageHero, PublicShell } from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/tattoo-studio-visibility-scorecard";
const STORAGE_KEY = "inksight-visibility-scorecard-v1";

type CheckItem = { id: string; label: string; evidence: string };
type Section = { id: string; title: string; description: string; checks: readonly CheckItem[] };

const sections: readonly Section[] = [
  {
    id: "local-discovery",
    title: "Google and local discovery",
    description: "Can a nearby client reliably find, trust and contact the studio from search?",
    checks: [
      { id: "gbp-complete", label: "The Google Business Profile is complete and accurate.", evidence: "Hours, categories, services, phone, website and appointment links." },
      { id: "gbp-active", label: "The profile is actively maintained.", evidence: "Recent photos, review responses and no unresolved suggested edits." },
      { id: "local-pages", label: "The website clearly communicates location and service area.", evidence: "Address, directions, parking or transport and locally relevant copy." },
    ],
  },
  {
    id: "website",
    title: "Website and indexability",
    description: "Can search engines crawl the correct pages and can visitors understand them quickly?",
    checks: [
      { id: "indexable", label: "Important pages return correctly and use consistent canonical URLs.", evidence: "No dead canonical targets, accidental noindex tags or conflicting hosts." },
      { id: "mobile", label: "The primary mobile experience is fast and usable.", evidence: "Readable text, stable layout, compressed media and obvious actions." },
      { id: "services", label: "The site has distinct pages for the studio's main styles or services.", evidence: "Useful, non-duplicated pages that match how clients search." },
    ],
  },
  {
    id: "trust",
    title: "Portfolio and trust",
    description: "Does the public evidence reduce uncertainty before someone enquires?",
    checks: [
      { id: "portfolio", label: "The portfolio is current, selective and organised.", evidence: "Strong recent work grouped by artist, style or project type." },
      { id: "healed-work", label: "Healed work and realistic outcomes are visible.", evidence: "Not only fresh, highly edited or close-cropped images." },
      { id: "reviews", label: "Reviews are recent and actively managed.", evidence: "A consistent flow of specific reviews and professional responses." },
    ],
  },
  {
    id: "conversion",
    title: "Booking and conversion",
    description: "Can a qualified prospect move from interest to a controlled request without friction?",
    checks: [
      { id: "booking-clear", label: "The booking process is explained before the enquiry form.", evidence: "What to submit, response timing, deposits, consultations and next steps." },
      { id: "intake", label: "The enquiry form captures the information needed to qualify the project.", evidence: "Placement, size, style, budget, references, availability and preferred artist." },
      { id: "cta", label: "Every high-intent page has one clear next action.", evidence: "No competing buttons, broken links or hidden contact details." },
    ],
  },
  {
    id: "retention",
    title: "Retention and reputation systems",
    description: "Does the studio continue the relationship after the appointment?",
    checks: [
      { id: "post-session", label: "Post-session guidance is standardised and easy to revisit.", evidence: "Clear recovery guidance connected to the studio and appointment." },
      { id: "followup", label: "Clients receive a structured follow-up.", evidence: "Healing check, review request, healed-photo request or rebooking prompt." },
      { id: "measurement", label: "The studio measures lead and booking outcomes.", evidence: "Source, response time, conversion, cancellations, deposits and repeat bookings." },
    ],
  },
] as const;

const allChecks = sections.flatMap((section) => section.checks);

export const Route = createFileRoute("/tattoo-studio-visibility-scorecard")({
  component: TattooStudioVisibilityScorecard,
  head: () => ({
    meta: [
      { title: "Free Tattoo Studio Visibility Scorecard | INKSIGHTS" },
      { name: "description", content: "Score a tattoo studio across local search, website indexability, portfolio trust, booking conversion and client retention." },
      { property: "og:title", content: "Free Tattoo Studio Visibility Scorecard" },
      { property: "og:description", content: "A practical 15-point diagnostic for tattoo studio owners." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function scoreLabel(score: number) {
  if (score >= 85) return "Strong foundation";
  if (score >= 65) return "Visible but leaking demand";
  if (score >= 40) return "Material visibility gaps";
  return "High-priority rebuild";
}

function scoreSummary(score: number) {
  if (score >= 85) return "The core system is credible. Focus on measurement, authority and conversion refinement.";
  if (score >= 65) return "Clients can find and assess the studio, but several weak points are likely reducing enquiries or bookings.";
  if (score >= 40) return "The studio has useful assets, but discovery, trust or booking friction is materially limiting performance.";
  return "The current system makes it difficult for search engines and prospective clients to confidently choose the studio.";
}

function TattooStudioVisibilityScorecard() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, boolean>;
      setCompleted(saved);
    } catch {
      setCompleted({});
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const checkedCount = useMemo(() => allChecks.reduce((total, check) => total + (completed[check.id] ? 1 : 0), 0), [completed]);
  const score = Math.round((checkedCount / allChecks.length) * 100);
  const sectionScores = useMemo(() => sections.map((section) => ({
    id: section.id,
    title: section.title,
    score: Math.round((section.checks.filter((check) => completed[check.id]).length / section.checks.length) * 100),
  })), [completed]);
  const weakest = [...sectionScores].sort((a, b) => a.score - b.score)[0];
  const gaps = allChecks.filter((check) => !completed[check.id]).map((check) => check.id);
  const handoff = `/studio-growth-check?source=visibility-scorecard&score=${score}&weakest=${encodeURIComponent(weakest?.id || "unknown")}&gaps=${encodeURIComponent(gaps.join(","))}`;

  function toggle(id: string) {
    setCompleted((current) => ({ ...current, [id]: !current[id] }));
    setCopied(false);
  }

  function reset() {
    setCompleted({});
    setCopied(false);
  }

  async function copyResult() {
    const text = `INKSIGHTS Tattoo Studio Visibility Score: ${score}/100 — ${scoreLabel(score)}. Weakest area: ${weakest?.title || "not assessed"}.`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
  }

  return (
    <PublicShell>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Tattoo Studio Visibility Scorecard",
        url: CANONICAL_URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
      }} />
      <PageHero
        eyebrow="Free studio diagnostic · Progress saves on this device"
        title={<>Tattoo Studio Visibility Scorecard</>}
        description={<>Check the 15 conditions that determine whether a nearby prospect can find the studio, trust the work, understand the booking process and take action. Tick only what is consistently true today.</>}
      />

      <section className="bg-ink">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-start">
          <div className="space-y-7">
            {sections.map((section) => (
              <article key={section.id} className="rounded-2xl border border-border bg-ink-deep p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-black text-ice md:text-3xl">{section.title}</h2>
                    <p className="mt-2 text-muted-foreground">{section.description}</p>
                  </div>
                  <span className="rounded-full bg-mint/10 px-3 py-1 text-xs font-bold text-mint">{sectionScores.find((item) => item.id === section.id)?.score || 0}%</span>
                </div>
                <div className="mt-6 space-y-4">
                  {section.checks.map((check) => {
                    const isChecked = Boolean(completed[check.id]);
                    return (
                      <button
                        key={check.id}
                        type="button"
                        onClick={() => toggle(check.id)}
                        className={`w-full rounded-xl border p-5 text-left transition ${isChecked ? "border-mint bg-mint/10" : "border-border bg-ink hover:border-mint/60"}`}
                        aria-pressed={isChecked}
                      >
                        <span className="flex items-start gap-4">
                          <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${isChecked ? "border-mint bg-mint text-ink-deep" : "border-border text-transparent"}`} aria-hidden="true">
                            <Check className="h-4 w-4" />
                          </span>
                          <span>
                            <span className="block font-semibold text-ice">{check.label}</span>
                            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">Evidence: {check.evidence}</span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-2xl border border-mint/35 bg-ink-deep p-7 shadow-2xl shadow-black/20 lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Current score</p>
            <div className="mt-4 font-display text-7xl font-black text-ice">{score}</div>
            <div className="text-sm font-semibold text-mint">out of 100</div>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-ink"><div className="h-full rounded-full bg-mint transition-all" style={{ width: `${score}%` }} /></div>
            <p className="mt-5 text-xl font-bold text-ice">{scoreLabel(score)}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{scoreSummary(score)}</p>
            <div className="mt-5 rounded-xl border border-border bg-ink p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Weakest area</p>
              <p className="mt-2 font-bold text-ice">{weakest?.title || "Complete the checks"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{weakest?.score || 0}% confirmed</p>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">{checkedCount} of {allChecks.length} conditions confirmed.</p>
            <a href={handoff} className="mt-7 flex w-full justify-center rounded-full bg-mint px-5 py-3.5 text-center font-bold text-ink-deep hover:bg-mint-soft">
              Build my action plan →
            </a>
            <button type="button" onClick={copyResult} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-muted-foreground hover:border-mint hover:text-mint">
              <Clipboard className="h-4 w-4" /> {copied ? "Result copied" : "Copy result"}
            </button>
            <button type="button" onClick={reset} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-muted-foreground hover:text-mint">
              <RotateCcw className="h-4 w-4" /> Reset scorecard
            </button>
            <div className="mt-6 flex gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-mint" />Selections stay in this browser until you reset or clear site data.</div>
          </aside>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="font-display text-4xl font-black text-ice">How to use the result</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              ["Fix technical blockers first", "Broken canonicals, missing indexability and inaccessible pages invalidate later marketing work."],
              ["Then remove booking friction", "Improve the path from portfolio viewing to a qualified, deposit-ready request."],
              ["Then compound trust", "Build reviews, healed-work evidence, follow-up systems and measurable client retention."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-border bg-ink p-6">
                <div className="font-bold text-mint">{title}</div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
