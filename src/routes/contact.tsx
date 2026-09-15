import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Mail, MessageSquareText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PageHero, PublicShell } from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/contact";
const CANONICAL_ORIGIN = "https://getinksights.co.uk";
const CONTACT_INTAKE_URL = "https://ukaxsqwnkoqbbsufpzga.supabase.co/functions/v1/public-contact-intake";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact INKSIGHTS" },
      { name: "description", content: "Contact INKSIGHTS about tattoo studio growth, existing-client support, billing, cancellations, partnerships or website support." },
      { property: "og:title", content: "Contact INKSIGHTS" },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
  server: {
    handlers: {
      POST: async ({ request }) => {
        const requestOrigin = new URL(request.url).origin;
        const suppliedOrigin = request.headers.get("origin");
        if (suppliedOrigin && suppliedOrigin !== requestOrigin) {
          return json({ ok: false, error: "Origin not allowed." }, 403);
        }

        const contentType = request.headers.get("content-type") || "";
        if (!contentType.toLowerCase().includes("application/json")) {
          return json({ ok: false, error: "Content-Type must be application/json." }, 415);
        }

        const contentLength = Number(request.headers.get("content-length") || 0);
        if (contentLength > 32768) {
          return json({ ok: false, error: "Request too large." }, 413);
        }

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ ok: false, error: "Invalid request." }, 400);
        }

        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
          return json({ ok: false, error: "Invalid request." }, 400);
        }

        try {
          const forwardedFor = request.headers.get("x-forwarded-for");
          const userAgent = request.headers.get("user-agent");
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Origin: CANONICAL_ORIGIN,
          };
          if (forwardedFor) headers["X-Forwarded-For"] = forwardedFor;
          if (userAgent) headers["User-Agent"] = userAgent;

          const response = await fetch(CONTACT_INTAKE_URL, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          });
          const data = await response.json().catch(() => null);

          if (!response.ok || !data || typeof data !== "object") {
            console.error("Contact intake proxy failed", { status: response.status });
            return json({ ok: false, error: "The message could not be recorded right now. Please try again." }, 503);
          }

          return json(data, response.status);
        } catch (proxyError) {
          console.error(
            "Contact intake proxy failed",
            proxyError instanceof Error ? proxyError.message : String(proxyError),
          );
          return json({ ok: false, error: "The message could not be recorded right now. Please try again." }, 503);
        }
      },
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    const form = new FormData(event.currentTarget);

    let data: { ok?: boolean; error?: string } | null = null;
    try {
      const response = await fetch("/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") || ""),
          email: String(form.get("email") || ""),
          studio_name: String(form.get("studio_name") || ""),
          topic: String(form.get("topic") || ""),
          message: String(form.get("message") || ""),
          consent: form.get("consent") === "on",
          company_url: String(form.get("company_url") || ""),
          page_path: window.location.pathname,
          referrer: document.referrer || null,
        }),
      });
      data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || `Contact service returned ${response.status}.`);
      }
    } catch (submitError) {
      setStatus("error");
      setError(submitError instanceof Error ? submitError.message : "The message could not be recorded. Email dontdoadan@icloud.com instead.");
      return;
    }

    setStatus("done");
  }

  return (
    <PublicShell>
      <PageHero
        eyebrow="Contact INKSIGHTS"
        title={<>Ask a specific question or start with the diagnosis.</>}
        description={<>Use the form for existing-client support, billing or cancellation questions, offer scope, partnerships, technical issues or general enquiries. Studio owners seeking a recommendation should normally start with the free Revenue Audit.</>}
      />

      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[.8fr_1.2fr] md:py-24">
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-ink p-6">
              <Mail className="h-7 w-7 text-mint" />
              <h2 className="mt-5 font-display text-2xl font-black text-ice">Direct email</h2>
              <a href="mailto:dontdoadan@icloud.com" className="mt-3 inline-block font-bold text-mint hover:text-mint-soft">dontdoadan@icloud.com</a>
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
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The Revenue Audit collects enough commercial context to recommend a useful route rather than beginning with an unstructured sales message.</p>
              <a href="/studio-growth-check" className="mt-5 inline-flex rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep">Start the free Revenue Audit</a>
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
                <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">INKSIGHTS will review the message and reply using the email provided. No payment or booking has been created.</p>
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
                      <option value="growth-check">Revenue Audit or recommendation</option>
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
                  <span>I agree that INKSIGHTS may store and use these details to respond to this enquiry. <span className="text-mint">Required.</span></span>
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