type JsonRecord = Record<string, unknown>;

interface HubSpotObject {
  id: string;
  properties?: Record<string, string | null>;
}

interface SearchResponse {
  total?: number;
  results?: HubSpotObject[];
}

interface CrmUpsertInput {
  email: string;
  name?: string | null;
  studioName?: string | null;
  website?: string | null;
  phone?: string | null;
  lifecycleStage?: "lead" | "customer";
}

export interface CrmUpsertResult {
  contactId: string;
  companyId: string | null;
  companySyncStatus: "synced" | "deferred_missing_domain";
}

export interface DealUpsertInput {
  existingDealId?: string | null;
  dealName: string;
  pipelineId: string;
  stageId: string;
  amount?: number | null;
  currency?: string | null;
}

const HUBSPOT_BASE_URL = "https://api.hubapi.com";

export async function upsertLeadOrCustomer(input: CrmUpsertInput): Promise<CrmUpsertResult> {
  const email = input.email.trim().toLowerCase();
  if (!email) throw new Error("HubSpot contact sync requires an email address");

  const { firstName, lastName } = splitName(input.name);
  const contactProperties: Record<string, string> = {
    email,
    lifecyclestage: input.lifecycleStage ?? "lead",
  };
  if (firstName) contactProperties.firstname = firstName;
  if (lastName) contactProperties.lastname = lastName;
  if (input.studioName?.trim()) contactProperties.company = input.studioName.trim();
  if (input.phone?.trim()) contactProperties.phone = input.phone.trim();

  const contact = await upsertByUniqueProperty("contacts", "email", email, contactProperties);
  const domain = normaliseDomain(input.website);
  if (!domain) {
    return {
      contactId: contact.id,
      companyId: null,
      companySyncStatus: "deferred_missing_domain",
    };
  }

  const companyProperties: Record<string, string> = {
    domain,
    website: `https://${domain}`,
    lifecyclestage: input.lifecycleStage ?? "lead",
  };
  if (input.studioName?.trim()) companyProperties.name = input.studioName.trim();

  const company = await upsertCompanyByDomain(domain, companyProperties);
  return {
    contactId: contact.id,
    companyId: company.id,
    companySyncStatus: "synced",
  };
}

export async function upsertDeal(input: DealUpsertInput): Promise<string> {
  const properties: Record<string, string> = {
    dealname: input.dealName,
    pipeline: input.pipelineId,
    dealstage: input.stageId,
    dealtype: "newbusiness",
  };
  if (input.amount != null) properties.amount = String(input.amount);
  if (input.currency) properties.deal_currency_code = input.currency.toUpperCase();

  if (input.existingDealId) {
    const updated = await hubspotRequest<HubSpotObject>(
      `/crm/v3/objects/deals/${encodeURIComponent(input.existingDealId)}`,
      { method: "PATCH", body: JSON.stringify({ properties }) },
    );
    return updated.id;
  }

  const created = await hubspotRequest<HubSpotObject>("/crm/v3/objects/deals", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
  return created.id;
}

async function upsertCompanyByDomain(
  domain: string,
  properties: Record<string, string>,
): Promise<HubSpotObject> {
  const matches = await searchObjects("companies", "domain", domain, ["name", "domain", "website"]);
  if (matches.length > 1) {
    throw new Error(`HubSpot company conflict: multiple companies already use domain ${domain}`);
  }

  if (matches.length === 1) {
    return hubspotRequest<HubSpotObject>(
      `/crm/v3/objects/companies/${encodeURIComponent(matches[0].id)}`,
      { method: "PATCH", body: JSON.stringify({ properties }) },
    );
  }

  return hubspotRequest<HubSpotObject>("/crm/v3/objects/companies", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
}

async function upsertByUniqueProperty(
  objectType: "contacts",
  propertyName: string,
  value: string,
  properties: Record<string, string>,
): Promise<HubSpotObject> {
  const matches = await searchObjects(objectType, propertyName, value, Object.keys(properties));
  if (matches.length > 1) {
    throw new Error(`HubSpot ${objectType} conflict: multiple records match ${propertyName}=${value}`);
  }
  if (matches.length === 1) {
    return hubspotRequest<HubSpotObject>(
      `/crm/v3/objects/${objectType}/${encodeURIComponent(matches[0].id)}`,
      { method: "PATCH", body: JSON.stringify({ properties }) },
    );
  }
  return hubspotRequest<HubSpotObject>(`/crm/v3/objects/${objectType}`, {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
}

async function searchObjects(
  objectType: "contacts" | "companies",
  propertyName: string,
  value: string,
  properties: string[],
): Promise<HubSpotObject[]> {
  const response = await hubspotRequest<SearchResponse>(`/crm/v3/objects/${objectType}/search`, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [{ propertyName, operator: "EQ", value }],
        },
      ],
      properties,
      limit: 3,
    }),
  });
  return response.results ?? [];
}

async function hubspotRequest<T>(path: string, init: RequestInit): Promise<T> {
  const token = process.env["HUBSPOT_ACCESS_TOKEN"];
  if (!token) throw new Error("HubSpot runtime credential is not configured");

  const response = await fetch(`${HUBSPOT_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    const details = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
    throw new Error(`HubSpot API ${response.status}: ${details.slice(0, 500)}`);
  }
  return parsed as T;
}

function splitName(input?: string | null) {
  const parts = String(input ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function normaliseDomain(input?: string | null) {
  if (!input?.trim()) return null;
  const trimmed = input.trim();
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(candidate).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function payloadString(payload: JsonRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}
