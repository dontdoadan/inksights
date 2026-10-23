import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SavedStage = { submissionId: string; submittedAt: string; result: Record<string,unknown>; normalized: Record<string,unknown> };
type Profile = { id: string; studio_id: string; claimed_at: string; expires_at: string };
type StudioOption = { id:string; name:string; role:string };
type LinkedResponse = { history:Record<string,SavedStage>; studioId:string };
const TOKEN_KEY = "inksights:journey:unverified-session";
const API = "/api/public/studio-journey-submit";
const formatGbp = (v:unknown) => new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(typeof v==="number"?v:0);

export const Route = createFileRoute("/_authenticated/studio-intelligence")({
  component: StudioIntelligenceProfile,
  head: () => ({ meta: [
    { title: "Your Studio Intelligence | INKSIGHTS" },
    { name: "robots", content: "noindex,nofollow,noarchive" },
  ]}),
});

function StudioIntelligenceProfile() {
  const [profiles,setProfiles] = useState<Profile[]>([]);
  const [studios,setStudios] = useState<StudioOption[]>([]);
  const [selected,setSelected] = useState<string>("");
  const [detail,setDetail] = useState<LinkedResponse|null>(null);
  const [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false);
  const [anonymousToken,setAnonymousToken] = useState(false);

  async function post(body:Record<string,unknown>) {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) throw new Error("Your sign-in session has expired. Please sign in again.");
    const res = await fetch(API,{
      method:"POST",
      headers:{"content-type":"application/json","authorization":"Bearer "+data.session.access_token},
      body:JSON.stringify(body),
      cache:"no-store",
    });
    const reply:Record<string,unknown> = await res.json();
    if (!res.ok) throw new Error(typeof reply.error==="string"?reply.error:"Unable to complete request.");
    return reply;
  }
  async function load() {
    setNotice("");
    try {
      const {data:auth,error} = await supabase.auth.getUser();
      if (error||!auth.user) throw new Error("Please sign in.");
      const {data:members,error:membershipError} = await supabase.from("studio_members")
        .select("studio_id,role,active").eq("user_id",auth.user.id).eq("active",true);
      if (membershipError) throw new Error("Studio membership could not be read.");
      const allowed=(members||[]).filter(m=>m.role==="owner"||m.role==="admin");
      let names:Record<string,string>={};
      if (allowed.length) {
        const {data:rows} = await supabase.from("studios")
          .select("id,name").in("id",allowed.map(m=>m.studio_id));
        names=Object.fromEntries((rows||[]).map(s=>[s.id,s.name]));
      }
      setStudios(allowed.map(m=>({id:m.studio_id,name:names[m.studio_id]||m.studio_id,role:m.role})));
      const mine=await post({action:"mine"});
      setProfiles(Array.isArray(mine.linkedProfiles)?mine.linkedProfiles as Profile[]:[]);
      setAnonymousToken(Boolean(window.sessionStorage.getItem(TOKEN_KEY)));
    } catch(e) { setNotice(e instanceof Error?e.message:"Could not load linked profiles."); }
  }
  useEffect(()=>{void load();},[]);

  async function claim(studioId:string) {
    setBusy(true);setNotice("");
    try {
      const sessionToken=window.sessionStorage.getItem(TOKEN_KEY);
      if (!sessionToken)throw new Error("No saved assessment was found in this browser.");
      await post({action:"claim",sessionToken,studioId});
      // Account association never upgrades self-reported figures to independently VERIFIED.
      setNotice("Assessment linked to an existing authorised studio. Inputs remain labelled self-reported.");
      await load();
    } catch(e){setNotice(e instanceof Error?e.message:"Studio linkage failed.");}
    finally{setBusy(false);}
  }
  async function open(id:string) {
    setBusy(true);setNotice("");
    try {
      const response=await post({action:"linked_profile",sessionId:id});
      setDetail(response as LinkedResponse);
      setSelected(id);
    } catch(e){setNotice(e instanceof Error?e.message:"This studio intelligence profile is unavailable.");}
    finally{setBusy(false);}
  }
  return <main className="min-h-screen bg-ink-deep px-5 py-10 text-foreground md:px-8">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">INKSIGHTS · Studio Intelligence</p>
          <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-ice md:text-4xl">Your growing intelligence profile</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Revisit assessments connected to your authorised studio account. These preliminary results are separate from a paid, evidence-verified audit.</p>
        </div>
        <Link to="/dashboard" className="rounded-full border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:text-mint">Dashboard</Link>
      </div>
      {notice && <p role="status" className="mb-6 rounded-2xl border border-mint/30 bg-mint/[0.06] p-4 text-sm text-ice">{notice}</p>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <section className="space-y-5">
          <div className="rounded-3xl border border-border bg-ink p-6">
            <h2 className="font-display text-xl font-black text-ice">Your linked assessment history</h2>
            {!profiles.length && <p className="mt-4 text-sm text-muted-foreground">No existing intelligence sessions are linked to your account yet.</p>}
            <div className="mt-4 space-y-3">{profiles.map(p=><button key={p.id} disabled={busy} onClick={()=>void open(p.id)}
              className={"w-full rounded-2xl border p-4 text-left transition hover:border-mint/60 "+(selected===p.id?"border-mint bg-mint/[0.06]":"border-border bg-ink-deep")}>
              <span className="block text-sm font-bold text-ice">Studio ID: {p.studio_id}</span>
              <span className="mt-1 block text-xs text-muted-foreground">Linked {new Date(p.claimed_at).toLocaleDateString("en-GB")} · Select to inspect saved findings</span>
            </button>)}</div>
          </div>
          {detail && <section className="rounded-3xl border border-border bg-ink p-6" aria-label="Saved diagnostic results">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Profile snapshot · Self-reported</p>
            <h2 className="mt-2 font-display text-2xl font-black text-ice">{String((detail.history.growth?.normalized?.studio as Record<string,unknown>|undefined)?.name||"Studio assessment")}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Metric label="Enquiry conversion" value={detail.history.growth?.result?.conversion_pct == null?"—":String(detail.history.growth.result.conversion_pct)+"%"} />
              <Metric label="Artist utilisation" value={detail.history.growth?.result?.utilisation_pct == null?"—":String(detail.history.growth.result.utilisation_pct)+"%"} />
              <Metric label="Modelled booking-value change" value={detail.history.revenue?formatGbp(detail.history.revenue.result.modelled_difference_gbp):"—"} />
              <Metric label="Reported visibility concerns" value={detail.history.visibility?String(detail.history.visibility.result.reported_friction_count):"—"} />
            </div>
            <h3 className="mt-7 text-lg font-bold text-ice">Current indicative priority</h3>
            <p className="mt-2 text-sm text-muted-foreground">{String(detail.history.summary?.result?.priority||detail.history.growth?.result?.priority||"Further evidence required")}</p>
            <p className="mt-5 text-xs text-muted-foreground">All historical observations remain subject to independent verification. Your existing studio data and other studios’ private reports are not modified by linkage.</p>
          </section>}
        </section>
        <aside className="space-y-5">
          <section className="rounded-3xl border border-border bg-ink p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Link the browser assessment</p>
            <h2 className="mt-2 font-display text-xl font-black text-ice">Confirm your studio</h2>
            <p className="mt-3 text-sm text-muted-foreground">Only an already-authorised owner or admin can attach the current provisional assessment. Matching a business name is not proof of ownership.</p>
            {anonymousToken && studios.length>0 ? <div className="mt-4 space-y-2">{studios.map(s=><button key={s.id} disabled={busy} onClick={()=>void claim(s.id)}
              className="w-full rounded-xl bg-mint px-4 py-3 text-left text-sm font-bold text-ink-deep disabled:opacity-50">Link to {s.name}</button>)}</div> :
              <p className="mt-4 rounded-xl bg-ink-deep p-3 text-xs text-muted-foreground">No eligible owner/admin membership or no saved assessment in this browser. Studio verification must be completed through the existing authorised onboarding process.</p>}
            <a className="mt-4 inline-block text-sm font-bold text-mint" href="/tools/studio-intelligence-journey-connected.html">Open the connected Growth Check →</a>
          </section>
          <section className="rounded-3xl border border-border bg-ink p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Evidence-backed next step</p>
            <h2 className="mt-2 font-display text-xl font-black text-ice">Studio Intelligence Audit</h2>
            <p className="mt-2 font-display text-3xl font-black text-ice">£395</p>
            <p className="mt-3 text-sm text-muted-foreground">One-off paid investigation, report and findings review. Payment does not automatically publish an unfinished audit.</p>
            <a href="/offers/studio-intelligence-audit" className="mt-4 inline-block rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep">View audit and checkout</a>
          </section>
        </aside>
      </div>
    </div>
  </main>;
}
function Metric({label,value}:{label:string;value:string}){
  return <div className="rounded-2xl border border-border/70 bg-ink-deep p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-2 text-xl font-bold text-ice">{value}</div></div>;
}
