import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, MapPinned, ShieldCheck, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/public-site";
type Profile={id:string;studio_id:string;name:string;town:string;listing_status:string;premises_verified_at:string|null;premises_verified_until:string|null;latitude:number|null;longitude:number|null;public_address:string|null};
type Draft={id:string;studio_id:string;about:string|null;website_url:string|null;instagram_url:string|null;styles:string[];proposed_public_address:string|null;created_at:string};
const cls="w-full rounded-xl border border-white/15 bg-[#102C3B] p-3 text-sm text-white outline-none focus:border-[#5BE7F2]";
export const Route=createFileRoute("/_authenticated/atlas-publication")({
 ssr:false,component:AtlasPublication,
 head:()=>({meta:[{title:"Atlas listing approvals | INKSIGHTS"},{name:"robots",content:"noindex,nofollow,noarchive"}]})
});
function AtlasPublication(){
 const [profiles,setProfiles]=useState<Profile[]>([]);
 const [drafts,setDrafts]=useState<Draft[]>([]);
 const [active,setActive]=useState("");
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 async function call(body:Record<string,unknown>){
   const {data:session}=await supabase.auth.getSession();
   const token=session.session?.access_token;
   if(!token)throw Error("Admin sign-in required.");
   const {data,error}=await supabase.functions.invoke("atlas-review-gateway",{body,headers:{Authorization:"Bearer "+token}});
   if(error||!data?.ok)throw Error(data?.error||error?.message||"Review failed.");
   return data;
 }
 async function refresh(){
  setLoading(true);setError("");
  try{const data=await call({action:"list_profiles"});setProfiles(data.profiles||[]);setDrafts(data.drafts||[]);}
  catch(e){setError(e instanceof Error?e.message:"Cannot load profiles.");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void refresh();},[]);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!active)return;
  setBusy(true);setError("");setNotice("");
  const f=new FormData(e.currentTarget),decision=String(f.get("decision")||"suspend");
  try{
   await call({
    action:"publication",profile_id:active,decision,
    evidence_summary:String(f.get("evidence")||"").trim(),
    source_url:String(f.get("source")||"").trim()||null,
    latitude:f.get("latitude")!==""?Number(f.get("latitude")):null,
    longitude:f.get("longitude")!==""?Number(f.get("longitude")):null,
    public_address:String(f.get("address")||"").trim()||null,
    owner_public_location_confirmed:f.get("confirmed")==="on",
    draft_id:String(f.get("draft")||"")||null
   });
   setNotice("Recorded. Atlas will display the record only when publication requirements are met.");
   setActive("");await refresh();
  }catch(err){setError(err instanceof Error?err.message:"Action could not be saved.");}
  finally{setBusy(false);}
 }
 const selected=profiles.find(p=>p.id===active);
 const relevant=drafts.filter(d=>d.studio_id===selected?.studio_id);
 return <main className="min-h-screen bg-[#071520] text-white">
   <header className="border-b border-white/10 bg-[#0B2030]"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><a href="/"><Logo/></a><a href="/atlas-review" className="flex items-center gap-2 text-sm text-[#5BE7F2]"><ArrowLeft size={16}/>Claims review</a></div></header>
   <div className="mx-auto max-w-6xl space-y-8 px-5 py-12">
    <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#5BE7F2]"><ShieldCheck size={16}/>Admin only / venue evidence</p><h1 className="mt-3 font-display text-4xl font-bold">Studio profile publication</h1><p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#A7C5D0]">The business claim and public studio address are independently verified. This console records location evidence, requires an explicit owner-authorised public address, and provides moderated studio profile changes.</p></div>
    {notice?<div role="status" className="rounded-xl border border-[#5BE7F2]/50 bg-[#133F4A] p-4 text-sm">{notice}</div>:null}
    {error?<div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-200">{error}</div>:null}
    <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
      <section className="rounded-2xl border border-white/10 bg-[#102937] p-5"><h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><MapPinned size={19} className="text-[#5BE7F2]"/>Studio profiles</h2>
      {loading?<p className="text-sm text-[#AAC7D1]">Loading…</p>:null}
      {!loading&&!profiles.length?<p className="text-sm text-[#AAC7D1]">No linked profiles. Approve a legitimate studio claim first.</p>:null}
      <div className="space-y-2">{profiles.map(p=><button className={"w-full rounded-xl border px-4 py-4 text-left "+(active===p.id?"border-[#5BE7F2] bg-[#164153]":"border-white/10 bg-[#112B3A]")} onClick={()=>setActive(p.id)} key={p.id}><strong className="block">{p.name}</strong><span className="mt-2 block text-xs text-[#A6C5D0]">{p.town} · {p.listing_status}</span><span className="mt-1 block text-[11px] text-[#5BE7F2]">{drafts.filter(d=>d.studio_id===p.studio_id).length} pending edits</span></button>)}</div></section>
      <section className="rounded-2xl border border-white/10 bg-[#102937] p-6 md:p-8">
       {!selected?<div className="flex min-h-64 items-center justify-center text-center text-sm text-[#AAC7D1]">Select a studio to review trading premises and proposed updates.</div>:<form key={selected.id} onSubmit={submit} className="space-y-4">
        <div><h2 className="text-2xl font-bold">{selected.name}</h2><p className="mt-2 text-sm text-[#AAC7D1]">Current listing status: {selected.listing_status}. Publication never follows claim approval automatically.</p></div>
        <label className="block text-xs text-[#AAC7D1]">Action<select className={cls+" mt-2"} name="decision"><option value="publish">Publish verified trading premises</option><option value="suspend">Suspend public listing</option><option value="approve_draft">Approve studio profile edits</option><option value="reject_draft">Reject studio profile edits</option></select></label>
        <label className="block text-xs text-[#AAC7D1]">Pending studio draft<select className={cls+" mt-2"} name="draft"><option value="">No draft selected</option>{relevant.map(d=><option value={d.id} key={d.id}>{new Date(d.created_at).toLocaleDateString("en-GB")} · {d.styles.join(", ")||"Profile update"}</option>)}</select></label>
        {relevant.length?<div className="rounded-xl border border-white/10 bg-[#09202D] p-4 text-sm text-[#C2D9E2]">Proposed changes: {relevant[0].about||"No description"} · {relevant[0].website_url||"No website"} · {relevant[0].proposed_public_address||"No address"}. A proposed address is not published without separate premises verification.</div>:null}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-[#AAC7D1]">UK latitude<input className={cls+" mt-2"} name="latitude" type="number" min="49" max="61" step="any" defaultValue={selected.latitude??""} placeholder="51.51"/></label>
          <label className="block text-xs text-[#AAC7D1]">UK longitude<input className={cls+" mt-2"} name="longitude" type="number" min="-9" max="3" step="any" defaultValue={selected.longitude??""} placeholder="-0.13"/></label>
        </div>
        <label className="block text-xs text-[#AAC7D1]">Verified public trading address<input className={cls+" mt-2"} name="address" defaultValue={selected.public_address||""} maxLength={300} placeholder="Street address, town and postcode"/></label>
        <label className="block text-xs text-[#AAC7D1]">Independent HTTPS evidence URL<input className={cls+" mt-2"} name="source" type="url" placeholder="https://official-studio-or-council-source"/></label>
        <label className="block text-xs text-[#AAC7D1]">Reviewer evidence record<textarea className={cls+" mt-2"} rows={4} required minLength={40} maxLength={2000} name="evidence" placeholder="Record how the venue was verified, public address authorisation and evidence details. Minimum 40 characters."/></label>
        <label className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-relaxed text-[#E0D1AF]"><input type="checkbox" name="confirmed" className="mt-1"/>I have evidence that displaying this location publicly is appropriate and authorised by the studio (mandatory for publication).</label>
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5BE7F2] p-4 text-sm font-bold text-[#061A24] disabled:opacity-50">{busy?"Saving…":<><CheckCircle2 size={17}/>Record editorial decision</>}</button>
        <p className="text-xs leading-relaxed text-[#8DADB9]">A published location is automatically removed from public read access when premises verification expires. Approval is not endorsement of pricing, workmanship or future availability.</p>
       </form>}
      </section>
    </div>
   </div>
 </main>;
}
