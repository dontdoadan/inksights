import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Mail, MessageSquareText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PageHero, PublicShell } from "@/components/public-site";
import { supabase } from "@/integrations/supabase/client";

const CANONICAL_URL = "https://getinksight.co.uk/contact";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact INKSIGHT" },
      { name: "description", content: "Contact INKSIGHT about tattoo studio growth, existing-client support, billing, cancellations, partnerships or website support." },
      { property: "og:title", content: "Contact INKSIGHT" },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    const form = new FormData(event.currentTarget);
    const { data, error: functionError } = await supabase.functions.invoke("public-contact-intake", {
      body: {
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        studio_name: String(form.get("studio_name") || ""),
        topic: String(form.get("topic") || ""),
        message: String(form.get("message") || ""),
        consent: form.get("consent") === "on",
        company_url: String(form.get("company_url") || ""),
        page_path: window.location.pathname,
        referrer: document.referrer || null,
      },
    });

    if (functionError || !data?.ok) {
      setStatus("error");
      setError(functionError?.message || data?.error || "The message could not be recorded. Email contact@getinksight.co.uk instead.");
      return;
    }
    setStatus("done");
  }

  return (
    <PublicShell>
      <PageHero
        eyebrow="Contact INKSIGHT"
        title={<>Ask a specific question or start with the diagnosis.</>}
        description={<>Use the form for existing-client support, billing or cancellation questions, offer scope, partnerships, technical issues or general enquiries. Studio owners seeking a recommendation should normally complete the free Growth Check first.</>}
      />

      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[.8fr_1.2fr] md:py-24">
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-ink p-6">
              <Mail className="h-7 w-7 text-mint" />
              <h2 className="mt-5 font-display text-2xl font-black text-ice">Direct email</h2>
              <a href="mailto:contact@getinksight.co.uk" className="mt-3 inline-block font-bold text-mint hover:text-mint-soft">contact@getinksight.co.uk</a>
            </div>
            <div className="rounded-2xl border border-border bg-ink p-6">
              <MessageSquareText className="h-7 w-7 text-mint" />
              <h2 className="mt-5 font-display text-2xl font-black text-ice">Customer support</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Existing clients can review billing, cancellation, delivery and technical support guidance before submitting a message.</p>
              <a href="/support" className="mt-5 inline-flex rounded-full border border-mint px-5 py-3 text-sm font-bold text-mint">Open customer support</a>
            </div>
            <div className="rounded-2xl border border-border bg-ink p-6">
              <MessageSquareText className="h-7 w-7 text-mint" />
              <h2 className="mt-5 font-display text-2xl font-black text-ice">Studio recommendation</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The Growth Check collects enough commercial context to recommend a useful route rather than beginning with an unstructured sales message.</p>
              <a href="/studio-growth-check" className="mt-5 inline-flex rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep">Start the free check</a>
            </div>
            <div className="rounded-2xl border border-border bg-ink p-6">
              <ShieldCheck className="h-7 w-7 text-mint" />
              <h2 className="mt-5 font-display text-2xl font-black text-ice">Privacy</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Messages are stored securely for response and operational follow-up. They are not sold to advertisers.</p>
              <a href="/privacy" className="mt-4 inline-block text-sm font-bold text-mint">Read the privacy notice</a>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-ink p-6 md:p-9">
            {status === "done" ? (
              <div className="flex min-h-[480px] flex-col justify-center">
                <CheckCircle2 className="h-12 w-12 text-mint" />
                <h2 className="mt-6 font-display text-4xl font-black text-ice">Message recorded.</h2>
                <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">INKSIGHT will review the message and reply using the email provided. No payment or booking has been created.</p>
                <div className="mt-7"><a href="/resources" className="inline-flex rounded-full border border-mint px-5 py-3 font-bold text-mint">Browse resources</a></div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Secure contact form</p>
                  <h2 className="mt-2 font-display text-3xl font-black text-ice">What do you need help with?</h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name" required><input name="name" required autoComplete="name" className="form-control" /></Field>
                  <Field label="Email" required><input name="email" type="email" required autoComplete="email" className="form-control" /></Field>
                  <Field label="Studio name"><input name="studio_name" autoComplete="organization" className="form-control" /></Field>
                  <Field label="Topic" required>
                    <select name="topic" required className="form-control">
                      <option value="">Select a topic</option>
                      <option value="existing-client-support">Existing client support</option>
                      <option value="billing-cancellation">Billing, subscription or cancellation</option>
                      <option value="72-hour-visibility-fix">72-Hour Visibility Fix</option>
                      <option value="growth-check">Growth Check or recommendation</option>
                      <option value="partnership">Partnership or case study</option>
                      <option value="website-support">Website or technical issue</option>
                      <option value="privacy-data-request">Privacy or data request</option>
                      <option value="media">Media or research</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                </div>
                <Field label="Message" required>
                  <textarea name="message" required minLength={10} rows={7} className="form-control resize-y" placeholder="Include the studio, relevant links or references, what happened and the outcome you need. Do not include passwords, full card details, private API keys or verification codes." />
                </Field>
                <div className="hidden" aria-hidden="true">
                  <label>Company URL<input name="company_url" tabIndex={-1} autoComplete="off" /></label>
                </div>
                <label className="flex items-start gap-3 rounded-xl border border-border bg-ink-deep p-4 text-sm leading-relaxed text-muted-foreground">
                  <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-[var(--mint)]" />
                  <span>I agree that INKSIGHT may store and use these details to respond to this enquiry. <span className="text-mint">Required.</span></span>
                </label>
                {error ? <p role="alert" className="rounded-xl border border-red-400/35 bg-red-400/10 p-4 text-sm text-red-200">{error}</p> : null}
                <button type="submit" disabled={status === "sending"} className="rounded-full bg-mint px-6 py-3.5 font-bold text-ink-deep hover:bg-mint-soft disabled:opacity-60">
                  {status === "sending" ? "Recording message…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-ice">{label}{required ? <span className="text-mint"> *</span> : null}</span>
      {children}
    </label>
  );
}
