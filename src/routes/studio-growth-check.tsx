import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

const LIVE_GROWTH_CHECK =
  "https://cpnkxfgxdoswyigjzvyh.supabase.co/functions/v1/studio-growth-check";

export const Route = createFileRoute("/studio-growth-check")({
  head: () => ({
    meta: [
      { title: "Free Tattoo Studio Growth Check — INKSIGHT" },
      {
        name: "description",
        content:
          "Complete INKSIGHT's free tattoo studio growth check to identify the strongest commercial constraint and verify public website signals where available.",
      },
    ],
    links: [{ rel: "canonical", href: "https://getinksight.co.uk/studio-growth-check" }],
  }),
  component: StudioGrowthCheckRecoveryRoute,
});

function StudioGrowthCheckRecoveryRoute() {
  useEffect(() => {
    const target = new URL(LIVE_GROWTH_CHECK);
    const current = new URL(window.location.href);
    current.searchParams.forEach((value, key) => target.searchParams.set(key, value));
    window.location.replace(target.toString());
  }, []);

  return (
    <main className="min-h-screen bg-ink-deep px-6 py-20 text-foreground">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-ink p-8 shadow-2xl shadow-black/10 md:p-12">
        <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-black text-ice">
          INK<span className="text-mint">SIGHT</span>
        </Link>
        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-mint">
          <ShieldCheck className="h-4 w-4" /> Free Studio Growth Check
        </div>
        <h1 className="mt-6 text-balance font-display text-4xl font-black leading-tight text-ice md:text-6xl">
          Opening the live Studio Growth Check.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          INKSIGHT is transferring you to the current diagnostic service. Your existing campaign parameters are preserved.
        </p>
        <a
          href={LIVE_GROWTH_CHECK}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-mint px-6 py-3 font-bold text-ink-deep transition hover:bg-mint-soft"
        >
          Open the Growth Check <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </main>
  );
}
