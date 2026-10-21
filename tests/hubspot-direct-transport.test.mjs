import test from "node:test";
import assert from "node:assert/strict";
import { syncHubSpotDirect, validateCrmPayload } from "../supabase/functions/hubspot-sync-v1/hubspot-direct.mjs";

const input = () => ({
  email:"qa@example.com",source_id:"123e4567-e89b-42d3-a456-426614174000",
  source_type:"revenue_audit_lead",first_name:"QA",last_name:"Owner",
  deal_name:"QA Studio — Revenue Audit follow-up — 123e4567",
  deal_pipeline:"default", deal_stage:"6160204007",deal_amount:0,
});
const json = (status, result) => ({
  ok: status >= 200 && status < 300, status,
  text: async () => JSON.stringify(result),
});

test("direct CRM transport: rejects bad source, name and missing secrets", async () => {
  assert.throws(() => validateCrmPayload({...input(),source_type:"unknown"}), /crm_source_type_invalid/);
  assert.throws(() => validateCrmPayload({...input(),source_id:"invalid"}), /crm_source_id_invalid/);
  assert.throws(() => validateCrmPayload({...input(),email:"oops"}), /crm_email_invalid/);
  assert.throws(() => validateCrmPayload({...input(),deal_name:"not stable"}), /crm_deal_name_invalid/);
  await assert.rejects(syncHubSpotDirect(input(),{}), /hubspot_private_token_missing/);
});

test("direct CRM transport: existing contact and deal are reused on retry", async () => {
  const requests = [];
  const fetcher = async (url, init) => {
    const path = new URL(url).pathname;
    requests.push([init.method,path]);
    if (path.includes("/contacts/") && init.method === "GET") return json(200,{id:"10"});
    if (path.includes("/deals/search")) return json(200,{results:[{id:"20"}]});
    if (path.includes("/associations/default/")) return json(200,{results:[]});
    throw new Error("Unexpected request "+path);
  };
  const response = await syncHubSpotDirect(input(),{token:"fixture-secret",fetcher});
  assert.deepEqual({contact_id:response.contact_id,deal_id:response.deal_id}, {contact_id:"10",deal_id:"20"});
  assert.equal(requests.some(([method])=>method === "POST" && !requests.some(([m,p])=>m === "POST" && p.endsWith("/deals/search"))),false);
  assert.ok(requests.some(([m,p])=>m === "PUT" && p.endsWith("/associations/default/deals/20")));
});

test("direct CRM transport: create contact, deal and association when absent",async () => {
  const requests = [];
  const fetcher = async (url,init) => {
    const path = new URL(url).pathname;
    requests.push([init.method,path]);
    if (path.includes("/contacts/") && init.method === "GET") return json(404,{});
    if (path === "/crm/v3/objects/contacts" && init.method === "POST") return json(201,{id:"101"});
    if (path.endsWith("/deals/search")) return json(200,{results:[]});
    if (path === "/crm/v3/objects/deals" && init.method === "POST") return json(201,{id:"201"});
    if (path.endsWith("/associations/default/deals/201")) return json(200,{results:[]});
    throw new Error("Unexpected request "+path);
  };
  const result = await syncHubSpotDirect(input(),{token:"fixture-secret",fetcher});
  assert.equal(result.contact_id,"101");
  assert.equal(result.deal_id,"201");
  assert.equal(requests.length,5);
});

test("direct CRM transport: a concurrent contact create conflict is recovered by lookup",async()=>{
  let reads = 0;
  const fetcher = async (url,init)=>{
    const path=new URL(url).pathname;
    if(path.includes("/contacts/") && init.method==="GET")return ++reads===1?json(404,{}):json(200,{id:"7"});
    if(path==="/crm/v3/objects/contacts")return json(409,{});
    if(path.endsWith("/deals/search"))return json(200,{results:[{id:"8"}]});
    if(path.endsWith("/associations/default/deals/8"))return json(200,{results:[]});
    throw new Error(path);
  };
  const result=await syncHubSpotDirect(input(),{token:"fixture-secret",fetcher});
  assert.equal(result.contact_id,"7");
  assert.equal(reads,2);
});

test("direct CRM transport: ambiguous deal match is not duplicated",async()=>{
  const fetcher=async (url)=>{
    const path=new URL(url).pathname;
    if(path.includes("/contacts/"))return json(200,{id:"7"});
    if(path.endsWith("/deals/search"))return json(200,{results:[{id:"10"},{id:"11"}]});
    throw new Error(path);
  };
  await assert.rejects(syncHubSpotDirect(input(),{token:"fixture-secret",fetcher}),/hubspot_deal_ambiguous/);
});

test("direct CRM transport: API errors expose only status, not private response details",async()=>{
  const fetcher=async()=>json(401,{message:"confidential customer detail"});
  await assert.rejects(syncHubSpotDirect(input(),{token:"fixture-secret",fetcher}),/^Error: hubspot_http_401$/);
});

test("direct CRM transport: transient read rate-limit is retried before writing",async()=>{
  let attempts = 0;
  const fetcher=async(url,init)=>{
    const path=new URL(url).pathname;
    if(path.includes("/contacts/") && init.method==="GET") {
      attempts++;
      return attempts === 1 ? json(429,{}) : json(200,{id:"17"});
    }
    if(path.endsWith("/deals/search"))return json(200,{results:[{id:"18"}]});
    if(path.endsWith("/associations/default/deals/18"))return json(200,{results:[]});
    throw new Error(path);
  };
  const result=await syncHubSpotDirect(input(),{token:"fixture-secret",fetcher});
  assert.equal(attempts,2);
  assert.equal(result.deal_id,"18");
});
