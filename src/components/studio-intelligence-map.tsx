import { useMemo, useState } from "react";
import { MapPin, Search, SlidersHorizontal, X } from "lucide-react";

type Studio = {
  name: string;
  city: string;
  region: string;
  postcode: string;
  tier: "stronger" | "standard" | "review";
  artists: number;
  score: number;
  x: number;
  y: number;
};

// Visual reference records only. The production dataset should be connected to Supabase
// once the canonical INKCARE/INKSIGHTS studio source is migrated. These records are
// deliberately labelled as demonstration data and are not commercial claims.
const demoStudios: Studio[] = [
  {
    name: "London Studio Cluster",
    city: "London",
    region: "London",
    postcode: "SW1",
    tier: "stronger",
    artists: 8,
    score: 91,
    x: 66,
    y: 78,
  },
  {
    name: "Brighton Studio Cluster",
    city: "Brighton",
    region: "South East",
    postcode: "BN1",
    tier: "stronger",
    artists: 6,
    score: 84,
    x: 67,
    y: 86,
  },
  {
    name: "Birmingham Studio Cluster",
    city: "Birmingham",
    region: "West Midlands",
    postcode: "B1",
    tier: "standard",
    artists: 5,
    score: 72,
    x: 47,
    y: 56,
  },
  {
    name: "Manchester Studio Cluster",
    city: "Manchester",
    region: "North West",
    postcode: "M1",
    tier: "stronger",
    artists: 7,
    score: 88,
    x: 45,
    y: 35,
  },
  {
    name: "Leeds Studio Cluster",
    city: "Leeds",
    region: "Yorkshire",
    postcode: "LS1",
    tier: "standard",
    artists: 5,
    score: 69,
    x: 53,
    y: 32,
  },
  {
    name: "Liverpool Studio Cluster",
    city: "Liverpool",
    region: "North West",
    postcode: "L1",
    tier: "review",
    artists: 3,
    score: 54,
    x: 39,
    y: 39,
  },
  {
    name: "Bristol Studio Cluster",
    city: "Bristol",
    region: "South West",
    postcode: "BS1",
    tier: "standard",
    artists: 4,
    score: 67,
    x: 38,
    y: 69,
  },
  {
    name: "Edinburgh Studio Cluster",
    city: "Edinburgh",
    region: "Scotland",
    postcode: "EH1",
    tier: "stronger",
    artists: 6,
    score: 86,
    x: 47,
    y: 10,
  },
  {
    name: "Glasgow Studio Cluster",
    city: "Glasgow",
    region: "Scotland",
    postcode: "G1",
    tier: "standard",
    artists: 4,
    score: 70,
    x: 40,
    y: 13,
  },
  {
    name: "Cardiff Studio Cluster",
    city: "Cardiff",
    region: "Wales",
    postcode: "CF1",
    tier: "review",
    artists: 3,
    score: 58,
    x: 35,
    y: 67,
  },
  {
    name: "Nottingham Studio Cluster",
    city: "Nottingham",
    region: "East Midlands",
    postcode: "NG1",
    tier: "standard",
    artists: 4,
    score: 65,
    x: 54,
    y: 50,
  },
  {
    name: "Newcastle Studio Cluster",
    city: "Newcastle",
    region: "North East",
    postcode: "NE1",
    tier: "standard",
    artists: 3,
    score: 63,
    x: 61,
    y: 24,
  },
];

const tierLabel = {
  stronger: "Stronger match",
  standard: "Standard candidate",
  review: "Needs review",
} as const;

export function StudioIntelligenceMap() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<"all" | Studio["tier"]>("all");
  const [selected, setSelected] = useState<Studio | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return demoStudios.filter((studio) => {
      const matchesTier = tier === "all" || studio.tier === tier;
      const matchesQuery =
        !q ||
        `${studio.name} ${studio.city} ${studio.region} ${studio.postcode}`
          .toLowerCase()
          .includes(q);
      return matchesTier && matchesQuery;
    });
  }, [query, tier]);

  return (
    <section
      id="studio-map"
      className="relative overflow-hidden border-y border-border bg-ink-deep py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">
              UK studio intelligence
            </p>
            <h2 className="mt-4 text-balance font-display text-4xl font-black leading-tight text-ice md:text-6xl">
              See the tattoo market as a dataset.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              An interactive intelligence layer for discovering studios, comparing signals and
              turning geography into a commercial decision surface.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right sm:gap-4">
            <Metric value="1,226" label="mapped candidates" />
            <Metric value="1,090" label="unique postcodes" />
            <Metric value="88" label="review flags" />
          </div>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-3xl border border-border bg-ink shadow-2xl shadow-black/20 lg:grid-cols-[1.4fr_.6fr]">
          <div className="relative min-h-[620px] overflow-hidden border-b border-border bg-[#071017] lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(160,255,218,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(160,255,218,.08)_1px,transparent_1px)] [background-size:40px_40px]" />
            <div className="absolute left-6 top-6 z-10 flex flex-wrap gap-2">
              <label className="flex min-w-[260px] items-center gap-2 rounded-xl border border-border bg-ink/90 px-3 py-2 backdrop-blur">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Studio, postcode or city"
                  className="w-full bg-transparent text-sm text-ice outline-none placeholder:text-muted-foreground"
                />
              </label>
              <button
                onClick={() =>
                  setTier(tier === "all" ? "stronger" : tier === "stronger" ? "review" : "all")
                }
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-ink/90 px-4 py-2 text-sm font-bold text-ice backdrop-blur hover:border-mint"
              >
                <SlidersHorizontal className="h-4 w-4" />{" "}
                {tier === "all" ? "All candidates" : tierLabel[tier]}
              </button>
            </div>

            <div className="absolute inset-x-[10%] top-[15%] bottom-[8%]">
              <svg
                viewBox="0 0 500 700"
                className="h-full w-full"
                role="img"
                aria-label="Stylised interactive map of the United Kingdom"
              >
                <path
                  d="M247 30 278 54 286 94 272 126 291 158 280 191 299 219 282 247 293 279 275 308 286 343 270 377 278 414 256 448 269 483 247 520 227 508 214 475 193 449 176 414 151 388 131 351 105 327 113 291 97 258 113 229 105 193 124 164 145 147 151 111 175 88 182 54 206 42Z"
                  fill="rgba(160,255,218,.055)"
                  stroke="rgba(160,255,218,.32)"
                  strokeWidth="2"
                />
                <path
                  d="M83 338 105 327 125 344 121 370 100 383 77 368Z"
                  fill="rgba(160,255,218,.045)"
                  stroke="rgba(160,255,218,.22)"
                  strokeWidth="2"
                />
                <path
                  d="M205 510 224 527 211 548 188 544 181 525Z"
                  fill="rgba(160,255,218,.045)"
                  stroke="rgba(160,255,218,.22)"
                  strokeWidth="2"
                />
              </svg>

              {filtered.map((studio) => (
                <button
                  key={studio.name}
                  onClick={() => setSelected(studio)}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${studio.x}%`, top: `${studio.y}%` }}
                  aria-label={`Open ${studio.name}`}
                >
                  <span
                    className={`block h-3 w-3 rounded-full border-2 border-ink shadow-[0_0_0_5px_rgba(160,255,218,.08)] transition group-hover:scale-150 ${studio.tier === "review" ? "bg-amber-300" : studio.tier === "stronger" ? "bg-mint" : "bg-sky-300"}`}
                  />
                  <span className="pointer-events-none absolute left-1/2 top-5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-ink px-2 py-1 text-[10px] font-bold text-ice shadow-xl group-hover:block">
                    {studio.city}
                  </span>
                </button>
              ))}
            </div>

            <div className="absolute bottom-6 left-6 flex flex-wrap gap-4 rounded-xl border border-border bg-ink/90 px-4 py-3 text-xs text-muted-foreground backdrop-blur">
              <Legend dot="bg-mint" label="Stronger match" />
              <Legend dot="bg-sky-300" label="Standard candidate" />
              <Legend dot="bg-amber-300" label="Review flag" />
            </div>
          </div>

          <aside className="flex min-h-[620px] flex-col bg-ink">
            {selected ? (
              <div className="flex h-full flex-col p-6">
                <button
                  onClick={() => setSelected(null)}
                  className="ml-auto rounded-lg p-2 text-muted-foreground hover:bg-ink-elev hover:text-ice"
                  aria-label="Close studio profile"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="mt-5">
                  <div className="inline-flex rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-bold uppercase tracking-[.12em] text-mint">
                    {tierLabel[selected.tier]}
                  </div>
                  <h3 className="mt-4 font-display text-3xl font-black text-ice">
                    {selected.name}
                  </h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-mint" /> {selected.city}, {selected.region} ·{" "}
                    {selected.postcode}
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <DataPoint label="Signal score" value={`${selected.score}/100`} />
                    <DataPoint label="Artists" value={String(selected.artists)} />
                  </div>
                  <div className="mt-8 rounded-2xl border border-border bg-ink-deep p-5">
                    <p className="text-xs font-bold uppercase tracking-[.15em] text-muted-foreground">
                      Next intelligence layer
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      Website, Google, reputation, social and commercial signals can be attached to
                      this studio record once the canonical Supabase dataset is connected.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-border p-6">
                  <p className="text-xs font-bold uppercase tracking-[.15em] text-mint">
                    Studio records
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <h3 className="font-display text-2xl font-black text-ice">
                      Explore candidates
                    </h3>
                    <span className="text-sm text-muted-foreground">{filtered.length} shown</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Select a marker or record to inspect the intelligence profile.
                  </p>
                </div>
                <div className="flex-1 overflow-auto p-3">
                  {filtered.map((studio) => (
                    <button
                      key={studio.name}
                      onClick={() => setSelected(studio)}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-ink-elev"
                    >
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${studio.tier === "review" ? "bg-amber-300" : studio.tier === "stronger" ? "bg-mint" : "bg-sky-300"}`}
                      />
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm text-ice">{studio.name}</strong>
                        <span className="text-xs text-muted-foreground">
                          {studio.city} · {studio.postcode}
                        </span>
                      </span>
                      <span className="text-xs font-bold text-mint">{studio.score}</span>
                    </button>
                  ))}
                  {!filtered.length && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No candidates match this search.
                    </div>
                  )}
                </div>
                <div className="border-t border-border p-6">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Demonstration interface. Production records should be labelled by data
                    confidence and verified status.
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-xl font-black text-ice sm:text-2xl">{value}</div>
      <div className="mt-1 max-w-[90px] text-[10px] uppercase leading-tight tracking-[.12em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <i className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-ink-elev p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-black text-ice">{value}</div>
    </div>
  );
}
