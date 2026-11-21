export type RecoveryRecordType = "clients" | "projects" | "enquiries";
export type RecoveryCategory = "inactive_project" | "unconverted_enquiry" | "inactive_client";

export type NormalizedRecoveryRow = {
  record_type: RecoveryRecordType;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  occurred_at: string | null;
  amount_pence: number | null;
  data: Record<string, unknown>;
  dedupe_source: string;
};

export type RecoveryOpportunityCandidate = {
  record_id: string;
  category: RecoveryCategory;
  priority: "high" | "medium" | "low";
  estimated_value_pence: number;
  confidence_score: number;
  evidence: Record<string, unknown>;
  recommendation: string;
};

export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === '"') {
      if (quoted && input[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell); cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = []; cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  if (quoted) throw new Error("The CSV contains an unclosed quoted field.");
  return rows;
}

const clean = (value: unknown) => String(value ?? "").trim();
const headerKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const truthy = (value: unknown) => ["yes", "true", "1", "y", "consented", "allowed"].includes(clean(value).toLowerCase());
const falsey = (value: unknown) => ["no", "false", "0", "n", "not consented", "do not contact", "dnc"].includes(clean(value).toLowerCase());

function get(row: Record<string, string>, aliases: string[]): string {
  for (const alias of aliases) {
    const value = row[headerKey(alias)];
    if (value !== undefined && clean(value) !== "") return clean(value);
  }
  return "";
}

function parseMoney(value: string): number | null {
  if (!value) return null;
  const n = Number(value.replace(/[£$,\s]/g, "").replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

function parseDate(value: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function normalizeCsvRows(input: string, type: RecoveryRecordType): NormalizedRecoveryRow[] {
  const parsed = parseCsv(input);
  if (parsed.length < 2) throw new Error("The CSV needs a header row and at least one data row.");
  const headers = parsed[0].map(headerKey);
  const rows = parsed.slice(1);
  if (rows.length > 10000) throw new Error("A single import is limited to 10,000 rows.");
  return rows.map((values, index) => {
    const source = Object.fromEntries(headers.map((header, i) => [header, clean(values[i])])) as Record<string, string>;
    const name = get(source, ["client_name", "client name", "name", "customer", "customer_name", "full_name"]);
    const email = get(source, ["email", "client_email", "customer_email"]).toLowerCase();
    const phone = get(source, ["phone", "mobile", "telephone", "client_phone"]);
    if (!name && !email) throw new Error(`Row ${index + 2}: add at least a client name or email address.`);

    const marketingRaw = get(source, ["marketing_consent", "consent", "marketing permission", "email marketing consent"]);
    const marketingConsentAt = parseDate(get(source, ["marketing_consent_at", "consent_date", "marketing_permission_date"]));
    const marketingConsentSource = get(source, ["marketing_consent_source", "consent_source", "marketing_permission_source"]);
    const contactRaw = get(source, ["contact_permission", "contact allowed", "permission to contact", "follow_up_permission"]);
    const contactPermissionAt = parseDate(get(source, ["contact_permission_at", "contact_permission_date"]));
    const contactPermissionSource = get(source, ["contact_permission_source", "contact_permission_method"]);
    const dncRaw = get(source, ["do_not_contact", "dnc", "unsubscribe", "opted_out"]);
    const common = {
      client_name: name || email,
      client_email: email || null,
      client_phone: phone || null,
      marketing_consent: truthy(marketingRaw) && !falsey(marketingRaw),
      marketing_consent_at: marketingConsentAt,
      marketing_consent_source: marketingConsentSource || null,
      contact_permission: truthy(contactRaw) && !falsey(contactRaw),
      contact_permission_at: contactPermissionAt,
      contact_permission_source: contactPermissionSource || null,
      do_not_contact: truthy(dncRaw) || falsey(dncRaw) && ["yes", "true", "1"].includes(dncRaw.toLowerCase()),
      source_row: index + 2,
    };

    if (type === "clients") {
      const lastBooking = parseDate(get(source, ["last_booking_date", "last appointment", "last_visit", "last_booking", "last_seen"]));
      const average = parseMoney(get(source, ["average_booking_value_gbp", "average_booking_value", "avg_booking_value", "average_spend"]));
      const lifetime = parseMoney(get(source, ["lifetime_value_gbp", "lifetime_value", "total_spend"]));
      return {
        record_type: type, client_name: common.client_name, client_email: common.client_email,
        client_phone: common.client_phone, occurred_at: lastBooking, amount_pence: average,
        data: { ...common, last_booking_date: lastBooking, average_booking_value_pence: average, lifetime_value_pence: lifetime },
        dedupe_source: [email || name.toLowerCase(), "client"].join("|"),
      };
    }

    if (type === "projects") {
      const lastSession = parseDate(get(source, ["last_session_date", "last_session", "last_appointment", "last_visit"]));
      const remaining = Number(get(source, ["remaining_sessions", "sessions_remaining", "sessions_left"]));
      const total = Number(get(source, ["total_sessions", "sessions_total", "planned_sessions"]));
      const projectValue = parseMoney(get(source, ["project_value_gbp", "project_value", "total_project_value", "quoted_value_gbp", "quoted_value"]));
      const remainingValue = parseMoney(get(source, ["remaining_value_gbp", "remaining_value", "outstanding_value_gbp"]));
      const status = get(source, ["status", "project_status", "booking_status"]).toLowerCase();
      const nextBookedRaw = get(source, ["next_session_booked", "next_session_scheduled", "next_appointment_booked"]);
      const projectName = get(source, ["project_name", "project", "tattoo_project", "description"]) || "Tattoo project";
      return {
        record_type: type, client_name: common.client_name, client_email: common.client_email,
        client_phone: common.client_phone, occurred_at: lastSession, amount_pence: projectValue,
        data: { ...common, project_name: projectName, status, last_session_date: lastSession,
          remaining_sessions: Number.isFinite(remaining) ? Math.max(0, Math.trunc(remaining)) : null,
          total_sessions: Number.isFinite(total) ? Math.max(0, Math.trunc(total)) : null,
          project_value_pence: projectValue, remaining_value_pence: remainingValue, next_session_booked: truthy(nextBookedRaw) },
        dedupe_source: [email || name.toLowerCase(), projectName.toLowerCase()].join("|"),
      };
    }

    const enquiryDate = parseDate(get(source, ["enquiry_date", "created_at", "date", "submitted_at", "inquiry_date"]));
    const status = get(source, ["status", "enquiry_status", "lead_status"]).toLowerCase();
    const quoted = parseMoney(get(source, ["quoted_value_gbp", "quoted_value", "quote", "budget_gbp", "budget"]));
    const service = get(source, ["service", "project_type", "tattoo_type", "brief"]);
    return {
      record_type: type, client_name: common.client_name, client_email: common.client_email,
      client_phone: common.client_phone, occurred_at: enquiryDate, amount_pence: quoted,
      data: { ...common, status, quoted_value_pence: quoted, service },
      dedupe_source: [email || name.toLowerCase(), enquiryDate || "undated", service.toLowerCase()].join("|"),
    };
  });
}

export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

const daysAgo = (date: string | null) => {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date + "T00:00:00Z").getTime()) / 86400000);
};
const gbp = (pence: number) => (pence / 100).toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

export function buildRecoveryCandidates(records: Array<{ id: string; record_type: string; occurred_at: string | null; amount_pence: number | null; data: Record<string, unknown>; client_email: string | null; client_phone: string | null }>): RecoveryOpportunityCandidate[] {
  const candidates: RecoveryOpportunityCandidate[] = [];
  for (const record of records) {
    const data = record.data ?? {};
    const age = daysAgo(record.occurred_at ?? null);
    const hasContact = Boolean(record.client_email || record.client_phone);
    const blocked = data.do_not_contact === true;
    const documentedMarketingConsent = data.marketing_consent === true && Boolean(data.marketing_consent_at) && Boolean(data.marketing_consent_source);
    const documentedContactPermission = data.contact_permission === true && Boolean(data.contact_permission_at) && Boolean(data.contact_permission_source);
    const contactAllowed = documentedContactPermission || documentedMarketingConsent;

    if (record.record_type === "projects") {
      const status = String(data.status ?? "").toLowerCase();
      const remaining = Number(data.remaining_sessions ?? 0);
      const nextBooked = data.next_session_booked === true;
      if (age === null || age < 45 || remaining <= 0 || nextBooked || ["completed", "cancelled", "closed", "finished"].includes(status)) continue;
      const total = Number(data.total_sessions ?? 0);
      const totalValue = Number(data.project_value_pence ?? record.amount_pence ?? 0);
      const remainingValue = Number(data.remaining_value_pence ?? 0);
      const estimate = remainingValue > 0 ? remainingValue : total > 0 && totalValue > 0 ? Math.round(totalValue * Math.min(1, remaining / total)) : 0;
      candidates.push({
        record_id: record.id, category: "inactive_project", priority: age >= 90 ? "high" : "medium",
        estimated_value_pence: Math.max(0, estimate), confidence_score: remainingValue > 0 ? 0.9 : totalValue > 0 && total > 0 ? 0.88 : 0.4,
        evidence: { inactive_days: age, remaining_sessions: remaining, total_sessions: total || null, project_value_pence: totalValue || null, remaining_value_pence: remainingValue || null, contact_available: hasContact, contact_allowed: contactAllowed && !blocked },
        recommendation: `Contact the client about continuing their ${String(data.project_name ?? "tattoo")} project. There are ${remaining} session(s) recorded as remaining and no next session booked.`,
      });
    }

    if (record.record_type === "enquiries") {
      const status = String(data.status ?? "").toLowerCase();
      if (age === null || age < 3 || ["booked", "converted", "won", "closed_won", "cancelled", "spam", "lost", "declined"].includes(status)) continue;
      const value = Number(data.quoted_value_pence ?? record.amount_pence ?? 0);
      candidates.push({
        record_id: record.id, category: "unconverted_enquiry", priority: age >= 14 ? "high" : "medium",
        estimated_value_pence: Math.max(0, value), confidence_score: value > 0 ? 0.78 : 0.52,
        evidence: { enquiry_age_days: age, status: status || "unknown", quoted_value_pence: value || null, contact_available: hasContact, contact_allowed: contactAllowed && !blocked },
        recommendation: "Review the original enquiry and send a helpful, non-pressuring follow-up if the client has given permission to be contacted.",
      });
    }

    if (record.record_type === "clients") {
      const consent = documentedMarketingConsent;
      if (age === null || age < 180 || !consent || blocked) continue;
      const value = Number(data.average_booking_value_pence ?? record.amount_pence ?? 0);
      candidates.push({
        record_id: record.id, category: "inactive_client", priority: age >= 365 ? "high" : "medium",
        estimated_value_pence: Math.max(0, value), confidence_score: value > 0 ? 0.62 : 0.4,
        evidence: { days_since_last_booking: age, marketing_consent: consent, average_booking_value_pence: value || null, contact_available: hasContact, contact_allowed: hasContact },
        recommendation: "Consider a relevant reactivation message. Only contact where valid marketing permission is recorded and no opt-out applies.",
      });
    }
  }
  return candidates;
}

export function recoveryLabel(category: RecoveryCategory): string {
  return category === "inactive_project" ? "Inactive project" : category === "unconverted_enquiry" ? "Unconverted enquiry" : "Inactive client";
}

export function recoveryTemplate(category: RecoveryCategory, firstName: string, projectName = ""): { subject: string; message: string } {
  const name = firstName.trim().split(/\s+/)[0] || "there";
  if (category === "inactive_project") return {
    subject: "Your tattoo project",
    message: `Hi ${name},\n\nI hope you're well. I was reviewing our previous work together and wanted to check in about ${projectName || "your tattoo project"}. If you'd like to continue, we can look at suitable dates for the next session. There's no pressure — just let me know what works for you.\n\nBest,\nThe studio`,
  };
  if (category === "unconverted_enquiry") return {
    subject: "Following up on your tattoo enquiry",
    message: `Hi ${name},\n\nI wanted to follow up on your previous tattoo enquiry and see whether you still needed any information from us. If the project is still something you're considering, reply here and we can help with the next steps.\n\nBest,\nThe studio`,
  };
  return {
    subject: "A quick hello from the studio",
    message: `Hi ${name},\n\nI hope you've been well. It's been a little while since your last visit, so I wanted to say hello and let you know we'd be happy to help if you have another tattoo project in mind.\n\nBest,\nThe studio`,
  };
}
