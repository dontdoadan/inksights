import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Search, MapPin, Instagram, Globe2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { PublicShell, PageHero } from "@/components/public-site";

const REPORT_FUNCTION = "https://ukaxsqwnkoqbbsufpzga.supabase.co/functions/v1/studio-visibility-report-v2";

export const Route = createFileRoute("/studio-intelligence-check")({
  component: StudioIntelligenceCheck,
  head: () => ({
    meta: [
      { title: "Free Studio Intelligence Snapshot | INKSIGHT" },
      { name: "description", content: "A source-led introduction to the INKSIGHTS studio intelligence report." },
    ],
    links: [{ rel: "canonical", href: "https://getinksight.co.uk/studio-intelligence-check" }],
  }),
});

function StudioIntelligenceCheck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    const split = (name: string) => String(form.get(name) || "").split(/[,\n]/).map((v) => v.trim()).filter(Boolean).slice(0, 12);
    const payload = {
      studio_name: String(form.get("studio_name") || ""),
      contact_name: String(form.get("contact_name") || ""),
      email: String(form.get("email") || ""),
      website: String(form.get("website") || ""),
      google_url: String(form.get("google_url") || ""),
      social_urls: split("social_urls"),
      area: String(form.get("area") || ""),
      artist_count: Number(form.get("artist_count") || 0),
      services: split("services"),
      styles: split("styles"),
      body_areas: split("body_areas"),
      website_honeypot: String(form.get("website_honeypot") || ""),
    };
    try {
      const response = await fetch(REPORT_FUNCTION, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { ok?: boolean; reportUrl?: string; error?: string };
      if (!response.ok || !data.ok || !data.reportUrl) throw new Error(data.error || "The snapshot could not be generated.");
      window.location.assign(data.reportUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The snapshot could not be generated.");
      setLoading(false);
    }
  }

  return <PublicShell>
    <PageHero
      eyebrow="Free · INKSIGHTS Studio Intelligence Snapshot"
      title={<>See what your studio can verify — before we show you the full intelligence report.</>}
      description={<>Give INKSIGHTS the studio's public footprint. We will inspect the supplied website, use the supplied Google and social references as source inputs, build a studio-specific search universe and measure live search evidence where a configured search provider is available.</>}
    />
    <main className="bg-ink">
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="rounded-3xl border border-border bg-ink-deep p-7 md:p-9">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Studio name" name="studio_name" required />
            <Field label="Your name" name="contact_name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Website" name="website" placeholder="https://yourstudio.co.uk" required />
            <Field label="Town / city" name="area" required />
            <Field label="Artists" name="artist_count" type="number" min="1" max="100" placeholder="e.g. 5" required />
            <Field label="Google / Maps profile" name="google_url" placeholder="Paste Google / Maps URL" />
            <Field label="Social profile(s)" name="social_urls" placeholder="Instagram, Facebook, etc." />
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <TagField label="Main services" name="services" placeholder="tattooing, piercing, removal" />
            <TagField label="Main styles" name="styles" placeholder="black & grey, realism, fine line" />
            <TagField label="Body areas" name="body_areas" placeholder="sleeve, back, leg" />
            <div className="rounded-2xl border border-mint/20 bg-mint/5 p-5 text-sm leading-relaxed text-muted-foreground"><b className="text-ice">Why these inputs?</b><br/>They narrow the search universe to what the studio actually sells. The system can then test those commercial searches against real search data instead of inventing demand.</div>
          </div>
          <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"><input name="website_honeypot" tabIndex={-1} autoComplete="off" /></div>
          <label className="mt-7 flex gap-3 text-sm text-muted-foreground"><input type="checkbox" required className="mt-1" /><span>I agree to INKSIGHTS using these details and public business sources to generate the snapshot and contact me about the result.</span></label>
          <button disabled={loading} type="submit" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-mint px-7 py-3 font-bold text-ink-deep disabled:opacity-60">{loading ? "Auditing public data…" : "Run My Studio Snapshot"}<ArrowRight className="h-4 w-4" /></button>
          {error && <p className="mt-4 text-sm font-semibold text-red-300">{error}</p>}
        </form>
        <aside className="h-max rounded-3xl border border-border bg-ink-deep p-7 lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">The acquisition asset</p>
          <h2 className="mt-2 font-display text-2xl font-black text-ice">A useful result, not a teaser full of invented numbers.</h2>
          <div className="mt-6 space-y-5 text-sm text-muted-foreground">
            <Feature icon={<Globe2 />} title="Website evidence" text="HTTP, title, description, H1s, canonical, robots and sitemap checks." />
            <Feature icon={<Search />} title="Search evidence" text="A studio-specific search universe, measured demand and observed organic positions when provider data is available." />
            <Feature icon={<MapPin />} title="Local market" text="Location-aware commercial searches and local-search evidence." />
            <Feature icon={<Instagram />} title="Public footprint" text="Google and social references are retained as submitted sources and verified only when the system can actually inspect them." />
          </div>
          <div className="mt-7 rounded-2xl border border-border bg-ink p-5 text-xs leading-relaxed text-muted-foreground"><b className="text-ice">Evidence rule:</b> every material number in the snapshot is either source-measured, studio-submitted, or explicitly modelled. If the system cannot substantiate a number, it does not present it as fact.</div>
        </aside>
      </section>
    </main>
  </PublicShell>;
}

function Field({ label, name, type = "text", placeholder, required, min, max }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; min?: string; max?: string }) {
  return <label className="block text-sm font-semibold text-ice">{label}{required ? " *" : ""}<input name={name} type={type} min={min} max={max} placeholder={placeholder} required={required} className="mt-2 w-full rounded-xl border border-border bg-ink px-4 py-3 font-normal text-ice outline-none focus:border-mint" /></label>;
}
function TagField({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return <label className="block text-sm font-semibold text-ice">{label}<span className="font-normal text-muted-foreground"> (comma separated)</span><textarea name={name} rows={3} placeholder={placeholder} className="mt-2 w-full resize-none rounded-xl border border-border bg-ink px-4 py-3 font-normal text-ice outline-none focus:border-mint" /></label>;
}
function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="flex gap-3"><span className="mt-0.5 text-mint">{icon}</span><div><p className="font-semibold text-ice">{title}</p><p className="mt-1 leading-relaxed">{text}</p></div></div>;
}
