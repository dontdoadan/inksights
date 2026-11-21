import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html=readFileSync(new URL("../public/tools/visibility-fix-inspector.html",import.meta.url),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,"Inspector inline script should exist");

test("Inspector script parses as JavaScript",()=>{
  assert.doesNotThrow(()=>new vm.Script(script,{filename:"visibility-fix-inspector.js"}));
});

test("Inspector marks private report pages noindex and prevents token referrers",()=>{
  assert.match(html,/<meta name="robots" content="noindex,nofollow,noarchive">/);
  assert.match(html,/<meta name="referrer" content="no-referrer">/);
  assert.match(html, /\/api\/public\/visibility-report\?reportId=/);
  assert.match(html,/history\.replaceState/);
  assert.match(html,/consent:el\("consent"\)\.checked/);
  assert.match(html,/website_honeypot/);
});

function evaluateReports(data){
  const start=script.indexOf("function realStages(data){");
  const end=script.indexOf("function stages(){",start);
  assert.ok(start>=0&&end>start,"Pure report transformation should be findable");
  const source=script.slice(start,end)+"\nglobalThis.convert=realStages";
  const context={
    item:(title,status,before,after,problem,fix,scope,access,test,evidence)=>({title,status,before,after,problem,fix,scope,access,test,evidence}),
    limited:Array.from({length:4},(_,i)=>["Unknown "+i,"Not measured","Verify","Conditional","Access","Test"]),
    Number,Array,Boolean
  };
  vm.runInNewContext(source,context,{timeout:1000});
  return context.convert(data);
}

test("Published evidence never turns unmeasured business systems into confirmed faults",()=>{
  const stages=evaluateReports({
    report:{current_visibility:{provider:"external provider"}},
    observations:[],
    search_universe:[]
  });
  assert.equal(stages.length,5);
  assert.equal(stages[0][0].status,"unknown");
  assert.equal(stages[1][0].status,"unknown");
  assert.equal(stages[2][0].status,"unknown");
  assert.equal(stages[3][0].status,"unknown");
  assert.equal(stages[4][0].status,"unknown");
});

test("Website snapshot differentiates observed metadata from needs-review fields",()=>{
  const stages=evaluateReports({
    report:{current_visibility:{provider:"independent"}},
    search_universe:[{query:"realism studio croydon",provider_position:3}],
    observations:[{
      observation_type:"website",source_provider:"studio_website",observed_at:"2026-10-23T00:00:00Z",
      raw_data:{http_status:200,title:"Sample Studio",meta_description:null,h1s:["Sample Studio"],canonical:null,robots_available:false,sitemap_available:true}
    }]
  });
  const website=stages[2];
  assert.equal(website[0].status,"observed");
  assert.equal(website.find(x=>x.title==="Page title").status,"observed");
  assert.match(website.find(x=>x.title==="Page title").before,/Sample Studio/);
  assert.equal(website.find(x=>x.title==="Meta description").status,"review");
  assert.equal(website.find(x=>x.title==="Canonical URL").status,"review");
  assert.equal(website.find(x=>x.title==="Sitemap availability").status,"observed");
  assert.equal(website.find(x=>x.title==="robots.txt availability").status,"review");
  assert.equal(stages[0][0].status,"observed");
  assert.match(stages[0][0].problem,/cannot establish total Google visibility/);
  assert.equal(stages[4][0].status,"unknown");
});

test("Inspector has no direct client-side write to tables or payment endpoint",()=>{
  assert.doesNotMatch(script,/\.from\(["'](?:studios|visibility_studios|visibility_report_runs)["']\)/);
  assert.doesNotMatch(script,/service_role|SUPABASE_SERVICE_ROLE_KEY|STRIPE_SECRET_KEY/);
  assert.match(html,/Request a visibility fix/);
  assert.match(html,/£395 Intelligence Audit/);
});
