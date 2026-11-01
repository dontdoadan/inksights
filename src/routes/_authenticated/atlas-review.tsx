import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, BadgeCheck, ClipboardList, Lock, RefreshCcw, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/public-site";

type Claim = {
 id:string; user_id:string; studio_id:string|null; proposed_studio_name:string; proposed_town:string;
 proposed_website:string|null; authority_role:string; verification_method:string; evidence_note:string;
 status:string;created_at:string;
};
const input="w-full rounded-lg border border-white/15 bg-[#112C3C] px-3 py-3 text-sm text-white outline-none focus:border-[#5BE7F2]";
export const Route=createFileRoute("/_authenticated/atlas-review")({
 ssr:false,
 component:AtlasReview,
 head:()=>({meta:[{title:"Studio Atlas review console | INKSIGHTS"},{name:"robots",content:"noindex,nofollow,noarchive"}]}),
});
function AtlasReview(){
 const [claims,setClaims]=useState<Claim[]>([]);
 const [selected,setSelected]=useState<Claim|null>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 async function perform(body:Record<string,unknown>){
  const {data:session,error:sessionError}=await supabase.auth.getSession();
  const token=session.session?.access_token;
  if(sessionError||!token)throw Error("Your session has expired.");
  const {data,error:invokeError}=await supabase.functions.invoke("atlas-review-gateway",{
   body,headers:{Authorization:"Bearer "+token}
  });
  if(invokeError||!data?.ok)throw Error(data?.error||invokeError?.message||"Review operation failed.");
  return data;
 }
 async function refresh(){
  setLoading(true);setError("");
  try{const result=await perform({action:"list"});setClaims(result.claims||[]);}
  catch(e){setError(e instanceof Error?e.message:"Could not load claim queue.");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void refresh();},[]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!selected)return;
  setBusy(true);setError("");setNotice("");
  const form=new FormData(event.currentTarget);
  const decision=String(form.get("decision")||"needs_evidence");
  try{
   await perform({
    action:"review",claim_id:selected.id,decision,
    authority_confirmed:form.get("authority_confirmed")==="on",
    evidence_summary:String(form.get("review_note")||"").trim(),
    existing_studio_id:String(form.get("canonical_id")||"").trim()||null,
    existing_visibility_id:String(form.get("visibility_id")||"").trim()||null
   });
   setNotice("Review saved. Approved claims have been linked to studio identity and membership records; the public listing remains unpublished.");
   setSelected(null);await refresh();
  }catch(e){setError(e instanceof Error?e.message:"Could not complete review. Confirm its current status.");}
  finally{setBusy(false);}
 }
 return <main className="min-h-screen bg-[#071520] text-white">
 <header className="border-b border-white/10 bg-[#0B2030]"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><a href="/"><Logo/></a><a className="flex gap-2 text-sm text-[#5BE7F2]" href="/atlas"><ArrowLeft size={17}/>Studio workspace</a></div></header>
 <div className="mx-auto max-w-6xl space-y-8 px-5 py-12">
  <section><p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.17em] text-[#5BE7F2]"><ShieldCheck size={16}/>Restricted administrator review</p><h1 className="font-display text-4xl font-bold">Studio ownership claims</h1><p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#A9C4CE]">Claiming a studio does not establish ownership. Inspect the evidence, independently verify the trading business and the applicant's authority, then make a recorded decision. Approval grants studio membership but does not publish a map location.</p></section>
  {notice?<p role="status" className="rounded-xl border border-[#5BE7F2]/40 bg-[#103946] p-4 text-sm">{notice}</p>:null}
  {error?<p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 text-sm text-rose-200">{error}</p>:null}
  <div className="grid gap-7 lg:grid-cols-[340px_1fr]">
   <section className="rounded-2xl border border-white/10 bg-[#0C2535] p-5">
    <div className="mb-5 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-bold"><ClipboardList size={19} className="text-[#5BE7F2]"/>Review queue</h2><button onClick={()=>void refresh()} className="rounded-lg border border-white/15 p-2" aria-label="Refresh claims"><RefreshCcw size={16}/></button></div>
    {loading?<p className="text-sm text-[#A5C3CD]">Loading requests…</p>:null}
    {!loading&&!claims.length?<p className="text-sm leading-relaxed text-[#A5C3CD]">No pending claims. New requests will appear here when received.</p>:null}
    <div className="space-y-2">{claims.map(c=><button key={c.id} onClick={()=>{setSelected(c);setError("");}} className={"w-full rounded-xl border p-4 text-left "+(selected?.id===c.id?"border-[#5BE7F2]/70 bg-[#154050]":"border-white/10 bg-[#112D3C]")}><p className="font-semibold">{c.proposed_studio_name}</p><p className="mt-1 text-xs text-[#9EBDCA]">{c.proposed_town} · {c.authority_role.replace(/_/g," ")}</p><p className="mt-2 text-[11px] uppercase tracking-wide text-[#5BE7F2]">{c.status.replace(/_/g," ")}</p></button>)}</div>
   </section>
   <section className="rounded-2xl border border-white/10 bg-[#0C2535] p-6 md:p-8">
    {!selected?<div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center"><Lock size={31} className="text-[#5BE7F2]"/><h2 className="text-xl font-bold">Select a claim to review</h2><p className="max-w-sm text-sm leading-relaxed text-[#A0BEC9]">Only authorised INKSIGHTS platform administrators can read evidence or record a decision.</p></div>:<>
     <h2 className="text-2xl font-bold">{selected.proposed_studio_name}</h2><p className="mt-2 text-sm text-[#9FBBC6]">{selected.proposed_town} · {selected.proposed_website||"No website supplied"}</p>
     <dl className="mt-6 grid gap-4 rounded-xl border border-white/10 bg-[#102D3C] p-5 text-sm md:grid-cols-2">
      <div><dt className="text-xs uppercase text-[#86A9B7]">Claimant role</dt><dd className="mt-1 capitalize">{selected.authority_role.replace(/_/g," ")}</dd></div>
      <div><dt className="text-xs uppercase text-[#86A9B7]">Suggested verification</dt><dd className="mt-1 capitalize">{selected.verification_method.replace(/_/g," ")}</dd></div>
      <div className="md:col-span-2"><dt className="text-xs uppercase text-[#86A9B7]">Evidence supplied</dt><dd className="mt-2 whitespace-pre-wrap leading-relaxed">{selected.evidence_note}</dd></div>
      <div className="md:col-span-2"><dt className="text-xs uppercase text-[#86A9B7]">Existing canonical studio ID</dt><dd className="mt-1 font-mono text-xs">{selected.studio_id||"Not yet linked"}</dd></div>
     </dl>
     <form key={selected.id} onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-xs font-semibold text-[#A8C6D1]">Decision<select name="decision" className={input+" mt-2"}><option value="needs_evidence">Request further evidence</option><option value="reject">Reject claim</option><option value="approve">Approve verified authority</option></select></label>
      <label className="block text-xs font-semibold text-[#A8C6D1]">Reviewer evidence record<textarea name="review_note" rows={4} minLength={30} maxLength={2000} required className={input+" mt-2"} placeholder="Record how the trading business and claimant authority were independently checked. Include dates, sources and uncertainties."/></label>
      <div className="grid gap-3 md:grid-cols-2">
       <label className="block text-xs text-[#A8C6D1]">Use existing canonical studio ID (optional)<input name="canonical_id" pattern="[0-9a-fA-F-]{36}" className={input+" mt-2"} placeholder="UUID or leave empty"/></label>
       <label className="block text-xs text-[#A8C6D1]">Use existing visibility studio ID (optional)<input name="visibility_id" pattern="[0-9a-fA-F-]{36}" className={input+" mt-2"} placeholder="UUID or leave empty"/></label>
      </div>
      <label className="flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs leading-relaxed text-[#D7CFB5]"><input name="authority_confirmed" type="checkbox" className="mt-0.5"/>I independently checked that this claimant is authorised to manage the named business. This is not the same as verifying a physical trading premise.</label>
      <button disabled={busy} className="w-full rounded-xl bg-[#5BE7F2] p-4 text-sm font-bold text-[#061923] disabled:opacity-50">{busy?"Saving…":"Record decision"}</button>
      <p className="flex gap-2 text-xs leading-relaxed text-[#87AAB7]"><BadgeCheck size={14} className="shrink-0"/>Approvals link records and assign account access atomically. The public listing requires a separate premises review.</p>
     </form>
    </>}
   </section>
  </div>
 </div></main>;
}
