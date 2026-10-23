import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Search, ShieldCheck, ExternalLink, AlertCircle } from "lucide-react";
import { Card, PageHero, PublicShell } from "@/components/public-site";

export type DirectoryStudio = {
  id: string; name: string; address: string; area: string; postcode: string;
  latitude: number; longitude: number; website: string | null;
  ownerVerified: boolean; listingStatus: "observed_unclaimed";
  locationPrecision: "postcode_centroid_approximate"; reviewedAt: string | null;
};

const styleUrl = "https://tiles.openfreemap.org/styles/liberty";
const mapLibUrl = "https://unpkg.com/maplibre-gl@6.13.0/dist/maplibre-gl.mjs";
const mapCssUrl = "https://unpkg.com/maplibre-gl@6.13.0/dist/maplibre-gl.css";

export const Route = createFileRoute("/uk-studio-map")({
  component: StudioDirectory,
  head: () => ({
    meta: [
      { title: "Find UK Tattoo Studios | INKSIGHTS Studio Directory" },
      { name: "description", content: "Discover independently sourced tattoo studios on the INKSIGHTS UK map, and start a free, evidence-reviewed studio profile claim." },
    ],
    links: [{ rel: "canonical", href: "https://getinksights.co.uk/uk-studio-map" }],
  }),
});

function StudioDirectory() {
  const node = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [studios,setStudios] = useState<DirectoryStudio[]>([]);
  const [query,setQuery] = useState("");
  const [selected,setSelected] = useState<string | null>(null);
  const [status,setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [mapError,setMapError] = useState(false);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return studios.filter(s => !q || [s.name,s.area,s.address,s.postcode].join(" ").toLowerCase().includes(q));
  },[studios,query]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/studio-directory").then(async r => {
      if (!r.ok) throw new Error("The directory is unavailable.");
      return await r.json() as {studios:DirectoryStudio[]};
    }).then(body => { if (!cancelled) { setStudios(body.studios);setStatus("ready"); } })
      .catch(() => {if(!cancelled)setStatus("error")});
    return () => {cancelled=true};
  }, []);

  useEffect(() => {
    if (!node.current || !studios.length) return;
    let cancelled = false;
    let current: any;
    let markers: any[] = [];
    const start = async () => {
      try {
        if (!document.querySelector('link[data-inksights-map-css]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";link.href = mapCssUrl;link.dataset.inksightsMapCss = "1";
          document.head.appendChild(link);
        }
        const module = await import(/* @vite-ignore */ mapLibUrl);
        if (cancelled || !node.current) return;
        const maplibre = module.default ?? module;
        current = new maplibre.Map({
          container: node.current, style: styleUrl, center: [-2.2,54.0], zoom:5.0,
          attributionControl: true, interactive: true,
        });
        map.current = current;
        current.addControl(new maplibre.NavigationControl({showCompass:false}),"top-right");
        for (const studio of studios) {
          const marker = new maplibre.Marker({color:"#00E5D1"})
            .setLngLat([studio.longitude,studio.latitude]).addTo(current);
          marker.getElement().setAttribute("aria-label",`Approximate location of ${studio.name}`);
          marker.getElement().addEventListener("click",() => setSelected(studio.id));
          markers.push(marker);
        }
      } catch { if (!cancelled) setMapError(true); }
    };
    void start();
    return () => {cancelled=true;markers.forEach(x=>x.remove());current?.remove();if(map.current===current)map.current=null};
  },[studios]);

  const zoomTo = (s:DirectoryStudio) => {
    setSelected(s.id);
    map.current?.flyTo({center:[s.longitude,s.latitude],zoom:12,essential:true});
  };

  return <PublicShell>
    <PageHero eyebrow="UK Tattoo Studio Directory · Research pilot"
      title={<>Find a studio. <span className="text-mint">Discover better.</span></>}
      description="Explore independent tattoo studios. Locations are checked against studio websites and shown at approximate postcode level. No business has paid for verification or ranking." />
    <section className="border-y border-border bg-ink-deep px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-black text-ice">Verified-source location pilot</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Currently focused on South London. A checked address is not the same as a verified owner claim.</p>
          </div>
          <span className="rounded-full border border-mint/25 bg-mint/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-mint">{visible.length} studios shown</span>
        </div>
        <div className="grid gap-6 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            <label htmlFor="studio-search" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Search by studio, town or postcode</label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
              <input id="studio-search" value={query} onChange={e=>setQuery(e.target.value)}
                placeholder="e.g. Croydon, Storyville, BR2" className="w-full rounded-xl border border-border bg-ink px-11 py-3.5 text-ice outline-none focus:border-mint" />
            </div>
            {status==="error"&&<p role="alert" className="mt-4 rounded-xl border border-rose-600/40 p-4 text-sm text-rose-200">The directory could not load. Please try again later.</p>}
            <div aria-live="polite" className="mt-5 max-h-[590px] space-y-3 overflow-y-auto pr-1">
              {status==="loading"&&<p className="py-8 text-sm text-muted-foreground">Loading publicly reviewed studios…</p>}
              {status==="ready"&&visible.length===0&&<p className="py-8 text-sm text-muted-foreground">No matching studios in this initial pilot. Wider UK coverage will follow evidence review.</p>}
              {visible.map(s=><Card key={s.id} className={`bg-ink p-5 ${selected===s.id?"border-mint/60":""}`}>
                <div className="flex items-start justify-between gap-3"><div>
                  <h3 className="font-display text-lg font-bold text-ice">{s.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.address || s.area}</p>
                </div><MapPin className="h-5 w-5 shrink-0 text-mint"/></div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">Public address observed</span>
                  <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">Unclaimed</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                  <button type="button" onClick={()=>zoomTo(s)} className="text-mint hover:underline">Locate on map</button>
                  {s.website&&<a href={s.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ice hover:text-mint">Official website <ExternalLink className="h-3 w-3"/></a>}
                  <a href={`/studio-claim?studio=${encodeURIComponent(s.id)}`} className="inline-flex items-center gap-1 text-mint hover:underline">Claim free profile</a>
                </div>
              </Card>)}
            </div>
          </div>
          <div>
            <div className="relative min-h-[490px] overflow-hidden rounded-3xl border border-border bg-ink">
              <div ref={node} className="absolute inset-0" role="region" aria-label="Interactive map of UK tattoo studio locations" />
              {mapError&&<div className="absolute inset-0 flex items-center justify-center bg-ink p-6 text-center text-sm text-muted-foreground"><AlertCircle className="mr-2 h-5 w-5"/>Map tiles are temporarily unavailable. Studio details remain accessible in the listing.</div>}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-mint"/>
              <span>Postcode-centroid markers are approximate; verify the studio address before visiting.</span>
              <a href="https://openfreemap.org/" target="_blank" rel="noreferrer" className="underline">OpenFreeMap</a>
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap attribution</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </PublicShell>;
}
