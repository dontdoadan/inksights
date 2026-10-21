// Optional direct HubSpot CRM transport used when a server-only private-app
// token is available. Never import this module into browser bundles.
// The source UUID in the deal name is a deterministic retry/reconciliation key.
const BASE = "https://api.hubapi.com";
export function validateCrmPayload(value) {
  if (!value || typeof value !== "object") throw new Error("crm_payload_invalid");
  if (typeof value.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) throw new Error("crm_email_invalid");
  if (typeof value.source_id !== "string" || !/^[0-9a-f-]{36}$/i.test(value.source_id)) throw new Error("crm_source_id_invalid");
  if (!["public_contact_request","revenue_audit_lead"].includes(value.source_type)) throw new Error("crm_source_type_invalid");
  if (typeof value.deal_name !== "string" || !value.deal_name.endsWith(value.source_id.slice(0,8))) throw new Error("crm_deal_name_invalid");
  return value;
}

export async function syncHubSpotDirect(payload, { token, fetcher = fetch } = {}) {
  const data = validateCrmPayload(payload);
  if (!token || typeof token !== "string") throw new Error("hubspot_private_token_missing");
  const request = async (method, path, body, options = {}) => {
    let response;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await fetcher(BASE + path, {
          method,
          headers: {
            "authorization": "Bearer " + token,
            "content-type": "application/json",
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
          signal: AbortSignal.timeout(8_000),
        });
      } catch {
        // Retrying a create after an ambiguous network timeout can duplicate
        // records. Fail closed and let the next sync re-read HubSpot first.
        throw new Error("hubspot_transport_unavailable");
      }
      if (response.status !== 429 && response.status < 500) break;
      if (attempt === 2) break;
      if (method === "POST" && !path.endsWith("/search")) break;
      await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
    }
    if (options.allow404 && response.status === 404) return null;
    if (options.allow409 && response.status === 409) return { conflict: true };
    if (!response.ok) {
      // Never put customer information or HubSpot's raw response body in logs.
      throw new Error("hubspot_http_" + response.status);
    }
    if (response.status === 204) return {};
    const raw = await response.text();
    if (!raw) return {};
    try { return JSON.parse(raw); }
    catch { throw new Error("hubspot_response_not_json"); }
  };

  const contactPath = "/crm/v3/objects/contacts/" + encodeURIComponent(data.email) + "?idProperty=email";
  let contact = await request("GET", contactPath, undefined, { allow404: true });
  if (!contact?.id) {
    const properties = {
      email: data.email,
      firstname: data.first_name || undefined,
      lastname: data.last_name || undefined,
    };
    const created = await request("POST", "/crm/v3/objects/contacts", { properties }, { allow409: true });
    contact = created.conflict ? await request("GET", contactPath) : created;
  }
  if (!contact?.id) throw new Error("hubspot_contact_missing");

  // Use exact stable deal name as the retry key, rather than creating a deal
  // unconditionally on each invocation. More than one match is an exception.
  const result = await request("POST", "/crm/v3/objects/deals/search", {
    filterGroups: [{filters:[{ propertyName:"dealname", operator:"EQ", value:data.deal_name }]}],
    limit: 3, properties:["dealname","pipeline","dealstage"],
  });
  const matches = result.results || [];
  if (matches.length > 1) throw new Error("hubspot_deal_ambiguous");
  let deal = matches[0];
  if (!deal) {
    const properties = {
      dealname:data.deal_name,
      pipeline:data.deal_pipeline,
      dealstage:data.deal_stage,
      amount:String(Number.isFinite(data.deal_amount) && data.deal_amount > 0 ? data.deal_amount : 0),
    };
    deal = await request("POST", "/crm/v3/objects/deals", { properties });
  }
  if (!deal?.id) throw new Error("hubspot_deal_missing");
  await request("PUT", "/crm/v4/objects/contacts/" + encodeURIComponent(contact.id) + "/associations/default/deals/" + encodeURIComponent(deal.id));
  return {
    ok: true,
    contact_id: String(contact.id),
    deal_id: String(deal.id),
    company_id: null,
    transport: "direct_hubspot",
  };
}
