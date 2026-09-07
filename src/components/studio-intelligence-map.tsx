import { useMemo, useState } from "react";
import { MapPin, Search, SlidersHorizontal, X, Plus, Minus, LocateFixed } from "lucide-react";

type Studio = {
  name: string;
  city: string;
  region: string;
  postcode: string;
  tier: "stronger" | "standard" | "review";
  artists: number;
  score: number;
  count: number;
  x: number;
  y: number;
};

// Demonstration records only. Keep this visual/data contract stable so the component
// can be connected to the canonical Supabase studio dataset without another UI rewrite.
// x/y are normalised positions over the geographic UK artwork below.
const demoStudios: Studio[] = [
  { name: "London Studio Cluster", city: "London", region: "London", postcode: "SW1", tier: "stronger", artists: 8, score: 91, count: 300, x: 61, y: 79 },
  { name: "Brighton Studio Cluster", city: "Brighton", region: "South East", postcode: "BN1", tier: "stronger", artists: 6, score: 84, count: 66, x: 62, y: 86 },
  { name: "Birmingham Studio Cluster", city: "Birmingham", region: "West Midlands", postcode: "B1", tier: "standard", artists: 5, score: 72, count: 120, x: 49, y: 59 },
  { name: "Manchester Studio Cluster", city: "Manchester", region: "North West", postcode: "M1", tier: "stronger", artists: 7, score: 88, count: 184, x: 45, y: 40 },
  { name: "Leeds Studio Cluster", city: "Leeds", region: "Yorkshire", postcode: "LS1", tier: "standard", artists: 5, score: 69, count: 48, x: 53, y: 39 },
  { name: "Liverpool Studio Cluster", city: "Liverpool", region: "North West", postcode: "L1", tier: "review", artists: 3, score: 54, count: 22, x: 41, y: 47 },
  { name: "Bristol Studio Cluster", city: "Bristol", region: "South West", postcode: "BS1", tier: "standard", artists: 4, score: 67, count: 36, x: 42, y: 69 },
  { name: "Edinburgh Studio Cluster", city: "Edinburgh", region: "Scotland", postcode: "EH1", tier: "stronger", artists: 6, score: 86, count: 52, x: 45, y: 18 },
  { name: "Glasgow Studio Cluster", city: "Glasgow", region: "Scotland", postcode: "G1", tier: "standard", artists: 4, score: 70, count: 59, x: 39, y: 20 },
  { name: "Cardiff Studio Cluster", city: "Cardiff", region: "Wales", postcode: "CF1", tier: "review", artists: 3, score: 58, count: 13, x: 36, y: 68 },
  { name: "Nottingham Studio Cluster", city: "Nottingham", region: "East Midlands", postcode: "NG1", tier: "standard", artists: 4, score: 65, count: 9, x: 52, y: 52 },
  { name: "Newcastle Studio Cluster", city: "Newcastle", region: "North East", postcode: "NE1", tier: "standard", artists: 3, score: 63, count: 14, x: 59, y: 31 },
];

const tierLabel = { stronger: "Stronger match", standard: "Standard candidate", review: "Needs review" } as const;
const tierClass = { stronger: "bg-mint", standard: "bg-sky-300", review: "bg-amber-300" } as const;

export function StudioIntelligenceMap() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<"all" | Studio["tier"]>("all");
  const [selected, setSelected] = useState<Studio | null>(null);
  const [zoom, setZoom] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return demoStudios.filter((studio) => {
      const matchesTier = tier === "all" || studio.tier === tier;
      const matchesQuery = !q || `${studio.name} ${studio.city} ${studio.region} ${studio.postcode}`.toLowerCase().includes(q);
      return matchesTier && matchesQuery;
    });
  }, [query, tier]);

  const cycleTier = () => setTier(tier === "all" ? "stronger" : tier === "stronger" ? "review" : "all");

  return (
    <section id="studio-map" className="relative overflow-hidden border-y border-border bg-ink-deep py-20 md:py-28">
      <style>{`
        @keyframes map-grid-drift { from { background-position: 0 0, 0 0; } to { background-position: 40px 40px, 40px 40px; } }
        @keyframes map-scan { 0% { transform: translateY(-120%); opacity: 0; } 15% { opacity: .35; } 80% { opacity: .08; } 100% { transform: translateY(520%); opacity: 0; } }
        @keyframes marker-pulse { 0%, 100% { transform: scale(.72); opacity: .18; } 50% { transform: scale(1.7); opacity: .04; } }
        @keyframes marker-core { 0%, 100% { box-shadow: 0 0 0 4px rgba(160,255,218,.10), 0 0 18px rgba(160,255,218,.24); } 50% { box-shadow: 0 0 0 7px rgba(160,255,218,.06), 0 0 28px rgba(160,255,218,.38); } }
        @keyframes signal-dash { to { stroke-dashoffset: -24; } }
        @keyframes hub-breathe { 0%, 100% { opacity: .25; transform: scale(.92); } 50% { opacity: .5; transform: scale(1.04); } }
        .inksights-map-grid { animation: map-grid-drift 18s linear infinite; }
        .inksights-map-scan { animation: map-scan 8s ease-in-out infinite; }
        .inksights-marker-pulse { animation: marker-pulse 2.8s ease-out infinite; }
        .inksights-marker-core { animation: marker-core 2.8s ease-in-out infinite; }
        .inksights-signal { animation: signal-dash 2.4s linear infinite; }
        .inksights-hub { animation: hub-breathe 3.4s ease-in-out infinite; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .inksights-map-grid, .inksights-map-scan, .inksights-marker-pulse, .inksights-marker-core, .inksights-signal, .inksights-hub { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">UK studio intelligence</p>
            <h2 className="mt-4 text-balance font-display text-4xl font-black leading-tight text-ice md:text-6xl">See the tattoo market as a dataset.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">An interactive intelligence layer for discovering studios, comparing signals and turning geography into a commercial decision surface.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right sm:gap-4">
            <Metric value="1,226" label="mapped candidates" />
            <Metric value="1,090" label="unique postcodes" />
            <Metric value="88" label="review flags" />
          </div>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-3xl border border-border bg-ink shadow-2xl shadow-black/20 lg:grid-cols-[1.4fr_.6fr]">
          <div className="relative min-h-[620px] overflow-hidden border-b border-border bg-[#071017] lg:border-b-0 lg:border-r">
            <div className="inksights-map-grid absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(160,255,218,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(160,255,218,.08)_1px,transparent_1px)] [background-size:40px_40px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(80,255,210,.12),transparent_38%),radial-gradient(circle_at_48%_30%,rgba(50,150,255,.07),transparent_34%)]" />
            <div className="inksights-map-scan pointer-events-none absolute inset-x-[14%] top-0 h-20 bg-gradient-to-b from-transparent via-mint/10 to-transparent blur-md" />

            <div className="absolute left-6 top-6 z-20 flex flex-wrap gap-2">
              <label className="flex min-w-[260px] items-center gap-2 rounded-xl border border-border bg-ink/90 px-3 py-2 backdrop-blur">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Studio, postcode or city" className="w-full bg-transparent text-sm text-ice outline-none placeholder:text-muted-foreground" />
              </label>
              <button onClick={cycleTier} className="inline-flex items-center gap-2 rounded-xl border border-border bg-ink/90 px-4 py-2 text-sm font-bold text-ice backdrop-blur transition hover:border-mint">
                <SlidersHorizontal className="h-4 w-4" /> {tier === "all" ? "All candidates" : tierLabel[tier]}
              </button>
            </div>

            <div className="absolute right-5 top-5 z-20 flex flex-col overflow-hidden rounded-xl border border-border bg-ink/90 backdrop-blur">
              <button onClick={() => setZoom((z) => Math.min(1.35, +(z + .1).toFixed(2)))} className="p-2.5 text-ice transition hover:bg-ink-elev hover:text-mint" aria-label="Zoom in"><Plus className="h-4 w-4" /></button>
              <div className="border-t border-border" />
              <button onClick={() => setZoom((z) => Math.max(.82, +(z - .1).toFixed(2)))} className="p-2.5 text-ice transition hover:bg-ink-elev hover:text-mint" aria-label="Zoom out"><Minus className="h-4 w-4" /></button>
              <div className="border-t border-border" />
              <button onClick={() => setZoom(1)} className="p-2.5 text-muted-foreground transition hover:bg-ink-elev hover:text-mint" aria-label="Reset map view"><LocateFixed className="h-4 w-4" /></button>
            </div>

            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <div className="relative h-[92%] aspect-[512/941] transition-transform duration-500 ease-out" style={{ transform: `scale(${zoom})` }}>
                <img
                  src="https://commons.wikimedia.org/wiki/Special:Redirect/file/United_Kingdom_countries_icon_map.svg"
                  alt="Map of the four countries of the UK"
                  className="absolute inset-0 h-full w-full object-contain opacity-25 grayscale brightness-75 contrast-125"
                  draggable={false}
                />

                <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                  <defs>
                    <filter id="glow"><feGaussianBlur stdDeviation="1.4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    <radialGradient id="hubGlow"><stop offset="0" stopColor="rgba(160,255,218,.32)" /><stop offset="1" stopColor="rgba(160,255,218,0)" /></radialGradient>
                  </defs>
                  <circle className="inksights-hub" cx="61" cy="79" r="14" fill="url(#hubGlow)" />
                  <path className="inksights-signal" d="M61 79 C57 72 52 64 49 59 C47 52 46 46 45 40" fill="none" stroke="rgba(160,255,218,.28)" strokeWidth=".45" strokeDasharray="2 5" filter="url(#glow)" />
                  <path className="inksights-signal" d="M61 79 C55 69 47 63 42 69 C39 61 41 53 41 47" fill="none" stroke="rgba(120,220,255,.18)" strokeWidth=".35" strokeDasharray="2 6" />
                  <path className="inksights-signal" d="M45 40 C48 34 53 32 59 31" fill="none" stroke="rgba(160,255,218,.18)" strokeWidth=".35" strokeDasharray="1.5 5" />
                </svg>

                {filtered.map((studio, index) => {
                  const size = studio.count >= 250 ? 58 : studio.count >= 150 ? 50 : studio.count >= 80 ? 44 : studio.count >= 40 ? 38 : 31;
                  const isHub = studio.count >= 150;
                  return (
                    <button key={studio.name} onClick={() => setSelected(studio)} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${studio.x}%`, top: `${studio.y}%`, zIndex: isHub ? 12 : 8 }} aria-label={`Open ${studio.name}`}>
                      <span className={`inksights-marker-pulse pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${tierClass[studio.tier]}`} style={{ width: size + 22, height: size + 22, animationDelay: `${index * -0.25}s` }} />
                      <span className={`inksights-marker-core relative flex items-center justify-center rounded-full border-2 border-[#071017] font-display font-black text-[#071017] transition duration-300 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-mint ${tierClass[studio.tier]}`} style={{ width: size, height: size, animationDelay: `${index * -0.2}s` }}>
                        <span className="text-[11px] leading-none sm:text-xs">{studio.count}</span>
                      </span>
                      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-ink/95 px-2.5 py-1.5 text-[10px] font-bold text-ice shadow-xl backdrop-blur group-hover:block group-focus-visible:block">{studio.city}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="absolute bottom-6 left-6 z-20 flex flex-wrap gap-4 rounded-xl border border-border bg-ink/90 px-4 py-3 text-xs text-muted-foreground backdrop-blur">
              <Legend dot="bg-mint" label="Stronger match" />
              <Legend dot="bg-sky-300" label="Standard candidate" />
              <Legend dot="bg-amber-300" label="Review flag" />
            </div>
            <div className="absolute bottom-6 right-6 z-20 rounded-lg border border-border bg-ink/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground backdrop-blur">UK geography · indicative cluster view</div>
          </div>

          <aside className="flex min-h-[620px] flex-col bg-ink">
            {selected ? (
              <div className="flex h-full flex-col p-6">
                <button onClick={() => setSelected(null)} className="ml-auto rounded-lg p-2 text-muted-foreground hover:bg-ink-elev hover:text-ice" aria-label="Close studio profile"><X className="h-5 w-5" /></button>
                <div className="mt-5">
                  <div className="inline-flex rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-bold uppercase tracking-[.12em] text-mint">{tierLabel[selected.tier]}</div>
                  <h3 className="mt-4 font-display text-3xl font-black text-ice">{selected.name}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-mint" /> {selected.city}, {selected.region} · {selected.postcode}</p>
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <DataPoint label="Signal score" value={`${selected.score}/100`} />
                    <DataPoint label="Studios represented" value={String(selected.count)} />
                  </div>
                  <div className="mt-8 rounded-2xl border border-border bg-ink-deep p-5">
                    <p className="text-xs font-bold uppercase tracking-[.15em] text-muted-foreground">Next intelligence layer</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Website, Google, reputation, social and commercial signals can be attached to this studio record once the canonical Supabase dataset is connected.</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-border p-6">
                  <p className="text-xs font-bold uppercase tracking-[.15em] text-mint">Studio records</p>
                  <div className="mt-2 flex items-end justify-between gap-4"><h3 className="font-display text-2xl font-black text-ice">Explore candidates</h3><span className="text-sm text-muted-foreground">{filtered.length} shown</span></div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Select a marker or record to inspect the intelligence profile.</p>
                </div>
                <div className="flex-1 overflow-auto p-3">
                  {filtered.map((studio) => (
                    <button key={studio.name} onClick={() => setSelected(studio)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-ink-elev">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tierClass[studio.tier]}`} />
                      <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-ice">{studio.name}</strong><span className="text-xs text-muted-foreground">{studio.city} · {studio.postcode}</span></span>
                      <span className="text-xs font-bold text-mint">{studio.count}</span>
                    </button>
                  ))}
                  {!filtered.length && <div className="p-8 text-center text-sm text-muted-foreground">No candidates match this search.</div>}
                </div>
                <div className="border-t border-border p-6"><p className="text-xs leading-relaxed text-muted-foreground">Demonstration interface. Production records should be labelled by data confidence and verified status.</p></div>
              </>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div><div className="font-display text-xl font-black text-ice sm:text-2xl">{value}</div><div className="mt-1 max-w-[90px] text-[10px] uppercase leading-tight tracking-[.12em] text-muted-foreground">{label}</div></div>;
}

function Legend({ dot, label }: { dot: string; label: string }) { return <span className="flex items-center gap-2"><i className={`h-2 w-2 rounded-full ${dot}`} />{label}</span>; }
function DataPoint({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-border bg-ink-elev p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 font-display text-xl font-black text-ice">{value}</div></div>; }
