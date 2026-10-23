import {createFileRoute} from "@tanstack/react-router";
import {useEffect,useState,type FormEvent} from "react";
import {CheckCircle2,LockKeyhole,Save} from "lucide-react";
import {Card,PageHero,PublicShell} from "@/components/public-site";
import {supabase} from "@/integrations/supabase/client";
type Profile={summary:string;specialisms:string[];bookingUrl:string;updatedAt:string|null};
type Response={ok?:boolean;error?:string;studio?:{id:string;name:string};profile?:Profile};
export const Route=createFileRoute("/my-studio-profile")({
  ssr:false,
  validateSearch:(s:Record<string,unknown>)=>({studio:typeof s.studio==="string"?s.studio:""}),
  component:StudioProfilePage,
  head:()=>({meta:[{title:"Manage Verified Studio Profile | INKSIGHTS"},{name:"robots",content:"noindex,nofollow,noarchive"}]}),
});
function StudioProfilePage(){
  const {studio:id}=Route.useSearch();
  const [name,setName]=useState("");
  const [summary,setSummary]=useState("");
  const [specialisms,setSpecialisms]=useState("");
  const [bookingUrl,setBookingUrl]=useState("");
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState<"loading"|"ready"|"error">("loading");
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  useEffect(()=>{
    let mounted=true;
    async function load(){
      try{
        const {data:{session}}=await supabase.auth.getSession();
        if(!session?.access_token)throw new Error("Please sign in using your verified studio account.");
        const resp=await fetch("/api/studio-profile?studio="+encodeURIComponent(id),{
          headers:{authorization:`Bearer ${session.access_token}`},
        });
        const data=await resp.json() as Response;
        if(!resp.ok||!data.ok||!data.profile||!data.studio)throw new Error(data.error||"Profile unavailable.");
        if(!mounted)return;
        setName(data.studio.name);
        setSummary(data.profile.summary);
        setSpecialisms(data.profile.specialisms.join(", "));
        setBookingUrl(data.profile.bookingUrl);
        setStatus("ready");
      }catch(err){if(mounted){setStatus("error");setError(err instanceof Error?err.message:"Unable to load profile.")}}
    }
    void load();return()=>{mounted=false};
  },[id]);
  async function save(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage("");setError("");
    try{
      const {data:{session}}=await supabase.auth.getSession();
      if(!session?.access_token)throw new Error("Please sign in.");
      const skills=specialisms.split(",").map(x=>x.trim()).filter(Boolean);
      const resp=await fetch("/api/studio-profile",{
        method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${session.access_token}`},
        body:JSON.stringify({candidateId:id,summary,specialisms:skills,bookingUrl}),
      });
      const data=await resp.json() as Response;
      if(!resp.ok||!data.ok)throw new Error(data.error||"Could not save profile.");
      setMessage("Your updated public profile information has been saved with a revision record.");
    }catch(err){setError(err instanceof Error?err.message:"Unable to save.")}finally{setBusy(false)}
  }
  return <PublicShell>
    <PageHero eyebrow="INKSIGHTS · Verified studio workspace"
      title={<>Manage your <span className="text-mint">studio profile.</span></>}
      description="Edit your public description, specialisms and booking link after independent ownership verification. No subscription or payment is required for verification."/>
    <section className="border-y border-border bg-ink-deep px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {status==="loading"&&<p className="text-sm text-muted-foreground">Checking verified studio access…</p>}
        {status==="error"&&<Card className="bg-ink p-6"><div className="flex items-start gap-3"><LockKeyhole className="h-6 w-6 text-mint"/><div><h2 className="font-bold text-ice">Access restricted</h2><p role="alert" className="mt-3 text-sm text-muted-foreground">{error}</p>
          <a className="mt-3 inline-block text-sm font-semibold text-mint underline" href="/uk-studio-map">Return to directory</a></div></div></Card>}
        {status==="ready"&&<form onSubmit={save}><Card className="bg-ink p-6 md:p-8">
          <div className="flex items-center gap-3"><CheckCircle2 className="h-6 w-6 text-mint"/><h2 className="font-display text-xl font-black text-ice">{name}</h2></div>
          <p className="mt-3 text-sm text-muted-foreground">Only non-identity fields are editable. Name, address, verification status, ownership and map coordinates require review.</p>
          <div className="mt-7 space-y-5">
            <div><label htmlFor="profile-description" className="text-sm font-semibold text-ice">Studio description</label>
              <textarea id="profile-description" value={summary} rows={5} maxLength={1200}
                onChange={e=>setSummary(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-ink-deep p-4 text-ice"/>
              <p className="mt-1 text-xs text-muted-foreground">{summary.length}/1200 characters</p></div>
            <div><label htmlFor="profile-specialisms" className="text-sm font-semibold text-ice">Tattoo specialisms (comma-separated, up to 12)</label>
              <input id="profile-specialisms" value={specialisms} onChange={e=>setSpecialisms(e.target.value)}
                placeholder="Black & grey, Japanese, Realism" className="mt-2 w-full rounded-xl border border-border bg-ink-deep p-3 text-ice"/></div>
            <div><label htmlFor="profile-booking" className="text-sm font-semibold text-ice">HTTPS booking or enquiry URL</label>
              <input id="profile-booking" type="url" value={bookingUrl} onChange={e=>setBookingUrl(e.target.value)}
                placeholder="https://yourstudio.co.uk/book" className="mt-2 w-full rounded-xl border border-border bg-ink-deep p-3 text-ice"/></div>
          </div>
          {error&&<p role="alert" className="mt-4 rounded-xl border border-rose-600/40 p-3 text-sm text-rose-200">{error}</p>}
          {message&&<p role="status" className="mt-4 rounded-xl border border-mint/40 p-3 text-sm text-mint">{message}</p>}
          <button disabled={busy} type="submit" className="mt-7 inline-flex items-center gap-2 rounded-full bg-mint px-6 py-3 font-bold text-ink-deep disabled:opacity-50">
            <Save className="h-4 w-4"/>{busy?"Saving…":"Save profile"}</button>
        </Card></form>}
      </div>
    </section>
  </PublicShell>;
}
