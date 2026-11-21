export type ClientCsvField =
  | "sourceRecordId"
  | "displayName"
  | "lastCompletedBookingAt"
  | "completedSessions"
  | "futureBookingAt"
  | "marketingPermissionState"
  | "hasContactRoute";

export type ClientCsvMapping = Record<ClientCsvField, string | null>;

export type ClientCsvRow = {
  source_row_number: number;
  source_record_id: string;
  display_name: string | null;
  last_completed_booking_at: string | null;
  completed_sessions: number;
  future_booking_at: string | null;
  marketing_permission_state: "unknown" | "permitted" | "not_permitted" | "suppressed";
  has_contact_route: boolean;
};

export type CsvParseResult = {
  headers: string[];
  rows: string[][];
};

export type ClientCsvValidation = {
  validRows: ClientCsvRow[];
  errors: Array<{ rowNumber: number; message: string }>;
};

const FIELD_ALIASES: Record<ClientCsvField, string[]> = {
  sourceRecordId: ["source_record_id", "external_client_id", "client_id", "clientid", "customer_id", "customerid", "id"],
  displayName: ["display_name", "client_name", "customer_name", "name", "full_name"],
  lastCompletedBookingAt: ["last_completed_booking_at", "last_booking_at", "last_session_at", "last_visit", "last_booking", "last_session"],
  completedSessions: ["completed_sessions", "total_completed_sessions", "sessions_completed", "session_count", "visits"],
  futureBookingAt: ["future_booking_at", "next_booking_at", "next_session_at", "next_appointment"],
  marketingPermissionState: ["marketing_permission_state", "marketing_permission", "marketing_consent", "consent_status"],
  hasContactRoute: ["has_contact_route", "contact_route_available", "contactable", "has_contact_details"],
};

function normaliseHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_").replace(/[^a-z0-9_]/g, "");
}

export function parseCsv(content: string): CsvParseResult {
  const input = content.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  row.push(cell.replace(/\r$/, ""));
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  if (rows.length < 2) throw new Error("CSV must contain a header and at least one data row.");

  const rawHeaders = rows[0].map((header) => header.trim());
  if (rawHeaders.some((header) => !header)) throw new Error("Every CSV column must have a header.");
  const headers = rawHeaders.map((header, index) => {
    const normalised = normaliseHeader(header);
    const duplicateCount = rawHeaders.slice(0, index).filter((item) => normaliseHeader(item) === normalised).length;
    return duplicateCount ? `${header}__${duplicateCount + 1}` : header;
  });

  return {
    headers,
    rows: rows.slice(1).map((values) =>
      headers.map((_, index) => (values[index] ?? "").trim()),
    ),
  };
}

export function autoMapClientHeaders(headers: string[]): ClientCsvMapping {
  const byNormalised = new Map(headers.map((header) => [normaliseHeader(header), header]));
  const mapping = {} as ClientCsvMapping;

  for (const field of Object.keys(FIELD_ALIASES) as ClientCsvField[]) {
    mapping[field] = null;
    for (const alias of FIELD_ALIASES[field]) {
      const match = byNormalised.get(alias);
      if (match) {
        mapping[field] = match;
        break;
      }
    }
  }

  return mapping;
}

function parseBoolean(value: string): boolean {
  return ["true", "yes", "y", "1", "available", "permitted"].includes(value.trim().toLowerCase());
}

function parsePermission(value: string): ClientCsvRow["marketing_permission_state"] {
  const normalised = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (["permitted", "yes", "true", "opted_in", "consented"].includes(normalised)) return "permitted";
  if (["not_permitted", "no", "false", "opted_out", "no_consent"].includes(normalised)) return "not_permitted";
  if (["suppressed", "do_not_contact", "dnc", "unsubscribed"].includes(normalised)) return "suppressed";
  return "unknown";
}

function parseIsoDate(value: string, label: string, rowNumber: number): string | null {
  if (!value.trim()) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) throw new Error(`Row ${rowNumber}: ${label} is not a valid date.`);
  return new Date(timestamp).toISOString();
}

export function validateClientCsv(
  parsed: CsvParseResult,
  mapping: ClientCsvMapping,
): ClientCsvValidation {
  const indexByField = {} as Record<ClientCsvField, number>;
  for (const field of Object.keys(mapping) as ClientCsvField[]) {
    indexByField[field] = mapping[field] ? parsed.headers.indexOf(mapping[field] as string) : -1;
  }
  if (indexByField.sourceRecordId < 0) {
    return { validRows: [], errors: [{ rowNumber: 1, message: "Map a source client ID column before importing." }] };
  }

  const validRows: ClientCsvRow[] = [];
  const errors: ClientCsvValidation["errors"] = [];
  const seen = new Set<string>();

  parsed.rows.forEach((values, index) => {
    const rowNumber = index + 2;
    const get = (field: ClientCsvField) =>
      indexByField[field] < 0 ? "" : (values[indexByField[field]] ?? "").trim();

    try {
      const sourceRecordId = get("sourceRecordId");
      if (!sourceRecordId) throw new Error(`Row ${rowNumber}: source client ID is empty.`);
      if (seen.has(sourceRecordId)) throw new Error(`Row ${rowNumber}: duplicate source client ID in this file.`);
      seen.add(sourceRecordId);

      const sessionText = get("completedSessions");
      const completedSessions = sessionText ? Number(sessionText) : 0;
      if (!Number.isInteger(completedSessions) || completedSessions < 0) {
        throw new Error(`Row ${rowNumber}: completed sessions must be a whole number greater than or equal to zero.`);
      }

      validRows.push({
        source_row_number: rowNumber,
        source_record_id: sourceRecordId,
        display_name: get("displayName") || null,
        last_completed_booking_at: parseIsoDate(get("lastCompletedBookingAt"), "last completed booking date", rowNumber),
        completed_sessions: completedSessions,
        future_booking_at: parseIsoDate(get("futureBookingAt"), "future booking date", rowNumber),
        marketing_permission_state: parsePermission(get("marketingPermissionState")),
        has_contact_route: parseBoolean(get("hasContactRoute")),
      });
    } catch (error) {
      errors.push({
        rowNumber,
        message: error instanceof Error ? error.message : "Invalid row.",
      });
    }
  });

  return { validRows, errors };
}
