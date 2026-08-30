import { BarChart3, CalendarDays, Users, Zap } from "lucide-react";
import { useState } from "react";

const metrics = [
  ["Revenue", "£84,240", "+8.2%", "vs previous period"],
  ["Bookings", "386", "+12.1%", "confirmed appointments"],
  ["Utilisation", "71%", "−4.7 pts", "available artist time"],
  ["Repeat clients", "42%", "+3.6 pts", "returning clients"],
] as const;

const opportunities = [
  { title: "Underutilised midweek capacity", value: "£8,400 / yr", text: "Tuesday–Thursday utilisation is 17% below the studio average.", icon: CalendarDays },
  { title: "Booking conversion leakage", value: "£5,760 / yr", text: "Qualified enquiries are not consistently progressing to confirmed bookings.", icon: BarChart3 },
  { title: "Repeat booking opportunity", value: "£4,320 / yr", text: "Second-booking behaviour is below the relevant studio benchmark.", icon: Users },
] as const;

export function INKSIGHTS_DashboardDemo() {
  const [active, setActive] = useState(0);
  const opportunity = opportunities[active];
  const Icon = opportunity.icon;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-border bg-ink shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-mint">Illustrative studio</p><h3 className="mt-1 font-display text-2xl font-black text-ice">Studio overview</h3></div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-ink-deep px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground"><span className="h-2 w-2 rounded-full bg-mint" /> Intelligence active</div>
      </div>
      <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, delta, note]) => <div key={label} className="bg-ink p-5"><p className="text-xs font-semibold text-muted-foreground">{label}</p><div className="mt-2 flex items-end gap-2"><span className="font-display text-2xl font-black text-ice">{value}</span><span className="text-[10px] font-bold text-mint">{delta}</span></div><p className="mt-1 text-[10px] text-muted-foreground">{note}</p></div>)}
      </div>
      <div className="grid lg:grid-cols-[1fr_.8fr]">
        <div className="border-b border-border p-5 lg:border-b-0 lg:border-r md:p-7">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground">Performance signal</p><p className="mt-1 text-sm font-bold text-ice">Revenue trend</p></div><Zap className="h-5 w-5 text-mint" /></div>
          <div className="mt-8 flex h-40 items-end gap-2 sm:gap-3" aria-label="Illustrative revenue trend chart">
            {[42, 51, 47, 59, 63, 60, 72, 68, 79, 83, 76, 91].map((height, i) => <div key={i} className="group flex h-full flex-1 items-end"><div className="w-full rounded-t-md bg-mint/20 transition-all group-hover:bg-mint/50" style={{ height: `${height}%` }} /></div>)}
          </div>
          <div className="mt-3 flex justify-between text-[9px] uppercase tracking-[.12em] text-muted-foreground"><span>12 months ago</span><span>Now</span></div>
        </div>
        <div className="p-5 md:p-7">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-mint">Opportunity engine</p><p className="mt-1 text-sm font-bold text-ice">{opportunities.length} opportunities detected</p></div><span className="rounded-full border border-mint/20 bg-mint/5 px-2 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-mint">Priority</span></div>
          <div className="mt-5 space-y-2">{opportunities.map((item, i) => <button key={item.title} type="button" onClick={() => setActive(i)} className={`w-full rounded-xl border p-3 text-left transition ${active === i ? "border-mint/30 bg-mint/5" : "border-border bg-ink-deep hover:border-border/80"}`}><div className="flex items-start gap-3"><span className={`mt-1 h-2 w-2 rounded-full ${active === i ? "bg-mint" : "bg-sky-300"}`} /><span className="min-w-0 flex-1"><strong className="block text-xs text-ice">{item.title}</strong><span className="mt-1 block text-[10px] text-muted-foreground">{item.value}</span></span></div></button>)}</div>
          <div className="mt-4 rounded-2xl border border-mint/20 bg-ink-deep p-4"><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.14em] text-mint"><Icon className="h-3.5 w-3.5" /> Selected insight</div><p className="mt-2 font-display text-lg font-black text-ice">{opportunity.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{opportunity.text}</p><p className="mt-3 font-display text-xl font-black text-mint">{opportunity.value}</p></div>
        </div>
      </div>
      <p className="border-t border-border px-5 py-3 text-[10px] leading-relaxed text-muted-foreground md:px-7">Demonstration interface. Figures are illustrative and do not represent a customer result.</p>
    </div>
  );
}
