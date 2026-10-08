/* eslint-disable @typescript-eslint/no-explicit-any -- public RPCs precede generated Supabase type refresh */
import { CheckCircle2, Clock3, Loader2, ShieldCheck, TicketCheck, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { PageHero, PublicShell } from "@/components/public-site";
import { supabase } from "@/integrations/supabase/client";
import { formatMinorGbp, sha256Hex } from "@/lib/founding-studio";

const db = supabase as any;

type InviteView = {
  studio_name: string;
  contact_name: string;
  email_hint: string;
  invite_status: string;
  list_value_minor: number;
  waiver_amount_minor: number;
  amount_due_minor: number;
  expires_at: string;
  can_checkout: boolean;
};

type CompletionView = {
  studio_name: string;
  contact_name: string;
  invite_status: string;
  onboarding_status: string;
  audit_id: string | null;
  website: string | null;
};

export function FoundingStudioInviteExperience({ token }: { token: string }) {
  const [invite, setInvite] = useState<InviteView | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        if (!/^[0-9a-f]{64}$/i.test(token)) throw new Error("This private invitation link is invalid.");
        const tokenHash = await sha256Hex(token.toLowerCase());
        const { data, error } = await db.rpc("resolve_founding_studio_invite", { p_token_hash: tokenHash });
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) throw new Error("This invitation could not be found.");
        if (active) setInvite(row as InviteView);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "This invitation is unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [token]);

  async function continueToCheckout() {
    if (!invite?.can_checkout) return;
    setStarting(true);
    setMessage("");
    try {
      const tokenHash = await sha256Hex(token.toLowerCase());
      const { data, error } = await db.rpc("begin_founding_studio_checkout", { p_token_hash: tokenHash });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.checkout_url) throw new Error("Secure checkout could not be started.");

      const checkout = new URL(String(row.checkout_url));
      if (row.checkout_email) checkout.searchParams.set("prefilled_email", String(row.checkout_email));
      window.location.assign(checkout.toString());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Secure checkout could not be started.");
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <PublicShell>
        <CenteredState icon={<Loader2 className="h-6 w-6 animate-spin text-mint" />} title="Checking your private invitation…" />
      </PublicShell>
    );
  }

  if (!invite) {
    return (
      <PublicShell>
        <CenteredState
          icon={<TriangleAlert className="h-6 w-6 text-amber-200" />}
          title="This invitation is unavailable."
          description={message || "Ask INKSIGHTS for a new private invitation if you believe this is an error."}
        />
      </PublicShell>
    );
  }

  const unavailable = !invite.can_checkout;
  const statusText =
    invite.invite_status === "completed"
      ? "This invitation has already been used."
      : invite.invite_status === "expired"
        ? "This invitation has expired."
        : invite.invite_status === "revoked"
          ? "This invitation has been revoked."
          : invite.invite_status === "failed"
            ? "This invitation can no longer be used."
            : "";

  return (
    <PublicShell>
      <meta name="robots" content="noindex,nofollow,noarchive" />
      <PageHero
        eyebrow="Private Founding Studio invitation"
        title="INKSIGHTS Studio Intelligence Audit"
        description={`A founder-authorised invitation for ${invite.studio_name}. The standard £395 Audit fee has been fully waived for this engagement.`}
      >
        <button
          type="button"
          disabled={starting || unavailable}
          onClick={() => void continueToCheckout()}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-mint px-6 py-3 text-sm font-bold text-ink-deep transition hover:bg-mint-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <TicketCheck className="h-4 w-4" />}
          {unavailable ? "Invitation unavailable" : "Accept invitation & continue"}
        </button>
      </PageHero>

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
          <div className="grid gap-5 md:grid-cols-3">
            <ValueCard label="Studio Intelligence Audit" value={formatMinorGbp(invite.list_value_minor)} />
            <ValueCard label="Founding Studio Waiver" value={`−${formatMinorGbp(invite.waiver_amount_minor)}`} emphasis />
            <ValueCard label="Due today" value={formatMinorGbp(invite.amount_due_minor)} emphasis />
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-ink-deep p-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-mint">
                <ShieldCheck className="h-4 w-4" /> Authorised recipient
              </div>
              <p className="mt-4 font-display text-xl font-black text-ice">{invite.studio_name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{invite.contact_name} · {invite.email_hint}</p>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Stripe will ask you to confirm the studio name, your name, the invited email address and your studio website or booking link. No card is required because the fee has been fully waived.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-ink-deep p-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-mint">
                <Clock3 className="h-4 w-4" /> Invitation terms
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ice">
                This is a one-use private invitation. It does not change the public £395 price of the Studio Intelligence Audit.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">Expires {new Date(invite.expires_at).toLocaleString("en-GB")}.</p>
              {statusText ? <p className="mt-4 text-sm font-semibold text-amber-200">{statusText}</p> : null}
            </div>
          </div>

          {message ? <p className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/5 px-4 py-3 text-sm text-amber-100">{message}</p> : null}
        </div>
      </section>
    </PublicShell>
  );
}

export function FoundingStudioCompletionExperience({ sessionId }: { sessionId: string }) {
  const [completion, setCompletion] = useState<CompletionView | null>(null);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedAuditId, setSubmittedAuditId] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [artistCount, setArtistCount] = useState<number | "">("");
  const [bookingProcess, setBookingProcess] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [dataAvailable, setDataAvailable] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [notes, setNotes] = useState("");

  const resolveCompletion = useCallback(async () => {
    const { data, error } = await db.rpc("resolve_founding_studio_completion", { p_session_id: sessionId });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return (row || null) as CompletionView | null;
  }, [sessionId]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        if (!sessionId.startsWith("cs_")) throw new Error("Invalid checkout confirmation.");
        let row: CompletionView | null = null;
        for (let attempt = 0; attempt < 10 && !row; attempt += 1) {
          row = await resolveCompletion();
          if (!row) await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (!active) return;
        if (!row) throw new Error("Stripe confirmed the checkout, but INKSIGHTS is still processing it. Refresh this page in a few seconds.");
        setCompletion(row);
        if (row.onboarding_status === "submitted") setSubmittedAuditId(row.audit_id);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "Checkout confirmation could not be resolved.");
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => { active = false; };
  }, [resolveCompletion, sessionId]);

  async function submitOnboarding(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const { data, error } = await db.rpc("submit_founding_studio_onboarding", {
        p_session_id: sessionId,
        p_location: location,
        p_artist_count: Number(artistCount),
        p_booking_process: bookingProcess,
        p_primary_goal: primaryGoal,
        p_data_available: dataAvailable,
        p_instagram_url: instagramUrl || null,
        p_notes: notes || null,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      setSubmittedAuditId(row?.audit_id || completion?.audit_id || null);
      setCompletion((current) => current ? { ...current, onboarding_status: "submitted" } : current);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Onboarding could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <PublicShell>
        <CenteredState icon={<Loader2 className="h-6 w-6 animate-spin text-mint" />} title="Confirming your Founding Studio checkout…" description="No payment is being taken." />
      </PublicShell>
    );
  }

  if (!completion) {
    return (
      <PublicShell>
        <CenteredState icon={<TriangleAlert className="h-6 w-6 text-amber-200" />} title="We are still confirming your checkout." description={message || "Refresh this page shortly."} />
      </PublicShell>
    );
  }

  if (submittedAuditId || completion.onboarding_status === "submitted") {
    return (
      <PublicShell>
        <meta name="robots" content="noindex,nofollow,noarchive" />
        <PageHero
          eyebrow="Founding Studio confirmed"
          title="Your Studio Intelligence Audit is now in the delivery pipeline."
          description={`Thank you, ${completion.contact_name}. ${completion.studio_name}'s £395 Audit fee has been fully waived and your onboarding information is recorded.`}
          compact
        />
        <section className="border-b border-border bg-ink">
          <div className="mx-auto max-w-4xl px-6 py-14">
            <div className="rounded-2xl border border-mint/30 bg-mint/[0.06] p-7">
              <div className="flex items-center gap-3 text-mint"><CheckCircle2 className="h-6 w-6" /><span className="font-display text-xl font-black">Intake complete</span></div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                INKSIGHTS can now begin evidence collection and diagnosis. No payment has been collected for this Founding Studio engagement.
              </p>
            </div>
          </div>
        </section>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <meta name="robots" content="noindex,nofollow,noarchive" />
      <PageHero
        eyebrow="Founding Studio confirmed"
        title="Complete your Studio Intelligence Audit intake."
        description={`Your £395 Audit fee has been fully waived. The final step is to give INKSIGHTS the operating context needed to start ${completion.studio_name}'s analysis.`}
        compact
      />
      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">
          <div className="mb-7 rounded-2xl border border-mint/25 bg-mint/[0.05] p-5 text-sm leading-relaxed text-muted-foreground">
            <strong className="text-ice">Checkout complete:</strong> £395 commercial value · £395 Founding Studio Waiver · £0 collected.
          </div>
          <form onSubmit={submitOnboarding} className="rounded-3xl border border-border bg-ink-deep p-6 md:p-8">
            <h2 className="font-display text-2xl font-black text-ice">Studio intake</h2>
            <p className="mt-2 text-sm text-muted-foreground">Keep answers practical. We can request supporting evidence after the Audit is opened.</p>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <PublicInput label="Studio location" value={location} onChange={setLocation} required />
              <label className="text-sm font-semibold text-ice">
                Number of artists
                <input type="number" min={0} required value={artistCount} onChange={(event) => setArtistCount(event.target.value === "" ? "" : Number(event.target.value))} className="mt-2 w-full rounded-xl border border-border bg-ink px-4 py-3 text-sm text-ice outline-none focus:border-mint" />
              </label>
              <PublicTextarea label="How do enquiries become bookings today?" value={bookingProcess} onChange={setBookingProcess} required />
              <PublicTextarea label="What is the main commercial result you want from this Audit?" value={primaryGoal} onChange={setPrimaryGoal} required />
              <PublicTextarea label="What data can you provide?" value={dataAvailable} onChange={setDataAvailable} placeholder="For example: bookings, enquiries, revenue, cancellations, repeat clients, diary exports." required />
              <PublicInput label="Instagram URL (optional)" value={instagramUrl} onChange={setInstagramUrl} />
              <div className="md:col-span-2"><PublicTextarea label="Anything else INKSIGHTS should know? (optional)" value={notes} onChange={setNotes} /></div>
            </div>
            <button disabled={submitting} type="submit" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-mint px-6 py-3 text-sm font-bold text-ink-deep disabled:opacity-50">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Submit intake & start Audit
            </button>
            {message ? <p className="mt-4 text-sm text-amber-100">{message}</p> : null}
          </form>
        </div>
      </section>
    </PublicShell>
  );
}

function CenteredState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <main className="flex min-h-[65vh] items-center justify-center px-6 py-20">
      <div className="max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-ink">{icon}</div>
        <h1 className="mt-5 font-display text-3xl font-black text-ice">{title}</h1>
        {description ? <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
    </main>
  );
}

function ValueCard({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${emphasis ? "border-mint/30 bg-mint/[0.05]" : "border-border bg-ink-deep"}`}>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-mint">{label}</p>
      <p className="mt-3 font-display text-3xl font-black text-ice">{value}</p>
    </div>
  );
}

function PublicInput({ label, value, onChange, required, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; placeholder?: string }) {
  return (
    <label className="text-sm font-semibold text-ice">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-border bg-ink px-4 py-3 text-sm text-ice outline-none placeholder:text-muted-foreground/60 focus:border-mint" />
    </label>
  );
}

function PublicTextarea({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <label className="text-sm font-semibold text-ice">
      {label}
      <textarea rows={5} value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-border bg-ink px-4 py-3 text-sm text-ice outline-none placeholder:text-muted-foreground/60 focus:border-mint" />
    </label>
  );
}
