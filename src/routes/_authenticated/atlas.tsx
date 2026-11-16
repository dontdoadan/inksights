import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { BadgeCheck, ClipboardCheck, Inbox, Link2, LockKeyhole, MapPin, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/public-site";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;
type Claim = { id: string; proposed_studio_name: string; proposed_town: string; status: string; created_at: string };
type Member = { studio_id: string; role: string };
type Studio = { id: string; name: string };
type Enquiry = { id: string; studio_id: string; customer_name: string; customer_email: string; tattoo_brief: string; status: string; created_at: string };
const field = "w-full rounded-xl border border-white/15 bg-[#102638] px-4 py-3 text-sm text-white outline-none focus:border-[#5BE7F2]";

export const Route = createFileRoute("/_authenticated/atlas")({
  ssr: false,
  component: OwnerAtlas,
  head: () => ({ meta: [{ title: "Studio Atlas workspace | INKSIGHTS" }, { name: "robots", content: "noindex,nofollow,noarchive" }] }),
});

function OwnerAtlas() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;
        const [{ data: claimRows, error: claimError }, { data: membershipRows, error: memberError }] = await Promise.all([
          db.from("atlas_claim_requests").select("id,proposed_studio_name,proposed_town,status,created_at").eq("user_id",user.user.id).order("created_at",{ascending:false}),
          supabase.from("studio_members").select("studio_id,role").eq("user_id",user.user.id).eq("active",true),
        ]);
        if (claimError || memberError) throw new Error("Could not load your studio access.");
        if (!active) return;
        setClaims((claimRows || []) as Claim[]);
        const memberships = (membershipRows || []) as Member[];
        if (!memberships.length) return;
        const visibilityIds = memberships.map(x=>x.studio_id);
        const { data: identityLinks, error: linkError } = await db.from("atlas_studio_links")
          .select("studio_id,visibility_studio_id").in("visibility_studio_id",visibilityIds);
        if (linkError) throw new Error("Could not validate linked studio identities.");
        const mappedMembers = (identityLinks || []).map((link: {studio_id: string; visibility_studio_id: string}) => ({
          studio_id: link.studio_id,
          role: memberships.find(member=>member.studio_id===link.visibility_studio_id)?.role || "viewer",
        })).filter((member: Member)=>member.role==="owner"||member.role==="admin");
        setMembers(mappedMembers);
        if (!mappedMembers.length) return;
        const ids = mappedMembers.map((member: Member)=>member.studio_id);
        const [{data:studioRows}, {data:enquiryRows,error:inboxError}] = await Promise.all([
          supabase.from("studios").select("id,name").in("id",ids),
          db.from("atlas_customer_enquiries").select("id,studio_id,customer_name,customer_email,tattoo_brief,status,created_at").in("studio_id",ids).order("created_at",{ascending:false}).limit(100),
        ]);
        if (inboxError) throw new Error("Could not load the enquiry inbox.");
        if (!active) return;
        setStudios((studioRows||[]) as Studio[]);
        setEnquiries((enquiryRows||[]) as Enquiry[]);
        setSelectedId(ids[0]);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Workspace could not load.");
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  async function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setStatus("");
    const form = new FormData(event.currentTarget);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || !selectedId) throw new Error("You must have verified studio access.");
      const styles = String(form.get("styles")||"").split(",").map(x=>x.trim()).filter(Boolean).slice(0,12);
      const { error: writeError } = await db.from("atlas_profile_drafts").insert({
        studio_id: selectedId, user_id:user.user.id,
        about: String(form.get("about")||"").trim().slice(0,2400),
        website_url: String(form.get("website_url")||"").trim() || null,
        instagram_url: String(form.get("instagram_url")||"").trim() || null,
        proposed_public_address: String(form.get("address")||"").trim() || null,
        styles, status:"pending_review"
      });
      if (writeError) throw new Error(writeError.message);
      setStatus("Changes submitted for review. Your live listing will not change until approved.");
      event.currentTarget.reset();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Your changes could not be submitted."); }
    finally {setBusy(false);}
  }

  const mine = enquiries.filter(x=>x.studio_id===selectedId);
  return <main className="min-h-screen bg-[#071520] text-white">
    <header className="border-b border-white/10 bg-[#0B2030]"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><a href="/"><Logo/></a><a className="text-sm font-semibold text-[#5BE7F2]" href="/studio-atlas">Public Atlas ↗</a></div></header>
    <div className="mx-auto max-w-6xl space-y-10 px-5 py-12">
      <section><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#5BE7F2]">INKSIGHTS / VERIFIED STUDIO WORKSPACE</p><h1 className="font-display text-4xl font-bold md:text-5xl">Manage your studio presence.</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#ADC7D1]">Your claim status, client enquiries and proposed public-profile updates live here. Ownership checks and changes to live listings are reviewed before approval.</p></section>
      {loading?<p className="text-sm text-[#ADC7D1]">Loading your studio access…</p>:null}
      {error?<p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 text-sm text-rose-200">{error}</p>:null}
      {status?<p role="status" className="rounded-xl border border-[#5BE7F2]/40 bg-[#124150] p-4 text-sm text-white">{status}</p>:null}
      <section><h2 className="mb-5 flex gap-3 text-2xl font-bold"><ClipboardCheck className="text-[#5BE7F2]"/>My claims</h2>
        {claims.length?<div className="grid gap-3 md:grid-cols-2">{claims.map(c=><div key={c.id} className="rounded-2xl border border-white/10 bg-[#0F2938] p-5"><div className="flex justify-between gap-3"><h3 className="font-semibold">{c.proposed_studio_name}</h3><span className="h-fit rounded-full border border-[#5BE7F2]/30 px-2 py-1 text-xs capitalize text-[#5BE7F2]">{c.status.replace("_"," ")}</span></div><p className="mt-2 text-xs text-[#95B1BC]"><MapPin size={13} className="mr-1 inline"/>{c.proposed_town} · Submitted {new Date(c.created_at).toLocaleDateString("en-GB")}</p></div>)}</div>:<p className="rounded-2xl border border-white/10 p-5 text-sm text-[#A9C3CE]">No claim requests yet. <a className="text-[#5BE7F2]" href="/studio-atlas">Claim or add your studio</a>.</p>}
      </section>
      <section className="rounded-3xl border border-white/10 bg-[#0C2231] p-6 md:p-8"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h2 className="flex items-center gap-3 text-2xl font-bold"><BadgeCheck className="text-[#5BE7F2]"/>Verified studio access</h2><p className="mt-2 text-sm text-[#9DBAC7]">Only approved studio members can submit listing changes or view their own enquiries.</p></div><span className="rounded-full border border-[#5BE7F2]/30 px-4 py-2 text-xs text-[#5BE7F2]">{members.length} active membership(s)</span></div>
        {!members.length?<div className="mt-6 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-[#D6C7A4]"><LockKeyhole className="shrink-0"/>Your studio management tools unlock after your authority is approved. Pending claims do not grant editing access.</div>:<>
          <label className="mt-7 block text-sm text-[#B5D2DA]">Studio to manage<select className={field+" mt-2"} value={selectedId} onChange={e=>setSelectedId(e.target.value)}>{members.map(m=><option value={m.studio_id} key={m.studio_id}>{studios.find(x=>x.id===m.studio_id)?.name||m.studio_id} · {m.role}</option>)}</select></label>
          <div className="mt-9 grid gap-8 lg:grid-cols-2"><div><h3 className="mb-4 flex items-center gap-2 font-bold"><Inbox size={18} className="text-[#5BE7F2]"/>Client enquiries ({mine.length})</h3>{mine.length?<div className="space-y-3">{mine.map(e=><article key={e.id} className="rounded-xl border border-white/10 bg-[#102B3A] p-4"><div className="flex justify-between gap-3"><strong>{e.customer_name}</strong><span className="text-xs text-[#8EB4C3]">{new Date(e.created_at).toLocaleDateString("en-GB")}</span></div><p className="mt-1 text-sm text-[#5BE7F2]">{e.customer_email}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#C4D9E1]">{e.tattoo_brief}</p><p className="mt-3 text-xs uppercase tracking-wide text-[#7FA5B3]">Status: {e.status}</p></article>)}</div>:<p className="rounded-xl border border-white/10 p-5 text-sm text-[#9EBCC8]">No enquiries received through Studio Atlas yet.</p>}</div>
          <div><h3 className="mb-4 flex items-center gap-2 font-bold"><Link2 size={18} className="text-[#5BE7F2]"/>Propose a profile update</h3><form className="grid gap-3" onSubmit={submitDraft}><textarea className={field} rows={5} maxLength={2400} name="about" aria-label="Studio description" placeholder="Tell customers about your studio, artists and approach"/><input className={field} type="url" name="website_url" aria-label="Studio website" placeholder="https://studio.co.uk"/><input className={field} type="url" name="instagram_url" aria-label="Instagram URL" placeholder="https://instagram.com/yourstudio"/><input className={field} name="styles" aria-label="Tattoo styles" placeholder="Styles, separated by commas"/><input className={field} name="address" aria-label="Trading address" placeholder="Trading address for review"/><button disabled={busy} className="rounded-xl bg-[#5BE7F2] p-4 text-sm font-bold text-[#061924] disabled:opacity-50">{busy?"Submitting…":"Send changes for review"}</button></form><p className="mt-3 flex gap-2 text-xs leading-relaxed text-[#87A8B5]"><ShieldCheck size={14} className="shrink-0"/>Live profiles are only published by the review team. This form does not change verified locations automatically.</p></div></div>
        </>}
      </section>
    </div>
  </main>;
}
