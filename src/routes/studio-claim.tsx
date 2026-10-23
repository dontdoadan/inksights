import { createFileRoute } from "@tanstack/react-router";
import { useEffect,useState,type FormEvent } from "react";
import { ShieldCheck,FileCheck2,LockKeyhole } from "lucide-react";
import { Card,PageHero,PublicShell } from "@/components/public-site";
import { supabase } from "@/integrations/supabase/client";
type PublicStudio={id:string;name:string;area:string};
export const Route=createFileRoute("/studio-claim")({
  ssr:false,
  validateSearch:(search:Record<string,unknown>)=>({
    studio:typeof search.studio==="string"?search.studio:"",
  }),
  component:ClaimPage,
  head:()=>({meta:[{title:"Claim Your Tattoo Studio Profile for Free | INKSIGHTS"},
    {name:"robots",content:"noindex,nofollow"}]}),
});
function ClaimPage(){
  const {studio:studioId}=Route.useSearch();
  const [studio,setStudio]=useState<PublicStudio|null>(null);
  const [signedIn,setSignedIn]=useState(false);
  const [name,setName]=useState("");
  const [role,setRole]=useState<"owner"|"authorised_manager">("owner");
  const [summary,setSummary]=useState("");
  const [proofUrl,setProofUrl]=useState("");
  const [consent,setConsent]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [done,setDone]=useState("");
  useEffect(()=>{
    let active=true;
    void supabase.auth.getUser().then(({data})=>{if(active)setSignedIn(Boolean(data.user?.email_confirmed_at))}).catch(()=>{});
    void fetch("/api/public/studio-directory").then(r=>r.json()).then(data=>{
      if(active)setStudio((data.studios as PublicStudio[]).find(x=>x.id===studioId)??null);
    }).catch(()=>{});
    return()=>{active=false};
  },[studioId]);
  const loginNext=`/studio-claim?studio=${encodeURIComponent(studioId)}`;
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setError("");setDone("");
    try{
      const {data:{session},error:sErr}=await supabase.auth.getSession();
      if(sErr||!session?.access_token)throw new Error("Please sign in first.");
      const resp=await fetch("/api/public/studio-claim",{
        method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${session.access_token}`},
        body:JSON.stringify({candidateId:studioId,claimantName:name,claimantRole:role,
          evidenceSummary:summary,evidenceUrl:proofUrl,consent}),
      });
      const data=await resp.json() as {error?:string;ok?:boolean;claimId?:string;status?:string};
      if(!resp.ok||!data.ok)throw new Error(data.error||"Your request could not be saved.");
      setDone("Your claim has been received for evidence review. It does not grant access yet. Verification is free; INKSIGHTS will check your proof before changing profile ownership.");
    }catch(err){setError(err instanceof Error?err.message:"Claim could not be submitted.")}finally{setBusy(false)}
  }
  return <PublicShell>
    <PageHero eyebrow="Free business-owner verification" title={<>Claim your studio. <span className="text-mint">Prove control.</span></>}
      description="Request management of a publicly observed studio listing. Verification is always free and is based on evidence, not a paid plan. An account or website link alone does not establish ownership."/>
    <section className="border-y border-border bg-ink-deep px-6 py-14"><div className="mx-auto max-w-3xl space-y-5">
      <Card className="bg-ink p-6">
        <div className="flex items-start gap-4"><ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-mint"/>
          <div><h2 className="font-display text-xl font-black text-ice">{studio?.name||"Studio identification required"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{studio?.area||"Use the UK Studio Map to select a published studio."}</p></div></div>
      </Card>
      {!signedIn ? <Card className="bg-ink p-6">
        <h2 className="font-display text-xl font-black text-ice">Verify your account email first</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Sign in or create an account. We will then review proof that you own or are authorised to manage the selected studio.</p>
        <a className="mt-5 inline-flex rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep" href={`/auth?next=${encodeURIComponent(loginNext)}`}>Sign in to continue</a>
      </Card> : <form onSubmit={submit}><Card className="bg-ink p-6 md:p-8">
        <h2 className="font-display text-xl font-black text-ice">Submit your free verification request</h2>
        <div className="mt-6 space-y-5">
          <div><label htmlFor="claim-name" className="text-sm font-semibold text-ice">Your name</label>
            <input required id="claim-name" minLength={2} maxLength={160} value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-ink-deep p-3 text-ice"/></div>
          <div><label htmlFor="claim-role" className="text-sm font-semibold text-ice">Your relationship to the studio</label>
            <select id="claim-role" value={role} onChange={e=>setRole(e.target.value as typeof role)} className="mt-2 w-full rounded-xl border border-border bg-ink-deep p-3 text-ice">
              <option value="owner">Owner</option><option value="authorised_manager">Authorised manager</option></select></div>
          <div><label htmlFor="claim-proof" className="text-sm font-semibold text-ice">Evidence of ownership or authorisation</label>
            <textarea id="claim-proof" required rows={4} minLength={15} maxLength={1600} value={summary} onChange={e=>setSummary(e.target.value)}
              placeholder="Describe how we can confirm your role via the studio's official website, business email/domain or a current authorised representative."
              className="mt-2 w-full rounded-xl border border-border bg-ink-deep p-3 text-ice"/>
            <p className="mt-1 text-xs text-muted-foreground">Do not enter passwords, identity documents or confidential information here.</p></div>
          <div><label htmlFor="claim-url" className="text-sm font-semibold text-ice">Public evidence link (optional)</label>
            <input id="claim-url" type="url" maxLength={500} value={proofUrl} onChange={e=>setProofUrl(e.target.value)}
              placeholder="https://studio-website.co.uk/about" className="mt-2 w-full rounded-xl border border-border bg-ink-deep p-3 text-ice"/></div>
          <label className="flex gap-3 text-sm text-muted-foreground"><input required type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1 accent-[#00E5D1]"/>
            <span>I agree to store my claim details for verification according to the <a href="/privacy" className="text-mint underline">privacy policy</a>. This is not marketing consent.</span></label>
        </div>
        {error&&<p role="alert" className="mt-4 rounded-xl border border-rose-700/50 p-4 text-sm text-rose-200">{error}</p>}
        {done&&<p role="status" className="mt-4 rounded-xl border border-mint/30 p-4 text-sm text-mint">{done}</p>}
        <button type="submit" disabled={busy||!studio||!!done} className="mt-6 rounded-full bg-mint px-6 py-3 font-bold text-ink-deep disabled:opacity-50">
          {busy?"Submitting…":"Request free verification"}</button>
      </Card></form>}
      <Card className="bg-ink p-6"><div className="flex items-start gap-3"><LockKeyhole className="h-6 w-6 shrink-0 text-mint"/>
        <div><h3 className="font-bold text-ice">Your studio stays protected</h3>
          <p className="mt-2 text-sm text-muted-foreground">A submitted claim does not enable editing, access to private audits or a verification badge. Approval requires independent evidence review and can be withdrawn if ownership changes.</p></div></div></Card>
    </div></section>
  </PublicShell>;
}
