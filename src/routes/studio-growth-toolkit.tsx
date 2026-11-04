import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, BarChart3, CheckCircle2, ChevronRight, ClipboardList, Gauge, Handshake, ShieldCheck, TrendingUp } from "lucide-react";
import { JsonLd, PageHero, PublicShell } from "@/components/public-site";

type ToolKey = "studio_growth_constraint" | "revenue_lift_90_day" | "studio_revenue_scenario" | "revenue_leakage_27" | "studio_partnership_planner";
const TOOL_VERSION="2026-10-toolkit-v1";
const CONSENT_VERSION="2026-10-tool-v1";
const CANONICAL="https://getinksights.co.uk/studio-growth-toolkit";
const TOOLS = [
  {key:"studio_growth_constraint",number:"01",name:"Growth Constraint Diagnostic",detail:"12 rated questions · 3 commercial levers",icon:Gauge},
  {key:"revenue_lift_90_day",number:"02",name:"90-Day Revenue Lift",detail:"Current numbers versus a measurable 90-day target",icon:TrendingUp},
  {key:"studio_revenue_scenario",number:"03",name:"Revenue Scenario Calculator",detail:"Capacity-capped monthly revenue modelling",icon:BarChart3},
  {key:"revenue_leakage_27",number:"04",name:"27-Point Leakage Audit",detail:"Booking, capacity and client-continuity controls",icon:ClipboardList},
  {key:"studio_partnership_planner",number:"05",name:"Partnership Planner",detail:"Evaluate up to three commercial partners",icon:Handshake},
] as const;
const DIAGNOSTIC=[
  ["Acquisition & enquiries","We know which channels produce qualified studio enquiries.","We track enquiry source and acquisition cost consistently.","Our website and artist pages direct enquiries to a clear booking route.","We have a documented response and referral process."],
  ["Booking & value","Clients understand project scope, booking terms and deposits.","We measure the proportion of qualified enquiries becoming deposits.","Our prices reflect realised session value and the costs of delivery.","We monitor cancellations and recover suitable diary gaps."],
  ["Continuity & retention","Multi-session projects have an agreed scheduling pathway.","We follow up after sessions and collect healed-work feedback.","We ask suitable clients for reviews or referrals systematically.","We measure return bookings and reactivate appropriate past clients."],
] as const;
const AUDIT_GROUPS=[
  {name:"Enquiry and booking conversion",items:[
    "Every high-intent page has a clear request-to-book action.",
    "Artist pages route prospective clients to the right booking path.",
    "New enquiries are assigned an owner and response target.",
    "Enquiry source and timestamp are captured in one log.",
    "Tattoo requests are qualified consistently before quoting.",
    "Deposit terms are explained before a slot is reserved.",
    "Booking confirmations and reminders are consistent.",
    "Cancelled bookings and reasons are recorded.",
    "Enquiries, qualified projects, deposits and attended sessions can be reconciled.",
  ]},
  {name:"Capacity and commercial economics",items:[
    "Available workstations and realistic shared-bed constraints are documented.",
    "Artist availability is reconciled against studio workstation availability.",
    "Sellable artist-hours are measured for a consistent reporting period.",
    "Attended session-hours are recorded separately from booked hours.",
    "A waitlist or equivalent process helps refill cancelled slots.",
    "Minimum charges, hourly and day prices follow documented rules.",
    "High-demand styles and service mixes are assessed by realised value.",
    "Consumables, commissions, rent and payment fees are included in contribution decisions.",
    "Revenue per attended and available artist-hour can be calculated.",
  ]},
  {name:"Continuity, loyalty and partnerships",items:[
    "Large projects have a documented session and follow-up plan.",
    "Multi-session deposit treatment is clearly explained and recorded.",
    "Aftercare and appropriate post-session support are standardised.",
    "Healed photos and follow-up consent are requested appropriately.",
    "Clients are invited to leave honest reviews without prohibited incentives.",
    "Suitable clients receive a structured but non-pressured referral ask.",
    "Eligible past clients can be reactivated with lawful communications.",
    "Repeat-client value and appointment frequency are measured.",
    "Relevant partners are tracked from referral to attended appointment.",
  ]},
] as const;
const ECON=[
  {id:"new_enquiries",name:"New-project enquiries / month",hint:"Do not include repeat sessions already booked.",step:"1",placeholder:"120"},
  {id:"enquiry_to_deposit_pct",name:"Enquiry to deposit (%)",hint:"Deposits received ÷ new-project enquiries.",step:"0.1",placeholder:"35"},
  {id:"repeat_booked_sessions",name:"Repeat sessions already booked",hint:"Existing client sessions, excluded from new enquiries.",step:"1",placeholder:"22"},
  {id:"attendance_pct",name:"Attendance rate (%)",hint:"Sessions attended ÷ all booked sessions.",step:"0.1",placeholder:"94"},
  {id:"value_per_session_gbp",name:"Revenue / attended session (£)",hint:"Realised revenue, not total lifetime project value.",step:"0.01",placeholder:"320"},
  {id:"session_hours",name:"Average session duration (hours)",hint:"Use the same mix of work in both scenarios.",step:"0.25",placeholder:"4"},
  {id:"sellable_artist_hours",name:"Sellable artist-hours / month",hint:"Account for chairs, artists and operating hours.",step:"0.5",placeholder:"560"},
] as const;
const PARTNER_CRITERIA=[
  {id:"audience_fit",name:"Audience alignment"},
  {id:"trust",name:"Audience trust"},
  {id:"distribution",name:"Distribution potential"},
  {id:"mutual_value",name:"Fair mutual economics"},
  {id:"decision_access",name:"Decision-maker access"},
] as const;
type EconomicValues=Record<string,string>;
type PartnerEntry={name:string;audience_fit:string;trust:string;distribution:string;mutual_value:string;decision_access:string};
type Result = {
  kind:"score"|"economics"|"partners";title:string;headline:string;priority:string;score?:number;max_score?:number;
  sections?:Array<{name:string;score:number;max_score:number}>;
  partners?:Array<{name:string;score:number;max_score:number}>;
  current?:{monthly_revenue_gbp:number;completed_sessions:number;utilisation_pct:number;capacity_limited:boolean};
  target?:{monthly_revenue_gbp:number;completed_sessions:number;utilisation_pct:number;capacity_limited:boolean};
  monthly_difference_gbp?:number;relative_difference_pct?:number|null;actions:string[];caveats:string[];evidence_label:string;
};
const formatMoney=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(n);
const blankPartner=():PartnerEntry=>({name:"",audience_fit:"",trust:"",distribution:"",mutual_value:"",decision_access:""});
const inputClass="mt-2 w-full rounded-xl border border-border bg-ink-deep px-4 py-3 text-sm text-ice outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/20";
const labelClass="block text-sm font-semibold text-ice";
export const Route=createFileRoute("/studio-growth-toolkit")({
  component:StudioGrowthToolkit,
  head:()=>({meta:[
    {title:"Tattoo Studio Growth Toolkit | Five Interactive Tools | INKSIGHTS"},
    {name:"description",content:"Five free interactive tools for UK tattoo studio owners: growth constraints, 90-day revenue scenarios, revenue leakage, capacity and partner evaluation."},
    {property:"og:title",content:"INKSIGHTS Studio Growth Intelligence Toolkit"},
    {property:"og:url",content:CANONICAL},
  ],links:[{rel:"canonical",href:CANONICAL}]}),
});
function InputField({label,children,description}:{label:string;children:ReactNode;description?:string}) {
  return <label className={labelClass}>{label}{children}{description?<span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">{description}</span>:null}</label>;
}
function StudioGrowthToolkit(){
  const [tool,setTool]=useState<ToolKey>("studio_growth_constraint");
  const [ratings,setRatings]=useState<number[]>(Array(12).fill(0));
  const [checks,setChecks]=useState<boolean[]>(Array(27).fill(false));
  const [current,setCurrent]=useState<EconomicValues>({});
  const [target,setTarget]=useState<EconomicValues>({});
  const [partners,setPartners]=useState<PartnerEntry[]>([blankPartner(),blankPartner(),blankPartner()]);
  const [studio,setStudio]=useState({name:"",website:"",area:"",artistCount:""});
  const [contact,setContact]=useState({name:"",email:"",followUpRequested:false,marketingConsent:false});
  const [acknowledged,setAcknowledged]=useState(false);
  const [submission,setSubmission]=useState<{id:string;result:Result}|null>(null);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const submissionKey=useRef<string|null>(null);
  const resultRef=useRef<HTMLDivElement|null>(null);
  function invalidate(){setSubmission(null);setError("");submissionKey.current=null;}
  function switchTool(next:ToolKey){setTool(next);invalidate();}
  function economicPayload(source:EconomicValues) {
    return Object.fromEntries(ECON.map(field=>[field.id,source[field.id]===""||source[field.id]===undefined?null:Number(source[field.id])]));
  }
  function createAnswers():unknown {
    if(tool==="studio_growth_constraint")return {ratings};
    if(tool==="revenue_leakage_27")return {checks};
    if(tool==="studio_partnership_planner")return {partners:partners.filter(p=>p.name.trim().length>0).map(p=>({
      name:p.name,...Object.fromEntries(PARTNER_CRITERIA.map(f=>[f.id,p[f.id]===""?null:Number(p[f.id])]))
    }))};
    return {current:economicPayload(current),target:economicPayload(target)};
  }
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(busy)return;
    setSubmission(null);setError("");
    if(!acknowledged){setError("Acknowledge the assessment data notice before submitting.");return;}
    if(tool==="studio_growth_constraint"&&ratings.some(r=>r<1)){setError("Answer all twelve diagnostic questions.");return;}
    if((tool==="revenue_lift_90_day"||tool==="studio_revenue_scenario") && ECON.some(field=>
      current[field.id]===""||current[field.id]===undefined||target[field.id]===""||target[field.id]===undefined)){
      setError("Enter current and target values for all seven financial model inputs.");return;
    }
    if(tool==="studio_partnership_planner"&&partners.every(p=>!p.name.trim())){setError("Name at least one potential partner.");return;}
    const key=submissionKey.current??crypto.randomUUID();
    submissionKey.current=key;
    setBusy(true);
    try{
      const response=await fetch("/api/public/studio-toolkit-submit",{
        method:"POST",headers:{"content-type":"application/json"},credentials:"same-origin",
        body:JSON.stringify({
          toolKey:tool,toolVersion:TOOL_VERSION,submissionKey:key,
          consentVersion:CONSENT_VERSION,dataNoticeAccepted:acknowledged,
          studio:{name:studio.name,website:studio.website,area:studio.area,artistCount:Number(studio.artistCount)},
          contact,answers:createAnswers(),website_honeypot:"",
        }),
      });
      const responseData=await response.json() as {submissionId?:string;result?:Result;error?:string};
      if(!response.ok||!responseData.submissionId||!responseData.result)throw new Error(responseData.error||"Could not save your result.");
      setSubmission({id:responseData.submissionId,result:responseData.result});
      window.setTimeout(()=>resultRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),50);
    }catch(err){
      setError(err instanceof Error?err.message:"Submission failed. Please retry.");
      setSubmission(null);
    }finally{setBusy(false);}
  }
  const active=TOOLS.find(t=>t.key===tool)!;
  return <PublicShell>
    <JsonLd data={{"@context":"https://schema.org","@type":"WebPage",name:"INKSIGHTS Studio Growth Toolkit",url:CANONICAL,
      description:"Five interactive UK tattoo studio assessment tools; results are self-reported or modelled."}}/>
    <PageHero eyebrow="Interactive studio intelligence"
      title={<>Understand the constraint.<br/><span className="text-mint">Make the next decision.</span></>}
      description="Five practical assessments for multi-artist UK tattoo studios. Score existing systems, model capacity-aware scenarios and identify what to investigate before committing to a change."/>
    <section className="border-y border-border bg-ink-deep">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-6 md:py-16">
        <div className="mb-7 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span className="rounded-full border border-mint/35 bg-mint/10 px-3 py-2 text-mint">Built for UK studios</span>
          <span>3–8 artists: primary ICP</span><span>Free to use</span><span>Results saved before display</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" role="tablist" aria-label="Select your assessment">
          {TOOLS.map(t=>{const Icon=t.icon;const selected=t.key===tool;return (
            <button key={t.key} type="button" role="tab" aria-selected={selected} onClick={()=>switchTool(t.key)}
              className={"min-h-44 rounded-2xl border p-5 text-left transition focus-visible:outline-2 focus-visible:outline-mint "+
                (selected?"border-mint/70 bg-mint/10 shadow-[0_0_28px_rgba(0,224,209,.09)]":"border-border bg-ink hover:border-mint/40")}>
              <div className="flex items-center justify-between"><span className="font-mono text-xs text-mint">{t.number}</span><Icon className="h-6 w-6 text-mint"/></div>
              <span className="mt-5 block font-display text-lg font-black leading-snug text-ice">{t.name}</span>
              <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{t.detail}</span>
            </button>);
          })}
        </div>
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,.8fr)]">
          <form className="min-w-0 rounded-3xl border border-border bg-ink p-5 md:p-8" onSubmit={submit}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
              <div><div className="font-mono text-xs font-bold tracking-[.16em] text-mint">ASSESSMENT {active.number} / 05</div>
                <h2 className="mt-2 font-display text-2xl font-black text-ice md:text-3xl">{active.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Answer based on the studio's current operating model. Unknown figures should be measured rather than guessed.</p>
              </div>
            </div>
            <div className="py-7">
              {tool==="studio_growth_constraint"?<div className="space-y-8">
                {DIAGNOSTIC.map((group,gi)=><fieldset key={gi} className="space-y-4">
                  <legend className="mb-5 text-base font-black text-ice"><span className="mr-2 text-mint">0{gi+1}</span>{group[0]}</legend>
                  {group.slice(1).map((q,qi)=>{const index=gi*4+qi;return <div key={index} className="rounded-2xl border border-border bg-ink-deep p-4">
                    <p className="text-sm font-semibold leading-relaxed text-ice">{String(index+1).padStart(2,"0")}. {q}</p>
                    <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label={"Rating for question "+(index+1)}>
                      {[1,2,3,4,5].map(v=><label key={v} className={"cursor-pointer rounded-lg border px-4 py-2 text-sm font-bold transition "+
                        (ratings[index]===v?"border-mint bg-mint text-ink-deep":"border-border bg-ink text-muted-foreground hover:border-mint/60")}>
                        <input className="sr-only" type="radio" name={"rating"+index} value={v} checked={ratings[index]===v}
                          onChange={()=>{setRatings(all=>all.map((x,i)=>i===index?v:x));invalidate();}}/>{v}
                      </label>)}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">1 = absent or inconsistent · 5 = consistently measured and implemented</p>
                  </div>})}
                </fieldset>)}
              </div>:null}
              {tool==="revenue_leakage_27"?<div className="space-y-8">
                {AUDIT_GROUPS.map((g,gi)=><fieldset key={g.name}>
                  <legend className="mb-4 text-base font-black text-ice"><span className="mr-2 text-mint">0{gi+1}</span>{g.name}</legend>
                  <div className="space-y-2">{g.items.map((item,i)=>{const idx=gi*9+i;return <label key={idx} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-ink-deep px-4 py-3 text-sm leading-relaxed text-ice hover:border-mint/40">
                    <input type="checkbox" checked={checks[idx]} onChange={e=>{setChecks(a=>a.map((v,j)=>j===idx?e.target.checked:v));invalidate();}}
                      className="mt-1 h-4 w-4 shrink-0 accent-[#00E0D1]"/><span><span className="mr-2 font-mono text-xs text-mint">{String(idx+1).padStart(2,"0")}</span>{item}</span>
                  </label>})}</div>
                </fieldset>)}
              </div>:null}
              {(tool==="revenue_lift_90_day"||tool==="studio_revenue_scenario")?<div>
                <p className="text-sm leading-relaxed text-muted-foreground">Use the same representative month for both scenarios. Only count <strong className="text-ice">new-project enquiries</strong> in the first field; repeat sessions already on the books have their own field. This prevents double counting.</p>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {(["current","target"] as const).map(mode=><div key={mode} className="min-w-0 rounded-2xl border border-border bg-ink-deep p-4 md:p-5">
                    <div className="mb-5 flex min-h-12 items-center justify-between gap-3">
                      <h3 className="font-display text-xl font-black text-ice">{mode==="current"?"Current month":"Target month"}</h3>
                      {mode==="target"?<button type="button" onClick={()=>{setTarget({...current});invalidate();}} className="rounded-full border border-mint/40 px-3 py-1.5 text-xs font-bold text-mint hover:bg-mint/10">Copy current</button>:null}
                    </div>
                    <div className="space-y-5">{ECON.map(field=><InputField key={field.id} label={field.name} description={field.hint}>
                      <input className={inputClass} type="number" inputMode="decimal" min="0" step={field.step}
                        placeholder={field.placeholder} value={mode==="current"?(current[field.id]??""):(target[field.id]??"")}
                        onChange={e=>{const setter=mode==="current"?setCurrent:setTarget;setter(prev=>({...prev,[field.id]:e.target.value}));invalidate();}}/>
                    </InputField>)}</div>
                  </div>)}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Formula: min[(new enquiries × deposit conversion + repeat booked sessions) × attendance, sellable artist-hours ÷ session duration] × realised session revenue. This is a gross-revenue scenario, not a profit forecast.</p>
              </div>:null}
              {tool==="studio_partnership_planner"?<div className="space-y-5">
                <p className="text-sm leading-relaxed text-muted-foreground">Identify up to three complementary businesses (for example, a reputable aftercare brand, convention organiser or adjacent local service). Rate each criterion from 1 to 5; higher means stronger documented fit.</p>
                {partners.map((p,idx)=><fieldset key={idx} className="rounded-2xl border border-border bg-ink-deep p-5">
                  <legend className="px-1 font-display text-base font-black text-ice">Potential partner {idx+1}</legend>
                  <InputField label="Business / organisation">
                    <input className={inputClass} type="text" maxLength={90} placeholder="Name of business"
                      value={p.name} onChange={e=>{setPartners(a=>a.map((v,i)=>i===idx?{...v,name:e.target.value}:v));invalidate();}}/>
                  </InputField>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">{PARTNER_CRITERIA.map(c=><InputField key={c.id} label={c.name}>
                    <select className={inputClass} value={p[c.id]} onChange={e=>{setPartners(a=>a.map((v,i)=>i===idx?{...v,[c.id]:e.target.value}:v));invalidate();}}>
                      <option value="">Select score</option>{[1,2,3,4,5].map(v=><option key={v} value={v}>{v} / 5</option>)}
                    </select>
                  </InputField>)}</div>
                </fieldset>)}
              </div>:null}
            </div>
            <fieldset className="border-t border-border pt-7">
              <legend className="font-display text-xl font-black text-ice">Studio details</legend>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Connect the assessment with the correct studio. User-submitted details remain unverified until checked.</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <InputField label="Studio name *"><input required maxLength={120} className={inputClass} value={studio.name}
                  onChange={e=>{setStudio(s=>({...s,name:e.target.value}));invalidate();}} placeholder="e.g. Example Tattoo Studio"/></InputField>
                <InputField label="Number of artists *"><input required min="1" max="100" step="1" type="number" className={inputClass} value={studio.artistCount}
                  onChange={e=>{setStudio(s=>({...s,artistCount:e.target.value}));invalidate();}} placeholder="e.g. 5"/></InputField>
                <InputField label="Website (optional)"><input type="url" className={inputClass} value={studio.website}
                  onChange={e=>{setStudio(s=>({...s,website:e.target.value}));invalidate();}} placeholder="https://..."/></InputField>
                <InputField label="Town / city (optional)"><input className={inputClass} maxLength={100} value={studio.area}
                  onChange={e=>{setStudio(s=>({...s,area:e.target.value}));invalidate();}} placeholder="e.g. Croydon"/></InputField>
              </div>
            </fieldset>
            <fieldset className="mt-7 border-t border-border pt-7">
              <legend className="font-display text-xl font-black text-ice">Optional follow-up</legend>
              <p className="mt-2 text-sm text-muted-foreground">Your results appear here regardless of whether you request contact.</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <InputField label="Your name"><input className={inputClass} maxLength={100} value={contact.name}
                  onChange={e=>{setContact(s=>({...s,name:e.target.value}));invalidate();}}/></InputField>
                <InputField label="Email address"><input type="email" className={inputClass} value={contact.email}
                  onChange={e=>{setContact(s=>({...s,email:e.target.value}));invalidate();}} placeholder="owner@studio.co.uk"/></InputField>
              </div>
              <label className="mt-4 flex items-start gap-3 text-sm text-muted-foreground">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[#00E0D1]" checked={contact.followUpRequested}
                  onChange={e=>{setContact(s=>({...s,followUpRequested:e.target.checked}));invalidate();}}/>
                <span>I'd like INKSIGHTS to contact me about this specific assessment.</span>
              </label>
              <label className="mt-3 flex items-start gap-3 text-sm text-muted-foreground">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[#00E0D1]" checked={contact.marketingConsent}
                  onChange={e=>{setContact(s=>({...s,marketingConsent:e.target.checked}));invalidate();}}/>
                <span>Separately, I agree to receive occasional INKSIGHTS news and offers. Optional.</span>
              </label>
              <label className="mt-5 flex items-start gap-3 rounded-xl border border-mint/20 bg-mint/5 p-4 text-sm leading-relaxed text-ice">
                <input required type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#00E0D1]" checked={acknowledged}
                  onChange={e=>{setAcknowledged(e.target.checked);invalidate();}}/>
                <span>I understand INKSIGHTS will securely save my answers to deliver this result and develop its studio intelligence dataset. These answers are <strong>self-reported, not verified benchmarks.</strong> See the <a href="/privacy" className="font-bold text-mint underline">privacy notice</a>.</span>
              </label>
            </fieldset>
            {error?<div role="alert" className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{error}</div>:null}
            <button disabled={busy} type="submit" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-mint px-6 py-4 text-base font-black text-ink-deep transition hover:bg-mint-soft disabled:cursor-not-allowed disabled:opacity-50">
              {busy?"Saving and calculating…":"Save answers and reveal my results"}<ArrowRight className="h-5 w-5"/>
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Your score or financial scenario is never shown until successfully saved. No payment required.</p>
          </form>
          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-mint/25 bg-ink p-6">
              <ShieldCheck className="h-8 w-8 text-mint"/>
              <h2 className="mt-5 font-display text-xl font-black text-ice">Evidence before recommendations.</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The toolkit shows which systems may deserve attention. The £395 Studio Intelligence Audit examines actual studio evidence, the customer journey and commercial decisions in more depth.</p>
              <a href="/offers/studio-intelligence-audit" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-mint">Explore the Studio Intelligence Audit <ChevronRight className="h-4 w-4"/></a>
            </div>
            <div className="rounded-3xl border border-border bg-ink p-6">
              <h3 className="font-display text-lg font-black text-ice">How results are classified</h3>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p><strong className="text-ice">Self-reported:</strong> ratings, checklists and partner judgements supplied by the studio.</p>
                <p><strong className="text-ice">Modelled:</strong> calculations based on the numbers and assumptions entered.</p>
                <p><strong className="text-ice">Verified:</strong> requires independent sources or reconciled studio records. This toolkit does not automatically verify your input.</p>
              </div>
              <a href="/research-methodology" className="mt-5 inline-block text-sm font-bold text-mint">Read the research methodology →</a>
            </div>
          </aside>
        </div>
      </div>
    </section>
    {submission?<section ref={resultRef} id="studio-toolkit-results" className="scroll-mt-24 border-y border-mint/30 bg-ink py-14" aria-live="polite">
      <div className="mx-auto max-w-5xl px-5 md:px-6">
        <div className="flex flex-wrap items-center gap-3"><CheckCircle2 className="h-7 w-7 text-mint"/><span className="text-xs font-black uppercase tracking-[.18em] text-mint">Saved · {submission.result.evidence_label}</span></div>
        <h2 className="mt-5 font-display text-3xl font-black tracking-tight text-ice md:text-5xl">{submission.result.headline}</h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">Submission ID: <code className="break-all text-ice">{submission.id}</code> · Scores and calculations were produced server-side and saved as an immutable versioned snapshot.</p>
        {submission.result.kind==="score"&&typeof submission.result.score==="number"?<div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-mint/50 bg-mint/10 p-5"><p className="text-xs font-bold uppercase tracking-widest text-mint">Total score</p><p className="mt-3 font-display text-4xl font-black text-ice">{submission.result.score}<span className="text-base text-muted-foreground"> / {submission.result.max_score}</span></p></div>
          {submission.result.sections?.map((s,i)=><div key={s.name} className="rounded-2xl border border-border bg-ink-deep p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-mint">0{i+1} / LEVER</p><p className="mt-2 min-h-12 text-sm font-bold text-ice">{s.name}</p>
            <p className="mt-3 text-3xl font-black text-ice">{s.score}<span className="text-sm text-muted-foreground"> / {s.max_score}</span></p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-mint" style={{width:(s.score/s.max_score*100)+"%"}}/></div>
          </div>)}
        </div>:null}
        {submission.result.kind==="economics"&&submission.result.current&&submission.result.target?<div className="mt-8 grid gap-4 md:grid-cols-3">
          {[["Current monthly model",submission.result.current.monthly_revenue_gbp],["Target monthly model",submission.result.target.monthly_revenue_gbp],["Monthly difference",submission.result.monthly_difference_gbp??0]].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-border bg-ink-deep p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-mint">{label}</p><p className="mt-3 font-display text-3xl font-black text-ice">{formatMoney(Number(value))}</p>
          </div>)}
          <p className="md:col-span-3 text-sm text-muted-foreground">Current: {submission.result.current.completed_sessions} modelled attended sessions ({submission.result.current.utilisation_pct}% sellable hours). Target: {submission.result.target.completed_sessions} attended sessions ({submission.result.target.utilisation_pct}%).</p>
        </div>:null}
        {submission.result.kind==="partners"?<div className="mt-8 grid gap-4 md:grid-cols-3">{submission.result.partners?.map((p,i)=><div key={p.name} className="rounded-2xl border border-border bg-ink-deep p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-mint">Rank {i+1}</p><h3 className="mt-3 text-lg font-black text-ice">{p.name}</h3>
          <p className="mt-3 font-display text-3xl font-black text-mint">{p.score}<span className="text-base text-muted-foreground"> / {p.max_score}</span></p>
        </div>)}</div>:null}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-mint/30 bg-mint/5 p-6">
            <h3 className="font-display text-xl font-black text-ice">Next actions to investigate</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ice">{submission.result.actions.map((a,i)=><li key={i} className="flex gap-3"><span className="font-mono font-black text-mint">0{i+1}</span>{a}</li>)}</ul>
          </div>
          <div className="rounded-2xl border border-border bg-ink-deep p-6"><h3 className="font-display text-xl font-black text-ice">Interpretation and limits</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">{submission.result.caveats.map((c,i)=><li key={i}>• {c}</li>)}</ul>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/offers/studio-intelligence-audit" className="inline-flex items-center gap-2 rounded-full bg-mint px-6 py-3 font-black text-ink-deep">Investigate your priority with INKSIGHTS <ArrowRight className="h-4 w-4"/></a>
          <button type="button" className="rounded-full border border-border px-6 py-3 text-sm font-bold text-ice hover:border-mint"
            onClick={()=>navigator.clipboard?.writeText("INKSIGHTS "+submission.result.title+"\n"+submission.result.headline+"\n"+submission.result.actions.join("\n"))}>
            Copy result summary
          </button>
        </div>
      </div>
    </section>:null}
  </PublicShell>;
}
