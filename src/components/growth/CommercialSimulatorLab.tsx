import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

type Field = { label:string; value:number; min:number; max:number; step?:number };
type Tool = { title:string; signal:string; fields:Record<string,Field> };
const F=(label:string,value:number,min=0,max=100000,step=1):Field=>({label,value,min,max,step});
const tools:Record<string,Tool>={
  campaign_economics:{title:"Campaign economics",signal:"Modelled campaign contribution",fields:{
    spend:F("Advertising spend (£)",500,0,1000000,50),
    impressions:F("Impressions",20000,0,100000000,1000),
    ctr_pct:F("Click-through rate (%)",2,0,100,1),
    landing_conversion_pct:F("Landing page to enquiry (%)",8,0,100,1),
    enquiry_booking_pct:F("Enquiry to booking (%)",30,0,100,1),
    booking_value:F("Average booking value (£)",400,0,100000,10),
    variable_cost_pct:F("Variable costs (%)",35,0,100,1),
  }},
  lead_conversion:{title:"Lead conversion scenario",signal:"Modelled additional monthly revenue",fields:{
    monthly_enquiries:F("Monthly enquiries",100,0,1000000,10),
    current_booking_pct:F("Current booking conversion (%)",25,0,100,1),
    improved_booking_pct:F("Scenario booking conversion (%)",35,0,100,1),
    booking_value:F("Average booking value (£)",400,0,100000,25),
    variable_cost_pct:F("Variable costs (%)",35,0,100,1),
  }},
  revenue_target:{title:"Revenue target planner",signal:"Required monthly enquiries",fields:{
    target_revenue:F("Monthly revenue target (£)",20000,0,100000000,1000),
    booking_value:F("Average booking value (£)",400,0.01,100000,25),
    enquiry_booking_pct:F("Enquiry to booking (%)",30,0.01,100,1),
  }},
  lifetime_value:{title:"Client lifetime value & referrals",signal:"First-generation client value",fields:{
    average_session_value:F("Average session value (£)",400,0,100000,25),
    sessions_per_client:F("Sessions per client",3,0,100,0.5),
    referrals_per_client:F("Referrals per client",0.5,0,50,0.1),
    referral_booking_pct:F("Referred enquiries that book (%)",40,0,100,5),
    variable_cost_pct:F("Variable costs (%)",35,0,100,5),
  }},
  studio_capacity:{title:"Capacity & utilisation",signal:"Potential additional monthly revenue",fields:{
    artists:F("Artists",4,1,300,1),
    working_days:F("Working days / month",20,1,31,1),
    hours_per_day:F("Available hours / day",7,0.5,24,0.5),
    current_utilisation_pct:F("Current utilisation (%)",55,0,100,5),
    improved_utilisation_pct:F("Scenario utilisation (%)",70,0,100,5),
    revenue_per_booked_hour:F("Realised revenue / booked hour (£)",65,0,10000,5),
  }},
  pricing_sensitivity:{title:"Pricing sensitivity",signal:"Modelled monthly revenue change",fields:{
    baseline_bookings:F("Current monthly bookings",50,0,100000,5),
    baseline_price:F("Current average price (£)",350,0,100000,25),
    proposed_price:F("Scenario average price (£)",400,0,100000,25),
    booking_attrition_pct:F("Expected booking reduction (%)",10,0,100,5),
    variable_cost_pct:F("Variable costs (%)",35,0,100,5),
  }},
  booking_leakage:{title:"No-show & booking leakage",signal:"Potential recoverable monthly revenue",fields:{
    scheduled_bookings:F("Monthly booked appointments",80,0,100000,5),
    cancellation_pct:F("Late cancellation rate (%)",7,0,100,1),
    no_show_pct:F("No-show rate (%)",3,0,100,1),
    recovery_pct:F("Share of missed slots refilled (%)",40,0,100,5),
    booking_value:F("Average booking value (£)",400,0,100000,25),
    variable_cost_pct:F("Variable costs (%)",35,0,100,5),
  }},
};
const fmt=(n:number)=>new Intl.NumberFormat("en-GB",{maximumFractionDigits:2}).format(n);
const money=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(n);
function getDefaults(toolKey:string) {
  return Object.fromEntries(Object.entries(tools[toolKey].fields).map(([key,val])=>[key,val.value])) as Record<string,number>;
}
function headline(key:string,x:Record<string,number>):number {
  switch(key){
    case "campaign_economics":return x.impressions*x.ctr_pct/100*x.landing_conversion_pct/100*x.enquiry_booking_pct/100*x.booking_value*(1-x.variable_cost_pct/100)-x.spend;
    case "lead_conversion":return x.monthly_enquiries*(x.improved_booking_pct-x.current_booking_pct)/100*x.booking_value;
    case "revenue_target":return x.booking_value>0&&x.enquiry_booking_pct>0?Math.ceil(Math.ceil(x.target_revenue/x.booking_value)/(x.enquiry_booking_pct/100)):0;
    case "lifetime_value":return x.average_session_value*x.sessions_per_client*(1+x.referrals_per_client*x.referral_booking_pct/100);
    case "studio_capacity":return x.artists*x.working_days*x.hours_per_day*(x.improved_utilisation_pct-x.current_utilisation_pct)/100*x.revenue_per_booked_hour;
    case "pricing_sensitivity":return x.baseline_bookings*((1-x.booking_attrition_pct/100)*x.proposed_price-x.baseline_price);
    case "booking_leakage":return x.scheduled_bookings*(x.cancellation_pct+x.no_show_pct)/100*x.recovery_pct/100*x.booking_value;
    default:return 0;
  }
}
function labelFor(key:string) { return key.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()).replace(" Gbp"," (£)"); }
const API="https://ukaxsqwnkoqbbsufpzga.supabase.co/functions/v1/public-commercial-simulator-submit";
const CONSENT_VERSION="2026-10-commercial-tools-v1";

export function CommercialSimulatorLab() {
  const [active,setActive]=useState("campaign_economics");
  const [values,setValues]=useState<Record<string,number>>(()=>getDefaults("campaign_economics"));
  const [studioName,setStudioName]=useState("");
  const [studioWebsite,setStudioWebsite]=useState("");
  const [accepted,setAccepted]=useState(false);
  const [submissionKey,setSubmissionKey]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [saved,setSaved]=useState<{submissionId:string;result:Record<string,number|string|null>;studioLinked:boolean}|null>(null);
  const [linkableStudio,setLinkableStudio]=useState<string|null>(null);

  useEffect(()=>{
    let cancelled=false;
    async function resolveMembership() {
      const {data:{session}}=await supabase.auth.getSession();
      if(!session) return;
      const {data:members}=await supabase.from("studio_members").select("studio_id").eq("active",true);
      const ids=[...new Set((members||[]).map(m=>m.studio_id))];
      if(!ids.length) return;
      const {data:canonicals}=await supabase.from("studios").select("id").in("id",ids);
      if(!cancelled&&canonicals?.length===1) setLinkableStudio(canonicals[0].id);
    }
    resolveMembership().catch(()=>{});
    return ()=>{cancelled=true;};
  },[]);

  const spec=tools[active];
  const estimate=useMemo(()=>headline(active,values),[active,values]);
  const valid=Object.entries(spec.fields).every(([k,f])=>Number.isFinite(values[k])&&values[k]>=f.min&&values[k]<=f.max)
    &&(active!=="booking_leakage"||values.cancellation_pct+values.no_show_pct<=100);
  function resetSubmission(){setSaved(null);setError("");setSubmissionKey("");}
  function switchTool(key:string){setActive(key);setValues(getDefaults(key));resetSubmission();}
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!valid){setError("Check the numerical values before submitting.");return;}
    if(!accepted){setError("Please acknowledge the data notice.");return;}
    setLoading(true);setError("");setSaved(null);
    const id=submissionKey||crypto.randomUUID();
    setSubmissionKey(id);
    try {
      const {data:{session}}=await supabase.auth.getSession();
      const payload={
        toolKey:active,inputs:values,submissionKey:id,
        studioName,studioWebsite,consentVersion:CONSENT_VERSION,
        dataNoticeAccepted:true,
        ...(linkableStudio&&session?{verifiedStudioId:linkableStudio}:{}),
      };
      const res=await fetch(API,{method:"POST",
        headers:{"Content-Type":"application/json",...(linkableStudio&&session?{Authorization:"Bearer "+session.access_token}:{})},
        body:JSON.stringify(payload)});
      const data=await res.json();
      if(!res.ok||!data.ok)throw new Error(typeof data.error==="string"?data.error:"Could not save scenario.");
      setSaved({submissionId:data.submissionId,result:data.result,studioLinked:Boolean(data.studioLinked)});
    } catch(e) {setError(e instanceof Error?e.message:"Unable to store the scenario.");}
    finally {setLoading(false);}
  }
  return <section aria-labelledby="simulator-lab-heading" className="border-y border-border bg-ink-deep">
    <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-mint">Commercial intelligence tools</p>
      <h2 id="simulator-lab-heading" className="mt-3 font-display text-3xl font-black text-ice md:text-5xl">Explore seven commercial scenarios.</h2>
      <p className="mt-4 max-w-3xl text-muted-foreground">Adjust illustrative assumptions and compare commercial levers. Figures update immediately. Submit a scenario to store a versioned record and unlock the full breakdown; submissions are not verified forecasts.</p>
      <div className="mt-8 flex gap-2 overflow-x-auto pb-3" role="tablist" aria-label="Select simulator">
        {Object.entries(tools).map(([key,tool])=><button type="button" role="tab" aria-selected={key===active} key={key} onClick={()=>switchTool(key)}
          className={"shrink-0 rounded-xl border px-4 py-3 text-sm font-semibold transition "+(key===active?"border-mint bg-mint/10 text-mint":"border-border bg-ink text-muted-foreground hover:border-mint/50")}>{tool.title}</button>)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <form onSubmit={submit} className="rounded-3xl border border-border bg-ink p-6 md:p-8">
          <h3 className="font-display text-2xl font-bold text-ice">{spec.title}</h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {Object.entries(spec.fields).map(([key,f])=><label key={key} className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</span>
              <input type="number" required min={f.min} max={f.max} step={f.step||"any"} value={Number.isFinite(values[key])?values[key]:""}
                onChange={e=>{setValues(prev=>({...prev,[key]:e.target.value===""?NaN:Number(e.target.value)}));resetSubmission();}}
                className="mt-2 w-full rounded-xl border border-border bg-ink-deep px-4 py-3 text-lg font-semibold text-ice outline-none focus:border-mint"/>
            </label>)}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-muted-foreground">Studio name (optional)
              <input maxLength={120} value={studioName} onChange={e=>{setStudioName(e.target.value);resetSubmission();}} placeholder="Studio name" className="mt-2 w-full rounded-xl border border-border bg-ink-deep px-4 py-3 text-ice"/>
            </label>
            <label className="text-sm text-muted-foreground">Studio website (optional)
              <input type="url" maxLength={250} value={studioWebsite} onChange={e=>{setStudioWebsite(e.target.value);resetSubmission();}} placeholder="https://..." className="mt-2 w-full rounded-xl border border-border bg-ink-deep px-4 py-3 text-ice"/>
            </label>
          </div>
          {linkableStudio?<p className="mt-3 text-xs text-mint">Signed-in studio membership detected; submission may link to your existing studio profile.</p>:<p className="mt-3 text-xs text-muted-foreground">Anonymous scenarios are stored without a verified studio association.</p>}
          <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
            <input type="checkbox" required checked={accepted} onChange={e=>{setAccepted(e.target.checked);resetSubmission();}} className="mt-1 accent-teal-400"/>
            <span>I acknowledge that my scenario inputs and results will be stored for diagnostic and product improvement purposes as self-reported information. This does not subscribe me to marketing. See the <a className="text-mint underline" href="/privacy">privacy notice</a>.</span>
          </label>
          {error?<p role="alert" className="mt-5 text-sm text-red-300">{error}</p>:null}
          <button type="submit" disabled={!valid||!accepted||loading} className="mt-6 rounded-xl bg-mint px-6 py-3 font-bold text-ink-deep disabled:opacity-50">
            {loading?"Saving scenario…":"Save scenario & unlock full breakdown"}
          </button>
        </form>
        <aside className="space-y-5">
          <div className="rounded-3xl border border-mint/30 bg-mint/5 p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-mint">Live indicative preview</p>
            <p className="mt-3 text-sm text-muted-foreground">{spec.signal}</p>
            <p className="mt-4 break-words font-display text-4xl font-black text-ice">{valid ? (active==="revenue_target"?fmt(estimate):money(estimate)) : "—"}</p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Modelled outcome only. Assumes the entered rates and capacity are achievable. Not a guaranteed uplift.</p>
          </div>
          <div className="rounded-3xl border border-border bg-ink p-6 md:p-8">
            <h3 className="font-display text-xl font-bold text-ice">Saved commercial breakdown</h3>
            {!saved?<p className="mt-3 text-sm text-muted-foreground">The full model output appears after successful validation and storage. If the service is unavailable, no report will be shown as saved.</p>:<>
              <p className="mt-2 text-xs text-mint">Saved · {saved.studioLinked?"Linked to verified studio":"Unverified visitor scenario"}</p>
              <dl className="mt-5 space-y-3">{Object.entries(saved.result).filter(([,v])=>typeof v==="number"||v===null).map(([key,v])=><div key={key} className="flex justify-between gap-3 border-b border-border pb-3 text-sm">
                <dt className="text-muted-foreground">{labelFor(key)}</dt>
                <dd className="text-right font-bold text-ice">{v===null?"Not measurable":key.endsWith("_gbp")?money(v):fmt(v as number)}</dd>
              </div>)}</dl>
              <p className="mt-4 break-all text-xs text-muted-foreground">Submission reference: {saved.submissionId}</p>
              <button type="button" className="mt-4 text-sm font-semibold text-mint underline" onClick={()=>window.print()}>Print this breakdown</button>
            </>}
          </div>
          <a href="/studio-growth-check?source=commercial-simulator" className="block rounded-2xl border border-border bg-ink p-5 text-sm font-bold text-mint hover:border-mint">Request a free studio Growth Check →</a>
          <p className="text-xs text-muted-foreground">No CRM lead or contact consent is created by saving a scenario. The Growth Check has a separate contact and conversion process.</p>
        </aside>
      </div>
    </div>
  </section>;
}
