import { createFileRoute } from "@tanstack/react-router";
import { StudioIntelligenceMap } from "@/components/studio-intelligence-map";
import { PageHero, PrimaryButton, PublicShell } from "@/components/public-site";

export const Route = createFileRoute("/studio-map")({
  component: StudioMapPage,
  head: () => ({
    meta: [
      { title: "UK Tattoo Studio Map | INKSIGHTS" },
      { name: "description", content: "Explore an interactive geographic index of tattoo studios across the UK, with studio records, locations and future verification and claiming features." },
    ],
  }),
});

function StudioMapPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Public industry resource"
        title="Explore the UK tattoo studio map."
        description="A growing geographic index of tattoo studios across the UK. Search studios, inspect public records and, as the directory develops, claim and verify your studio profile."
      >
        <PrimaryButton href="#map">Explore the map</PrimaryButton>
      </PageHero>
      <div id="map"><StudioIntelligenceMap /></div>
      <section className="border-t border-border bg-ink"><div className="mx-auto max-w-5xl px-6 py-16 text-center md:py-20"><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">For studio owners</p><h2 className="mt-4 font-display text-3xl font-black text-ice md:text-5xl">Claim your studio when verification opens.</h2><p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">The long-term directory will allow studio owners to claim a public profile, correct information and establish a verified relationship with their studio record.</p></div></section>
    </PublicShell>
  );
}
