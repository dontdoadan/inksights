import { createClient } from "npm:@supabase/supabase-js@2";
const origins = new Set(["https://getinksights.co.uk","https://www.getinksights.co.uk","http://localhost:3000","http://localhost:5173"]);
const bands = {uk:[[80,200],[300,600],[550,1100],[80,180],[50,100]],london:[[100,280],[400,800],[750,1500],[120,250],[80,150]]} as const;
Deno.serve(async (request) => {
 const origin=request.headers.get("origin")||"";
 const headers={"Content-Type":"application/json","Access-Control-Allow-Origin":origins.has(origin)?origin:"https://getinksights.co.uk","Vary":"Origin","Access-Control-Allow-Headers":"content-type,apikey,authorization,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS","Cache-Control":"no-store"};
 const respond=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(request.method!=="POST")return respond(405,{error:"Method not allowed"});
 if(origin&&!origins.has(origin))return respond(403,{error:"Origin not allowed"});
 if(Number(request.headers.get("content-length")||0)>12000)return respond(413,{error:"Submission too large"});
 try {
  const data=await request.json();
  if(!data||typeof data!=="object"||!["uk","london"].includes(data.region)||!Array.isArray(data.prices)||data.prices.length!==5)return respond(422,{error:"Invalid pricing inputs"});
  if(!Number.isInteger(data.leadTimeWeeks)||data.leadTimeWeeks<1||data.leadTimeWeeks>26)return respond(422,{error:"Invalid booking lead time"});
  if(typeof data.submissionKey!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submissionKey))return respond(422,{error:"Invalid submission identifier"});
  if(data.consentVersion!=="2026-10-tool-v1"||data.dataNoticeAccepted!==true)return respond(422,{error:"Data use acknowledgement required"});
  const prices=data.prices.map((v:unknown)=>v===null||v===""?null:typeof v==="number"&&Number.isFinite(v)&&v>0&&v<=50000&&Math.round(v*100)===v*100?v:null);
  if(data.prices.some((v:unknown,i:number)=>v!==null&&v!==""&&prices[i]===null)||prices.every((v:number|null)=>v===null))return respond(422,{error:"Enter at least one valid price (GBP)"});
  const normalized={region:data.region,prices,lead_time_weeks:data.leadTimeWeeks};
  const market=bands[data.region as keyof typeof bands];
  const positions=prices.map((price:number|null,i:number)=>price===null?null:price<market[i][0]?"below":price>market[i][1]?"above":"within");
  const output={positions,below:positions.filter(x=>x==="below").length,above:positions.filter(x=>x==="above").length,lead_time_signal:data.leadTimeWeeks>=6?"strong":data.leadTimeWeeks>=4?"balanced":"check",reference_bands:market,dataset_version:"2026-09-05-initial"};
  const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
  const row={tool_key:"pricing_benchmark",tool_version:"1",dataset_version:"2026-09-05-initial",normalized_inputs:normalized,result_snapshot:output,submission_key:data.submissionKey,consent_version:data.consentVersion};
  const {data:saved,error}=await supabase.from("public_tool_submissions").upsert(row,{onConflict:"submission_key",ignoreDuplicates:true}).select("id").maybeSingle();
  if(error){console.error("pricing intake failed",error.code);return respond(503,{error:"Unable to save submission. Please retry."});}
  return respond(200,{submissionId:saved?.id??data.submissionKey,result:output});
 }catch{return respond(400,{error:"Unable to process submission"});}
});