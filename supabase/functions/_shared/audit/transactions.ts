import { normaliseClientLabel } from "./identity.ts";

export type ParsedTransaction = {
  sourceRow: number;
  date: string;
  rawClient: string;
  normalisedClient: string;
  amountPence: number;
  currency: "GBP";
  sourceRowKey: string;
};

export type ParsedLedger = {
  rows: ParsedTransaction[];
  rejected: Array<{ sourceRow: number; raw: string; reason: string }>;
  totalPence: number;
};

function parseDate(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return null;
  return `${yyyy}-${mm}-${dd}`;
}

function parseAmountPence(value: string): number | null {
  const cleaned = value.trim().replace(/^£/, "").replace(/,/g, "");
  if (!/^[-+]?\d+(?:\.\d{1,2})?$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount)) return null;
  const pence = Math.round(amount * 100);
  return Number.isSafeInteger(pence) ? pence : null;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function parseTransactionLedger(text: string): Promise<ParsedLedger> {
  const rows: ParsedTransaction[] = [];
  const rejected: ParsedLedger["rejected"] = [];
  let totalPence = 0;

  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const sourceRow = index + 1;
    const raw = lines[index];
    if (!raw.trim()) continue;

    const fields = raw.split("\t");
    if (fields.length < 3) {
      rejected.push({ sourceRow, raw, reason: "expected at least date, client and amount columns" });
      continue;
    }

    const date = parseDate(fields[0]);
    const rawClient = fields[1].trim();
    const normalisedClient = normaliseClientLabel(rawClient);
    const amountPence = parseAmountPence(fields[2]);

    if (!date) {
      rejected.push({ sourceRow, raw, reason: "invalid DD/MM/YYYY date" });
      continue;
    }
    if (!rawClient || !normalisedClient) {
      rejected.push({ sourceRow, raw, reason: "missing client label" });
      continue;
    }
    if (amountPence === null) {
      rejected.push({ sourceRow, raw, reason: "invalid GBP amount" });
      continue;
    }

    const sourceRowKey = await sha256Hex(`${sourceRow}\t${raw}`);
    rows.push({
      sourceRow,
      date,
      rawClient,
      normalisedClient,
      amountPence,
      currency: "GBP",
      sourceRowKey,
    });
    totalPence += amountPence;
  }

  return { rows, rejected, totalPence };
}

export function detectPotentialDuplicates(rows: ParsedTransaction[]): Set<string> {
  const grouped = new Map<string, ParsedTransaction[]>();
  for (const row of rows) {
    const key = `${row.date}|${row.normalisedClient}|${row.amountPence}`;
    const group = grouped.get(key) ?? [];
    group.push(row);
    grouped.set(key, group);
  }

  const duplicateRowKeys = new Set<string>();
  for (const group of grouped.values()) {
    if (group.length < 2) continue;
    for (const row of group) duplicateRowKeys.add(row.sourceRowKey);
  }
  return duplicateRowKeys;
}
