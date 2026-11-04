import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, CalendarDays, ShieldCheck, Target } from "lucide-react";
import { PublicShell } from "@/components/public-site";
import { trackWebsiteEvent } from "@/lib/website-events";

const campaign = "empty-chair-faceless-pilot-2026-10";

export const Route = createFileRoute("/empty-chair")({
  component: EmptyChairCampaign,
  head: () => ({
    meta: [
      { title: "The Cost of an Empty Tattoo Chair | INKSIGHTS" },
      { name: "description", content: "Find out whether unused capacity, enquiries or rebooking are holding your UK tattoo studio back. Start with a free Studio Growth Check." },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "https://getinksights.co.uk/studio-growth-check" }],
  }),
});

function GrowthCheckLink({ secondary = false }: { secondary?: boolean }) {
  return <Link
    to="/studio-growth-check"
    search={{ source: "empty-chair-faceless-pilot" }}
    onClick={() => trackWebsiteEvent("cta_clicked", { cta: secondary ? "empty_chair_bottom" : "empty_chair_hero", campaign })}
    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-mint px-7 py-3.5 text-sm font-bold text-ink-deep transition hover:bg-mint-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint"
  >
    Start My Free Growth Check <ArrowRight className="h-4 w-4" aria-hidden="true" />
  </Link>;
}

function EmptyChairCampaign() {
  return (
    <PublicShell>
      <section className="brand-dark relative overflow-hidden border-b border-border bg-ink-deep">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, #00E5D125, transparent 36%), linear-gradient(#34495722 1px, transparent 1px), linear-gradient(90deg, #34495722 1px, transparent 1px)", backgroundSize: "auto, 44px 44px, 44px 44px" }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:py-24 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/5 px-4 py-2 text-xs font-bold uppercase tracking-[.15em] text-mint"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> For UK tattoo studio owners</p>
            <h1 className="mt-7 max-w-3xl font-display text-4xl font-black leading-tight tracking-tight text-ice sm:text-5xl md:text-6xl">Every empty chair has a cost. <span className="text-mint">Do you know the cause?</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">An unbooked hour is not automatically lost revenue. But it may signal a problem with enquiries, booking conversion, pricing or demand. Identify the bottleneck before spending more to attract customers.</p>
            <div className="mt-8"><GrowthCheckLink /></div>
            <p className="mt-4 text-sm text-muted-foreground">Free first-pass diagnostic · Studios with 3+ artists · No payment required</p>
          </div>
          <div className="rounded-3xl border border-border bg-ink/90 p-7 shadow-2xl md:p-9">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-mint">Illustrative studio scenario</p>
            <div className="mt-7 grid grid-cols-3 gap-3 text-center">
              {[["5", "artists"], ["6", "unused hours each"], ["£100", "per hour"]].map(([value, label]) => <div key={label} className="rounded-2xl border border-border bg-ink-deep p-3"><div className="font-display text-2xl font-black text-ice md:text-3xl">{value}</div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{label}</p></div>)}
            </div>
            <div className="mt-7 border-t border-border pt-7"><p className="text-sm text-muted-foreground">Theoretical unbooked gross capacity, per month</p><p className="mt-2 font-display text-5xl font-black tracking-tight text-mint">£3,000</p></div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Calculation: 5 × 6 hours × £100. This is an illustration of capacity, not a prediction of bookings, incremental sales, revenue recovery or profit. Recoverability depends on demand and operating constraints.</p>
          </div>
        </div>
      </section>
      <section className="bg-ink-deep px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-mint">What might be causing the gap?</p>
          <h2 className="mt-3 max-w-4xl font-display text-3xl font-black leading-tight tracking-tight text-ice md:text-4xl">More marketing isn’t always the answer.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { icon: CalendarDays, title: "Underused capacity", description: "Are artist hours going unbooked because demand is insufficient, uneven or incorrectly matched?" },
              { icon: BarChart3, title: "Enquiry leakage", description: "Do interested prospects disappear between their first message, consultation and deposit?" },
              { icon: Target, title: "Weak repeat booking", description: "Are existing projects, returning clients and referrals creating predictable future demand?" },
            ].map(({ icon: Icon, title, description }) => <div key={title} className="rounded-2xl border border-border bg-ink p-6"><Icon className="h-7 w-7 text-mint" aria-hidden="true" /><h3 className="mt-5 font-display text-xl font-black text-ice">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p></div>)}
          </div>
        </div>
      </section>
      <section className="border-t border-border bg-ink px-6 py-16 text-center md:py-24">
        <div className="mx-auto max-w-3xl"><h2 className="font-display text-3xl font-black text-ice md:text-4xl">Find the constraint worth investigating first.</h2><p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">The free Studio Growth Check uses figures you provide to estimate potential opportunities across capacity, conversion, cancellations and repeat business. It is a starting point, not a financial audit.</p><div className="mt-8"><GrowthCheckLink secondary /></div></div>
      </section>
    </PublicShell>
  );
}
