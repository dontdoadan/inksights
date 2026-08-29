import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowRight, Activity, ScanSearch } from "lucide-react";

const signals = [
  { label: "Capacity", value: "£2,180", detail: "unused monthly opportunity", x: 22, y: 30 },
  { label: "Bookings", value: "£1,460", detail: "conversion leakage", x: 72, y: 24 },
  { label: "Retention", value: "£1,020", detail: "repeat-client opportunity", x: 78, y: 70 },
  { label: "AOV", value: "+8.4%", detail: "average booking value", x: 29, y: 73 },
] as const;

export function INKSIGHTS_Radar() {
  const [active, setActive] = useState(0);
  const [scan, setScan] = useState(0);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setScan((value) => value + 1);
      setActive((value) => (value + 1) % signals.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPointer({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
  };

  const signal = signals[active];

  return (
    <div ref={panelRef} onPointerMove={move} className="relative min-h-[540px] overflow-hidden rounded-[2rem] border border-mint/20 bg-ink shadow-2xl shadow-black/30" aria-label="Interactive INKSIGHTS revenue opportunity radar">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(160,255,218,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(160,255,218,.07)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(160,255,218,.13),transparent_42%)]" />
      <div className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-mint/20 bg-ink-deep/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-mint backdrop-blur-xl"><span className="live-dot" /> Scanning studio signals</div>
      <div className="absolute right-5 top-5 z-20 rounded-full border border-border bg-ink-deep/80 px-3 py-2 font-mono text-[10px] text-muted-foreground backdrop-blur-xl">SCAN {String(scan).padStart(3, "0")}</div>

      <div className="absolute inset-[9%] flex items-center justify-center" style={{ "--pointer-x": `${pointer.x}%`, "--pointer-y": `${pointer.y}%` } as CSSProperties}>
        <div className="radar-stage absolute aspect-square w-[76%] max-w-[430px] rounded-full border border-mint/20">
          <span className="absolute inset-[16%] rounded-full border border-mint/15" />
          <span className="absolute inset-[32%] rounded-full border border-mint/15" />
          <span className="absolute inset-[48%] rounded-full border border-mint/15" />
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-mint/10" />
          <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-mint/10" />
          <span className="radar-sweep-v2" />
          <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint shadow-[0_0_35px_rgba(160,255,218,.8)]" />
          {signals.map((item, index) => (
            <button key={item.label} type="button" onClick={() => setActive(index)} className={`absolute -translate-x-1/2 -translate-y-1/2 ${active === index ? "z-20" : "z-10"}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} aria-label={`Inspect ${item.label} signal`}>
              <span className={`block h-3 w-3 rounded-full border-2 border-ink transition-all ${active === index ? "scale-150 bg-mint shadow-[0_0_24px_rgba(160,255,218,.9)]" : "bg-sky-300/80"}`} />
              <span className={`pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-ink-deep/95 px-3 py-2 text-left shadow-xl transition-opacity ${active === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                <strong className="block text-[10px] uppercase tracking-[.12em] text-mint">{item.label}</strong><span className="mt-1 block font-display text-lg font-black text-ice">{item.value}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-5 bottom-5 z-30 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="rounded-2xl border border-mint/20 bg-ink-deep/90 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-mint"><ScanSearch className="h-3.5 w-3.5" /> Opportunity detected</div>
          <div className="mt-2 flex items-end gap-3"><span className="font-display text-3xl font-black text-ice">{signal.value}</span><span className="pb-1 text-xs text-muted-foreground">{signal.detail}</span></div>
        </div>
        <a href="/studio-growth-check" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep transition hover:bg-mint-soft">Find yours <ArrowRight className="h-4 w-4" /></a>
      </div>
      <div className="pointer-events-none absolute bottom-6 right-6 hidden text-[9px] font-bold uppercase tracking-[.16em] text-muted-foreground/60 sm:block">INKSIGHTS / INTELLIGENCE ENGINE <Activity className="ml-1 inline h-3 w-3" /></div>
    </div>
  );
}
