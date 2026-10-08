/* eslint-disable @typescript-eslint/no-explicit-any -- new invitation tables precede generated Supabase type refresh */
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clipboard, Gift, Link2, ShieldCheck, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createFoundingInviteToken, foundingInviteUrl, formatMinorGbp, sha256Hex } from "@/lib/founding-studio";

type InviteRow = {
  id: string;
  studio_name: string;
  contact_name: string;
  email: string;
  website: string | null;
  reason: string;
  status: string;
  slot_code: string;
  list_value_minor: number;
  waiver_amount_minor: number;
  amount_due_minor: number;
  expires_at: string;
  onboarding_status: string;
  audit_id: string | null;
  failure_reason: string | null;
  created_at: string;
};

type SlotRow = { slot_code: string; status: string };

const db = supabase as any;

export function FoundingStudioInvitesPanel() {
  const [role, setRole] = useState<string | null>(null);
  const [rows, setRows] = useState<InviteRow[]>([]);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [studioName, setStudioName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [reason, setReason] = useState("Founding Studio validation programme");
  const [expiryDays, setExpiryDays] = useState(14);
  const [createdLink, setCreatedLink] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!active || !auth.user) return;
      const { data } = await db
        .from("platform_admins")
        .select("role,active")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (active && data?.active) setRole(data.role);
    })();
    return () => { active = false; };
  }, []);

  const load = useCallback(async () => {
    if (!role) return;
    const [inviteResult, slotResult] = await Promise.all([
      db
        .from("founding_studio_invites")
        .select("id,studio_name,contact_name,email,website,reason,status,slot_code,list_value_minor,waiver_amount_minor,amount_due_minor,expires_at,onboarding_status,audit_id,failure_reason,created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      db
        .from("founding_checkout_slots")
        .select("slot_code,status")
        .order("slot_code", { ascending: true }),
    ]);
    if (inviteResult.error) setMessage(inviteResult.error.message);
    else setRows((inviteResult.data ?? []) as InviteRow[]);
    if (!slotResult.error) setSlots((slotResult.data ?? []) as SlotRow[]);
  }, [role]);

  useEffect(() => { void load(); }, [load]);

  const availableSlots = useMemo(() => slots.filter((slot) => slot.status === "available").length, [slots]);

  async function createInvite(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setCreatedLink("");
    try {
      const token = createFoundingInviteToken();
      const tokenHash = await sha256Hex(token);
      const expiresAt = new Date(Date.now() + Math.max(1, Math.min(expiryDays, 90)) * 86400000).toISOString();
      const { data, error } = await db.rpc("create_founding_studio_invite", {
        p_studio_name: studioName,
        p_contact_name: contactName,
        p_email: email,
        p_website: website || null,
        p_reason: reason,
        p_token_hash: tokenHash,
        p_token_hint: token.slice(-8),
        p_expires_at: expiresAt,
      });
      if (error) throw error;
      const created = Array.isArray(data) ? data[0] : data;
      if (!created?.invite_id) throw new Error("Invitation was not created.");
      setCreatedLink(foundingInviteUrl(token));
      setMessage(`Invite created in checkout slot ${created.slot_code}. Copy the private link now; the raw token is never stored.`);
      setStudioName("");
      setContactName("");
      setEmail("");
      setWebsite("");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invite creation failed.");
    } finally {
      setSaving(false);
    }
  }

  async function revokeInvite(id: string) {
    if (!window.confirm("Revoke this invite? Its checkout slot will be retired and cannot be reused.")) return;
    setMessage("");
    const { error } = await db.rpc("revoke_founding_studio_invite", { p_invite_id: id });
    if (error) setMessage(error.message);
    else {
      setMessage("Invitation revoked. Create a new invite if you need to reissue access.");
      await load();
    }
  }

  async function copyCreatedLink() {
    if (!createdLink) return;
    await navigator.clipboard.writeText(createdLink);
    setMessage("Private invitation link copied.");
  }

  if (!role) return null;

  return (
    <section className="mt-12 border-t border-border/60 pt-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Founding Studio programme</p>
          <h2 className="mt-2 font-display text-3xl font-black text-ice">Complimentary Audit invitations</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Keep the public Audit at £395 while authorising specific studios to receive a £395 founder waiver. Each checkout slot can complete once.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-mint/25 bg-mint/5 px-4 py-2 text-xs font-bold text-mint">
          <ShieldCheck className="h-4 w-4" /> {availableSlots} secure slots available
        </div>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={createInvite} className="rounded-2xl border border-border bg-ink p-6">
          <div className="flex items-center gap-3">
            <Gift className="h-5 w-5 text-mint" />
            <h3 className="font-display text-xl font-black text-ice">Create private invite</h3>
          </div>
          <div className="mt-6 space-y-4">
            <AdminInput label="Studio name" value={studioName} onChange={setStudioName} required />
            <AdminInput label="Decision-maker name" value={contactName} onChange={setContactName} required />
            <AdminInput label="Email" value={email} onChange={setEmail} type="email" required />
            <AdminInput label="Website (optional before checkout)" value={website} onChange={setWebsite} />
            <label className="block text-sm font-semibold text-ice">
              Reason for waiver
              <textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} required className="mt-2 w-full rounded-xl border border-border bg-ink-deep px-4 py-3 text-sm text-ice outline-none focus:border-mint" />
            </label>
            <label className="block text-sm font-semibold text-ice">
              Expires after
              <div className="mt-2 flex items-center gap-3">
                <input type="number" min={1} max={90} value={expiryDays} onChange={(event) => setExpiryDays(Number(event.target.value))} className="w-28 rounded-xl border border-border bg-ink-deep px-4 py-3 text-sm text-ice outline-none focus:border-mint" />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </label>
          </div>
          <button disabled={saving || availableSlots === 0} type="submit" className="mt-6 w-full rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep disabled:opacity-50">
            {saving ? "Creating…" : "Create Founding Studio invite"}
          </button>
          {availableSlots === 0 ? <p className="mt-3 text-xs text-amber-200">No unused one-time checkout slots remain. Add another Stripe no-cost slot before creating more invites.</p> : null}
        </form>

        <div className="space-y-5">
          {createdLink ? (
            <div className="rounded-2xl border border-mint/40 bg-mint/[0.06] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-mint"><CheckCircle2 className="h-4 w-4" /> Invitation ready</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">This private URL is shown only now. Copy it before leaving this screen. If it is lost, revoke the invite and issue a new one.</p>
              <div className="mt-4 flex gap-2">
                <input readOnly value={createdLink} className="min-w-0 flex-1 rounded-xl border border-border bg-ink-deep px-4 py-3 text-xs text-ice" />
                <button type="button" onClick={copyCreatedLink} className="inline-flex items-center gap-2 rounded-xl bg-mint px-4 py-3 text-xs font-bold text-ink-deep"><Clipboard className="h-4 w-4" /> Copy</button>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-border bg-ink p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xl font-black text-ice">Invitation register</h3>
              <button type="button" onClick={() => void load()} className="text-xs font-bold text-mint">Refresh</button>
            </div>
            <div className="mt-4 space-y-3">
              {rows.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">No Founding Studio invites yet.</p>
              ) : rows.map((row) => (
                <div key={row.id} className="rounded-xl border border-border bg-ink-deep p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-ice">{row.studio_name}</p>
                        <StatusBadge status={row.status} />
                        {row.onboarding_status === "submitted" ? <span className="rounded-full bg-mint/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-mint">Intake complete</span> : null}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{row.contact_name} · {row.email} · slot {row.slot_code}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatMinorGbp(row.list_value_minor)} value · {formatMinorGbp(row.waiver_amount_minor)} waived · {formatMinorGbp(row.amount_due_minor)} due
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Expires {new Date(row.expires_at).toLocaleString("en-GB")}</p>
                      {row.audit_id ? <p className="mt-2 text-xs text-mint">Audit created: {row.audit_id}</p> : null}
                      {row.failure_reason ? <p className="mt-2 text-xs text-red-300">{row.failure_reason}</p> : null}
                    </div>
                    {["ready","opened","checkout_started"].includes(row.status) ? (
                      <button type="button" onClick={() => void revokeInvite(row.id)} className="inline-flex items-center gap-2 rounded-full border border-red-400/30 px-3 py-2 text-xs font-bold text-red-300">
                        <XCircle className="h-3.5 w-3.5" /> Revoke
                      </button>
                    ) : row.audit_id ? (
                      <a href={`/audits/${row.audit_id}`} className="inline-flex items-center gap-2 rounded-full border border-mint/30 px-3 py-2 text-xs font-bold text-mint">
                        <Link2 className="h-3.5 w-3.5" /> Open audit
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {message ? <p className="rounded-xl border border-border bg-ink px-4 py-3 text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </div>
    </section>
  );
}

function AdminInput({ label, value, onChange, required, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return (
    <label className="block text-sm font-semibold text-ice">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="mt-2 w-full rounded-xl border border-border bg-ink-deep px-4 py-3 text-sm text-ice outline-none focus:border-mint" />
    </label>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = ["ready","opened","checkout_started"].includes(status);
  const success = status === "completed";
  const className = success
    ? "border-mint/30 bg-mint/10 text-mint"
    : active
      ? "border-sky-300/30 bg-sky-300/10 text-sky-200"
      : "border-amber-300/30 bg-amber-300/10 text-amber-200";
  return <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${className}`}>{status.replaceAll("_"," ")}</span>;
}
