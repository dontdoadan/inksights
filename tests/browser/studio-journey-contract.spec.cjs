// Four-stage browser contract test: all writes are mocked; no production records/payments.
const { test, expect } = require("@playwright/test");
const { createServer } = require("node:http");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");

let server, origin, evaluateStage;
const source = resolve(__dirname,"../../public/tools/studio-intelligence-journey-connected.html");

test.beforeAll(async () => {
  ({ evaluateStage } = await import("../../supabase/functions/public-studio-journey/journey-policy.mjs"));
  const html = readFileSync(source, "utf8");
  server = createServer((req,res)=>{
    res.writeHead(200,{"Content-Type":req.url.endsWith(".svg")?"image/svg+xml":"text/html; charset=utf-8","Cache-Control":"no-store"});
    res.end(req.url.endsWith(".svg")?'<svg xmlns="http://www.w3.org/2000/svg"></svg>':html);
  });
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  origin = "http://127.0.0.1:"+server.address().port;
});
test.afterAll(async () => { if(server)await new Promise(resolve=>server.close(resolve)); });

function mockBackend(page,{failInitialSave=false}={}){
  const token="J".repeat(43);
  const history={},seen=new Map();
  const events=[];
  let failNext=failInitialSave, seq=0;
  page.route("**/api/public/studio-journey-submit",async route=>{
    const req=route.request();
    const body=JSON.parse(req.postData()||"{}");
    events.push({action:body.action,step:body.step,key:body.submissionKey,token:body.sessionToken});
    const answer=(status,value)=>route.fulfill({status,contentType:"application/json",body:JSON.stringify(value)});
    if(body.action==="start")return answer(200,{sessionToken:token,expiresAt:"2099-01-01"});
    if(body.sessionToken!==token)return answer(401,{error:"Session invalid."});
    if(body.action==="profile")return answer(200,{history});
    if(body.action==="revoke")return answer(200,{revoked:true});
    if(body.action!=="submit")return answer(422,{error:"Unknown action"});
    if(failNext){failNext=false;return answer(503,{error:"Simulated database failure."})}
    if(seen.has(body.submissionKey))return answer(200,seen.get(body.submissionKey));
    let evaluated;
    try{evaluated=evaluateStage(body.step,body.input,history)}catch(e){return answer(422,{error:e.message})}
    const submissionId="submission-"+(++seq);
    history[body.step]={normalized:evaluated.normalized,result:evaluated.result,submissionId,submittedAt:new Date().toISOString()};
    if(body.step==="growth"){delete history.revenue;delete history.visibility;delete history.summary}
    if(body.step==="revenue"||body.step==="visibility")delete history.summary;
    // Real Edge function returns submissionId/result/source, NOT sessionToken.
    const result={submissionId,result:evaluated.result,source:"DURABLY_SAVED"};
    seen.set(body.submissionKey,result);
    return answer(200,result);
  });
  return {events,history,seen,token};
}

async function enterGrowth(page){
  await page.locator('input[name="studio"]').fill("Example Ink Studio");
  await page.locator('input[name="area"]').fill("Croydon");
  await page.locator('input[name="website"]').fill("https://example.org");
  await page.locator('input[name="artists"]').fill("5");
  await page.locator('input[name="month"]').fill("2026-10");
  await page.locator('input[name="enquiries"]').fill("100");
  await page.locator('input[name="bookings"]').fill("20");
  await page.locator('input[name="bookingValue"]').fill("400");
  await page.locator('input[name="hours"]').fill("400");
  await page.locator('input[name="bookedHours"]').fill("200");
  await page.locator('input[name="sessionHours"]').fill("10");
  await page.locator('input[name="notice"]').check();
}

test("full progressive journey, server-confirmed saves and return visit",async({page})=>{
  const backend=mockBackend(page);
  await page.goto(origin+"/tools/studio-intelligence-journey-connected.html");
  await enterGrowth(page);
  await page.getByRole("button",{name:"Save Growth Check"}).click();
  await expect(page.getByText("Saved provisional profile · self-reported")).toBeVisible();
  await expect(page.getByText("20.0%",{exact:true}).first()).toBeVisible();
  expect(backend.history.growth?.result.evidence).toBe("SELF_REPORTED");
  expect(await page.evaluate(()=>sessionStorage.getItem("inksights:journey:unverified-session"))).toBe(backend.token);

  await page.getByRole("button",{name:"Next stage"}).click();
  await page.locator('input[name="target"]').fill("40");
  await page.getByRole("button",{name:"Save financial scenario"}).click();
  await expect(page.getByText(/Potential additional bookings/)).toBeVisible();
  expect(backend.history.revenue?.result.modelled_difference_gbp).toBe(8000);

  await page.getByRole("button",{name:"Next stage"}).click();
  await page.locator('select[name="listingClaimed"]').selectOption("yes");
  await page.locator('select[name="bookingLinkWorks"]').selectOption("no");
  await page.locator('select[name="mobileBookingClear"]').selectOption("no");
  await page.locator('select[name="EnquiriesRespondedPromptly"]').selectOption("yes");
  await page.getByRole("button",{name:"Save visibility assessment"}).click();
  await expect(page.getByText(/Reported concerns:/)).toBeVisible();
  expect(backend.history.visibility?.result.reported_friction_count).toBe(2);

  await page.getByRole("button",{name:"Next stage"}).click();
  await page.getByRole("button",{name:"Save preliminary plan"}).click();
  await expect(page.getByText(/Inspect the reported booking-path defects/)).toBeVisible();
  await expect(page.getByRole("link",{name:/Explore the £395 Studio Intelligence Audit/})).toBeVisible();
  expect(Object.keys(backend.history)).toHaveLength(4);
  const previousCount=backend.events.filter(e=>e.action==="submit").length;
  await page.reload();
  await expect(page.getByText("Saved provisional profile · self-reported")).toBeVisible();
  await expect(page.getByText(/Inspect the reported booking-path defects/)).toBeVisible();
  expect(backend.events.filter(e=>e.action==="submit")).toHaveLength(previousCount);
  expect(backend.events.filter(e=>e.action==="profile").every(e=>e.token===backend.token)).toBeTruthy();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(4);
});

test("write failure blocks personalised result; retry reuses idempotency key",async({page})=>{
  const backend=mockBackend(page,{failInitialSave:true});
  await page.goto(origin+"/tools/studio-intelligence-journey-connected.html");
  await enterGrowth(page);
  await page.getByRole("button",{name:"Save Growth Check"}).click();
  await expect(page.getByText("Simulated database failure.")).toBeVisible();
  await expect(page.getByText("Saved provisional profile · self-reported")).toHaveCount(0);
  expect(backend.history.growth).toBeUndefined();
  await page.getByRole("button",{name:"Retry save"}).click();
  await expect(page.getByText("Saved provisional profile · self-reported")).toBeVisible();
  expect(backend.history.growth).toBeDefined();
  const submits=backend.events.filter(e=>e.action==="submit");
  expect(submits.length).toBe(2);
  expect(submits[0].key).toBe(submits[1].key);
});
