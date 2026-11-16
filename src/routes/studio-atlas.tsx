import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, BadgeCheck, CheckCircle2, LoaderCircle, LockKeyhole, Mail, MapPin, Plus, Search, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/public-site";
import { supabase } from "@/integrations/supabase/client";

type Studio = {
  id: string; studio_id: string; slug: string; name: string; town: string;
  public_address: string | null; latitude: number; longitude: number;
  website_url: string | null; instagram_url: string | null;
  about: string | null; styles: string[]; cover_url: string | null;
};
type View = "directory" | "claim" | "enquire";
const db = supabase as any;
const inputClass = "w-full rounded-xl border border-white/15 bg-[#102638] px-4 py-3 text-sm text-white outline-none transition focus:border-[#5BE7F2]";
const canonical = "https://getinksights.co.uk/studio-atlas";
const position = (s: Studio) => ({
  left: String(Math.max(4, Math.min(94, ((s.longitude + 8.7) / 11.5) * 100))) + "%",
  top: String(Math.max(4, Math.min(94, ((60.8 - s.latitude) / 11.6) * 100))) + "%",
});

export const Route = createFileRoute("/studio-atlas")({
  ssr: false,
  component: StudioAtlas,
  head: () => ({ meta: [
    { title: "Studio Atlas | Find and claim tattoo studios | INKSIGHTS" },
    { name: "description", content: "Explore verified UK tattoo studios, claim your listing or submit your studio for review." },
    { name: "robots", content: "noindex,follow" },
    { property: "og:url", content: canonical },
  ] }),
});

function StudioAtlas() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [search, setSearch] = useState("");
  const [styleFilter, setStyleFilter] = useState("All styles");
  const [selected, setSelected] = useState<Studio | null>(null);
  const [view, setView] = useState<View>("directory");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    db.from("atlas_profiles")
      .select("id,studio_id,slug,name,town,public_address,latitude,longitude,website_url,instagram_url,about,styles,cover_url")
      .eq("listing_status", "published").order("name").limit(500)
      .then(({ data, error: queryError }: { data: Studio[] | null; error: { message: string } | null }) => {
        if (!active) return;
        if (queryError) setError("Directory data is temporarily unavailable. Please try again shortly.");
        setStudios(data || []);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const styles = useMemo(() => ["All styles", ...Array.from(new Set(studios.flatMap(s => s.styles || []))).sort()], [studios]);
  const matches = useMemo(() => studios.filter(s => {
    const term = search.trim().toLowerCase();
    const matchTerm = !term || [s.name, s.town, ...(s.styles || [])].join(" ").toLowerCase().includes(term);
    return matchTerm && (styleFilter === "All styles" || (s.styles || []).includes(styleFilter));
  }), [studios, search, styleFilter]);

  function start(next: View, studio: Studio | null = null) {
    setSelected(studio);
    setView(next); setError(""); setNotice("");
  }
  async function claim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Sign in first to submit a claim. Your claim is not sent until you submit it while signed in.");
      const payload = {
        user_id: auth.user.id,
        studio_id: selected?.studio_id ?? null,
        proposed_studio_name: String(form.get("studio_name") || "").trim(),
        proposed_town: String(form.get("town") || "").trim(),
        proposed_website: String(form.get("website") || "").trim() || null,
        authority_role: String(form.get("role") || "owner"),
        verification_method: String(form.get("method") || "business_email"),
        evidence_note: String(form.get("evidence") || "").trim(),
        status: "pending",
      };
      const { error: writeError } = await db.from("atlas_claim_requests").insert(payload);
      if (writeError) throw new Error(writeError.message);
      setNotice("Your claim has been saved for manual verification. You cannot edit the public listing until approved.");
      setView("directory");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "We could not submit the claim."); }
    finally { setBusy(false); }
  }
  async function enquire(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return;
    setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const { data, error: requestError } = await supabase.functions.invoke("atlas-enquiry-intake", {
        body: {
          profile_id: selected.id,
          name: String(form.get("name") || ""),
          email: String(form.get("email") || ""),
          brief: String(form.get("brief") || ""),
          consent: form.get("consent") === "on",
          marketing_opt_in: false,
          website_honeypot: String(form.get("website_honeypot") || ""),
        },
      });
      if (requestError || !data?.ok) throw new Error(data?.error || requestError?.message || "The enquiry could not be recorded.");
      setNotice("Your enquiry has been recorded. The studio's notification and response arrangements are managed separately.");
      setView("directory");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The enquiry could not be sent."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#071520] text-[#EEF7FA]">
    <header className="border-b border-white/10 bg-[#091b2a]">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between px-5 py-5 lg:px-9">
        <a href="/" aria-label="INKSIGHTS home"><Logo /></a>
        <div className="hidden items-center gap-2 text-xs font-semibold tracking-[.15em] text-[#7BABB9] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#5BE7F2]"/> STUDIO ATLAS <span className="ml-2 text-[#648290]">/ VERIFIED DIRECTORY</span></div>
        <a href="/auth?next=%2Fatlas" className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:border-[#5BE7F2]">Studio sign in</a>
      </div>
    </header>
    <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(ellipse_at_70%_20%,#163a4d_0%,#0b2433_45%,#071520_100%)]">
      <div className="mx-auto max-w-[1560px] px-5 pb-9 pt-12 lg:px-9 lg:pb-12 lg:pt-16">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[.24em] text-[#5BE7F2]">INKSIGHTS / UK TATTOO STUDIO DIRECTORY</p>
            <h1 className="font-display text-5xl font-black leading-[1.06] tracking-tight text-white md:text-7xl">Great tattoos start<br/>with the <span className="text-[#5BE7F2]">right studio.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#A7BECA]">Find verified trading locations, explore the people behind the work and contact studios directly. Own a studio? Claim or add your profile free.</p>
          </div>
          <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5BE7F2] px-6 py-4 text-sm font-extrabold text-[#061924] hover:bg-white" onClick={() => start("claim")}> <Plus size={17}/> Claim or add your studio <ArrowRight size={16}/></button>
        </div>
      </div>
    </section>

    <div className="mx-auto grid max-w-[1560px] gap-0 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-0">
      <aside className="border-r border-white/10 bg-[#091C2A] px-5 py-7 lg:min-h-[760px] lg:px-7">
        <div className="mb-5 flex items-center justify-between">
          <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#5BE7F2]">Directory</p><h2 className="mt-1 font-display text-xl font-bold">Verified studio locations</h2></div>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-[#B1CFDA]">{studios.length}</span>
        </div>
        <label className="relative block"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#68909F]"/><input className={inputClass + " pl-11"} type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search studio, town or style" aria-label="Search studios"/></label>
        <select aria-label="Filter by tattoo style" className={inputClass+" mt-3"} value={styleFilter} onChange={e=>setStyleFilter(e.target.value)}>{styles.map(s=><option key={s} value={s}>{s}</option>)}</select>
        <p className="mb-4 mt-6 text-[11px] uppercase tracking-[.17em] text-[#7196A5]">{matches.length} published results · verified premises only</p>
        {loading?<div className="flex gap-3 text-sm text-[#9EBCC7]"><LoaderCircle className="animate-spin" size={18}/>Loading listings…</div>:null}
        {!loading && !matches.length?<div className="rounded-2xl border border-dashed border-[#376071] bg-[#102736] p-6"><ShieldCheck size={25} className="mb-4 text-[#5BE7F2]"/><p className="font-semibold">No matching published studios yet.</p><p className="mt-2 text-sm leading-relaxed text-[#96B4BF]">We do not publish research-only Companies House records as verified tattoo premises. Owners can submit a listing for review.</p><button onClick={()=>start("claim")} className="mt-5 text-sm font-bold text-[#5BE7F2]">Submit a studio <ArrowRight size={14} className="inline"/></button></div>:null}
        <div className="space-y-2">{matches.map(s=><button key={s.id} onClick={()=>setSelected(s)} className={"w-full rounded-xl border px-4 py-4 text-left transition hover:border-[#5BE7F2]/60 "+(selected?.id===s.id?"border-[#5BE7F2]/70 bg-[#15394A]":"border-white/10 bg-[#102938]")}><div className="flex justify-between gap-3"><strong className="text-sm">{s.name}</strong><BadgeCheck size={18} className="shrink-0 text-[#5BE7F2]"/></div><p className="mt-2 flex gap-1 text-xs text-[#A5C1CC]"><MapPin size={13}/>{s.town}</p><div className="mt-3 flex flex-wrap gap-1">{(s.styles||[]).slice(0,3).map(style=><span key={style} className="rounded bg-white/5 px-2 py-1 text-[10px] text-[#B6CED6]">{style}</span>)}</div></button>)}</div>
        <div className="mt-9 border-t border-white/10 pt-5 text-xs leading-relaxed text-[#7D9FAC]">Location verification and control of a listing are separate checks. A company registration alone does not establish a trading tattoo studio.</div>
      </aside>

      <div className="relative min-h-[540px] overflow-hidden bg-[radial-gradient(ellipse_at_60%_50%,#153E4D_0%,#0B2532_46%,#061724_100%)] lg:min-h-[760px]">
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{backgroundImage:"linear-gradient(#6CBAC51A 1px,transparent 1px),linear-gradient(90deg,#6CBAC51A 1px,transparent 1px)",backgroundSize:"54px 54px"}} />
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 820 850" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <defs><linearGradient id="atlas-land" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#2A5260"/><stop offset="1" stopColor="#102D3A"/></linearGradient><filter id="atlas-halo"><feGaussianBlur stdDeviation="11"/></filter></defs>
          <path d="M340 75 L390 91 414 118 385 138 412 163 402 207 430 224 409 252 441 280 422 317 450 344 449 377 478 394 455 422 478 445 464 474 484 503 477 529 516 553 526 579 514 605 537 642 571 669 575 698 542 721 512 718 471 736 456 770 420 778 403 761 381 770 366 741 340 734 324 698 310 679 297 640 321 606 322 578 303 549 307 520 285 491 295 456 281 427 291 392 259 363 279 324 271 298 298 274 285 242 300 207 286 184 311 166 292 139 324 109 Z" fill="#2D6875" opacity=".24" filter="url(#atlas-halo)"/>
          <path d="M340 75 L390 91 414 118 385 138 412 163 402 207 430 224 409 252 441 280 422 317 450 344 449 377 478 394 455 422 478 445 464 474 484 503 477 529 516 553 526 579 514 605 537 642 571 669 575 698 542 721 512 718 471 736 456 770 420 778 403 761 381 770 366 741 340 734 324 698 310 679 297 640 321 606 322 578 303 549 307 520 285 491 295 456 281 427 291 392 259 363 279 324 271 298 274 285 242 300 207 286 184 311 166 292 139 324 109 Z" fill="url(#atlas-land)" stroke="#528998" strokeWidth="2"/>
          <path d="M192 428 L236 407 254 434 249 470 261 514 247 547 251 581 226 617 191 648 157 643 144 616 168 584 154 548 167 513 161 477 Z" fill="url(#atlas-land)" stroke="#467B88" strokeWidth="2"/>
          {["M225 220L420 780","M110 555L602 555","M315 115L514 745"].map((d,i)=><path key={i} d={d} stroke="#5BE7F2" opacity=".06" strokeWidth="1.5" strokeDasharray="4 11"/>)}
          <g fill="#7BA7B6" fontSize="11" letterSpacing="3" opacity=".7"><text x="365" y="350">SCOTLAND</text><text x="378" y="600">ENGLAND</text><text x="310" y="690">WALES</text><text x="145" y="480">IRELAND</text></g>
        </svg>
        <div className="absolute left-5 top-5 rounded-xl border border-white/15 bg-[#071925]/90 px-4 py-3 text-[11px] font-semibold uppercase tracking-[.17em] text-[#B5D1D9] backdrop-blur-md"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#5BE7F2]"/>Verified locations · pilot</div>
        {matches.map(s=><button key={s.id} title={s.name} aria-label={"Show "+s.name} onClick={()=>setSelected(s)} style={position(s)} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-[#4DE5EC] p-2 shadow-[0_0_0_7px_#5BE7F222,0_0_25px_#5BE7F266] hover:bg-white"><MapPin size={15} className="text-[#06202A]"/></button>)}
        {!studios.length&&!loading?<div className="absolute bottom-6 left-5 right-5 max-w-lg rounded-2xl border border-[#487180] bg-[#081B29]/95 p-5 shadow-2xl backdrop-blur-lg lg:bottom-10 lg:left-10"><p className="text-xs font-bold uppercase tracking-[.19em] text-[#5BE7F2]">Pilot availability</p><h3 className="mt-2 font-display text-xl font-bold">Verified locations are being prepared.</h3><p className="mt-2 text-sm leading-relaxed text-[#A0BCC8]">The illustrated map is a geographic reference, not a claim that these are surveyed venue boundaries. No candidate pins are shown until reviewed and published.</p></div>:null}
        {selected&&view==="directory"?<div className="absolute bottom-4 left-4 right-4 z-20 max-w-[500px] rounded-2xl border border-[#5BE7F2]/40 bg-[#071D2B]/95 p-5 shadow-2xl backdrop-blur-xl lg:bottom-10 lg:left-10 lg:p-7"><div className="flex justify-between"><span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.1em] text-[#5BE7F2]"><BadgeCheck size={15}/>Verified trading location</span><button onClick={()=>setSelected(null)} className="text-xl text-[#C3D9E0]" aria-label="Close studio detail">×</button></div><h3 className="mt-3 font-display text-2xl font-bold">{selected.name}</h3><p className="mt-2 text-sm text-[#ABC9D3]">{selected.public_address||selected.town}</p><p className="mt-4 text-sm text-[#B8CED6]">{selected.about||"This studio has not published a description yet."}</p><div className="mt-5 flex flex-wrap gap-2"><button className="rounded-lg bg-[#5BE7F2] px-4 py-3 text-sm font-bold text-[#061A24]" onClick={()=>start("enquire",selected)}>Enquire <Mail size={14} className="inline"/></button><button className="rounded-lg border border-white/20 px-4 py-3 text-sm font-bold" onClick={()=>start("claim",selected)}>Claim profile</button>{selected.website_url?<a className="rounded-lg border border-white/20 px-4 py-3 text-sm" target="_blank" rel="noreferrer" href={selected.website_url}>Website <ArrowUpRight className="inline" size={14}/></a>:null}</div></div>:null}
      </div>
    </div>

    {view!=="directory" ? <div role="dialog" aria-modal="true" aria-label={view==="claim"?"Claim or add a studio":"Enquire with studio"} className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#030B11]/85 p-3 backdrop-blur-md">
      <div className="my-auto w-full max-w-xl rounded-3xl border border-[#446476] bg-[#091D2B] p-6 shadow-2xl md:p-9">
        <div className="mb-6 flex justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#5BE7F2]">{view==="claim"?"Ownership verification":"Direct enquiry"}</p><h2 className="mt-2 font-display text-2xl font-bold">{view==="claim"?(selected?"Claim "+selected.name:"Add your studio"):"Contact "+selected?.name}</h2></div><button onClick={()=>start("directory",selected)} className="h-9 w-9 rounded-full border border-white/20 text-xl" aria-label="Close form">×</button></div>
        {view==="claim"?<form className="grid gap-3" onSubmit={claim}>
          <p className="mb-2 text-sm text-[#ADC7D1]">A claim is a request for review, not automatic ownership. Sign in before submitting. We may ask for further corroborating evidence.</p>
          <input className={inputClass} name="studio_name" defaultValue={selected?.name||""} required minLength={2} maxLength={140} placeholder="Studio name" aria-label="Studio name"/>
          <input className={inputClass} name="town" defaultValue={selected?.town||""} required minLength={2} maxLength={100} placeholder="Town / city" aria-label="Town or city"/>
          <input className={inputClass} name="website" type="url" placeholder="https://studio-website.co.uk (optional)" aria-label="Studio website"/>
          <label className="text-xs text-[#A4C4CE]">Your role<select className={inputClass+" mt-2"} name="role"><option value="owner">Owner</option><option value="director">Director</option><option value="manager">Manager</option><option value="authorised_representative">Authorised representative</option></select></label>
          <label className="text-xs text-[#A4C4CE]">How can we verify your authority?<select className={inputClass+" mt-2"} name="method"><option value="business_email">Business domain email</option><option value="public_business_phone">Call verified public business number</option><option value="licence">Council registration/licence</option><option value="documents">Business documents</option><option value="other">Other evidence</option></select></label>
          <textarea className={inputClass} rows={4} required minLength={20} maxLength={2000} name="evidence" placeholder="Explain how you are authorised to manage this studio and which evidence you can provide. Do not include passwords or ID documents." aria-label="Evidence description"/>
          <button disabled={busy} className="mt-2 rounded-xl bg-[#5BE7F2] p-4 text-sm font-bold text-[#061924] disabled:opacity-50">{busy?"Submitting…":"Submit for verification"}</button>
          <a className="text-center text-sm font-semibold text-[#5BE7F2]" href="/auth?next=%2Fstudio-atlas">Need an account? Sign in or register <ArrowRight size={14} className="inline"/></a>
        </form>:<form className="grid gap-3" onSubmit={enquire}>
          <p className="mb-2 text-sm text-[#ADC7D1]">Your enquiry will be stored securely for routing to the selected studio. It will not be used for unrelated marketing without separate permission.</p>
          <input className={inputClass} name="name" required minLength={2} maxLength={120} placeholder="Your name" aria-label="Your name"/>
          <input className={inputClass} name="email" required type="email" maxLength={254} placeholder="Email address" aria-label="Email address"/>
          <textarea className={inputClass} name="brief" required minLength={20} maxLength={3000} rows={5} placeholder="Describe your tattoo idea, placement and approximate size…" aria-label="Tattoo enquiry"/>
          <input name="website_honeypot" className="absolute -left-[10000px]" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
          <label className="flex gap-3 text-xs leading-relaxed text-[#ACC6CE]"><input type="checkbox" name="consent" required className="mt-1" />I understand INKSIGHTS will process my information and share this enquiry with the selected studio to respond. <a href="/privacy" target="_blank" className="text-[#5BE7F2] underline">Privacy notice</a></label>
          <button disabled={busy} className="mt-2 rounded-xl bg-[#5BE7F2] p-4 text-sm font-bold text-[#061924] disabled:opacity-50">{busy?"Recording…":"Submit enquiry"}</button>
        </form>}
        {error?<p role="alert" className="mt-4 rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-sm text-rose-200">{error}</p>:null}
        <p className="mt-5 flex gap-2 text-xs leading-relaxed text-[#85AAB7]"><LockKeyhole size={16} className="shrink-0"/>Owner authority is checked before profile-editing rights are granted. Listings and their accuracy can be disputed or corrected.</p>
      </div>
    </div>:null}

    {notice?<div className="fixed bottom-5 right-5 z-[110] max-w-sm rounded-xl border border-[#5BE7F2]/50 bg-[#082B34] p-5 shadow-2xl"><CheckCircle2 size={18} className="mb-2 text-[#5BE7F2]"/><p className="text-sm leading-relaxed text-white">{notice}</p><button onClick={()=>setNotice("")} className="mt-3 text-xs text-[#5BE7F2]">Dismiss</button></div>:null}
    {error&&view==="directory"?<p role="alert" className="mx-auto max-w-5xl p-4 text-sm text-rose-300">{error}</p>:null}
    <footer className="flex flex-col gap-3 border-t border-white/10 px-6 py-8 text-xs text-[#829EAA] lg:flex-row lg:items-center lg:justify-between lg:px-10"><span>© INKSIGHTS · STUDIO ATLAS / PILOT</span><span className="flex items-center gap-2"><ShieldCheck size={14}/>Verified trading locations are distinct from registered companies.</span><a href="/contact" className="text-[#5BE7F2]">Report a listing issue <ArrowUpRight className="inline" size={13}/></a></footer>
  </main>;
}
