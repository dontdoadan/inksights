import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SB = Deno.env.get("SUPABASE_URL") || "";
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-retry-count",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}
function num(v: unknown, fallback = 0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function money(n: number) { return Math.max(0, Math.round(n)); }

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    if (Number(req.headers.get("content-length") || 0) > 20000) return json({ ok: false, error: "Request too large" }, 413);
    body = await req.json();
  } catch { return json({ ok: false, error: "Invalid request" }, 400); }

  if (String(body.website_honeypot || "").trim()) return json({ ok: true, suppressed: true }, 200);

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const studioName = String(body.studio_name || "").trim();
  const teamSize = Math.round(num(body.team_size));
  const consent = body.consent === true;
  if (!name || name.length > 120 || !email || !/^\S+@\S+\.\S+$/.test(email) || !studioName || studioName.length > 180 || teamSize < 3 || teamSize > 100 || !consent) {
    return json({ ok: false, error: "Please complete the required fields. Revenue Audit V1 is currently designed for studios with 3+ artists." }, 400);
  }

  const revenue = Math.max(0, num(body.monthly_revenue));
  const enquiries = Math.max(0, Math.round(num(body.monthly_enquiries)));
  const bookings = Math.max(0, Math.round(num(body.monthly_bookings)));
  const aov = Math.max(0, num(body.average_booking_value, bookings > 0 ? revenue / bookings : 0));
  const availableHours = Math.max(0, num(body.monthly_available_hours));
  const bookedHours = Math.max(0, num(body.monthly_booked_hours));
  const repeatRate = clamp(num(body.repeat_client_rate), 0, 100);
  const cancellationRate = clamp(num(body.cancellation_rate), 0, 100);
  const noShowRate = clamp(num(body.no_show_rate), 0, 100);

  if (revenue <= 0 || enquiries <= 0 || bookings <= 0 || aov <= 0 || availableHours <= 0 || bookedHours <= 0 || bookedHours > availableHours) {
    return json({ ok: false, error: "Please provide valid monthly figures so we can calculate a useful estimate." }, 400);
  }

  const conversionRate = bookings / enquiries;
  const revenuePerBookedHour = revenue / bookedHours;
  const unusedHours = Math.max(0, availableHours - bookedHours);
  const conversionLow = Math.max(0, Math.min(enquiries * 0.05, enquiries * Math.max(0, 0.55 - conversionRate)) * aov * 0.35);
  const conversionHigh = Math.max(0, Math.min(enquiries * 0.12, enquiries * Math.max(0, 0.65 - conversionRate)) * aov * 0.65);
  const capacityLow = unusedHours * revenuePerBookedHour * 0.15;
  const capacityHigh = unusedHours * revenuePerBookedHour * 0.35;
  const cancellationBase = bookings * (cancellationRate + noShowRate) / 100 * aov;
  const cancellationLow = cancellationBase * 0.25;
  const cancellationHigh = cancellationBase * 0.55;
  const retentionGap = Math.max(0, 55 - repeatRate) / 100;
  const retentionLow = revenue * retentionGap * 0.05;
  const retentionHigh = revenue * retentionGap * 0.12;

  const opportunities = [
    { key: "capacity", label: "Unused studio capacity", low: capacityLow, high: capacityHigh },
    { key: "conversion", label: "Unconverted enquiries", low: conversionLow, high: conversionHigh },
    { key: "cancellation", label: "Cancellations and no-shows", low: cancellationLow, high: cancellationHigh },
    { key: "retention", label: "Repeat-client opportunity", low: retentionLow, high: retentionHigh },
  ].sort((a, b) => b.high - a.high);

  const totalLow = money(opportunities.reduce((s, x) => s + x.low, 0) * 12);
  const totalHigh = money(opportunities.reduce((s, x) => s + x.high, 0) * 12);
  const primary = opportunities[0];
  const score = Math.round(clamp(100 - ((unusedHours / availableHours) * 30 + Math.max(0, 0.55 - conversionRate) * 35 + retentionGap * 20 + (cancellationRate + noShowRate) * 0.15), 15, 95));
  const findings = opportunities.map((x) => ({ type: x.key, label: x.label, monthly_low: money(x.low), monthly_high: money(x.high), annual_low: money(x.low * 12), annual_high: money(x.high * 12) }));
  const recommendations = [
    `Start with ${primary.label.toLowerCase()}; it has the largest estimated recoverable value in this scan.`,
    "Track enquiries, bookings, booked hours and revenue together rather than reviewing each number in isolation.",
    "Measure each intervention so future INKSIGHTS audits can replace estimates with observed studio data.",
  ];

  try {
    const dbHeaders = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };
    const leadRes = await fetch(`${SB}/rest/v1/revenue_audit_leads`, { method: "POST", headers: dbHeaders, body: JSON.stringify({ name, email, studio_name: studioName, website: String(body.website || "").trim() || null, area: String(body.area || "").trim() || null, team_size: teamSize, monthly_revenue_band: String(body.monthly_revenue_band || "").trim() || null, monthly_enquiries: enquiries, monthly_bookings: bookings, average_booking_value: aov, monthly_available_hours: availableHours, monthly_booked_hours: bookedHours, repeat_client_rate: repeatRate, cancellation_rate: cancellationRate, no_show_rate: noShowRate, primary_problem: String(body.primary_problem || "").trim() || null, consent_at: new Date().toISOString(), marketing_consent: body.marketing_consent === true }) });
    if (!leadRes.ok) throw new Error("Lead persistence failed");
    const leadRows = await leadRes.json();
    const leadId = leadRows?.[0]?.id;
    if (!leadId) throw new Error("Lead persistence returned no id");

    const auditRes = await fetch(`${SB}/rest/v1/revenue_audits`, { method: "POST", headers: dbHeaders, body: JSON.stringify({ lead_id: leadId, opportunity_low: totalLow, opportunity_high: totalHigh, capacity_opportunity: money(capacityHigh * 12), conversion_opportunity: money(conversionHigh * 12), retention_opportunity: money(retentionHigh * 12), cancellation_opportunity: money(cancellationHigh * 12), primary_opportunity: primary.key, score, findings, recommendations }) });
    if (!auditRes.ok) throw new Error("Audit persistence failed");
    const auditRows = await auditRes.json();

    return json({ ok: true, lead_id: leadId, audit_id: auditRows?.[0]?.id || null, audit_version: "v1", estimate: { annual_low: totalLow, annual_high: totalHigh, primary_opportunity: primary.label, score }, findings, recommendations, disclaimer: "This is a first-pass estimate based on the figures you supplied. It is not a verified financial audit. A full INKSIGHTS audit uses connected or exported studio data to replace estimates with observed results." }, 200);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return json({ ok: false, error: "We could not save the audit right now. Please try again." }, 503);
  }
});
