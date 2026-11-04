import { createFileRoute } from "@tanstack/react-router";

const MAX_BODY_BYTES = 28_000;
export const Route = createFileRoute("/api/public/studio-toolkit-submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin=request.headers.get("origin");
        if(origin && origin!==new URL(request.url).origin)return respond(403,{error:"Cross-origin submissions are not accepted."});
        if(!request.headers.get("content-type")?.toLowerCase().includes("application/json"))return respond(415,{error:"JSON required."});
        if(Number(request.headers.get("content-length")||0)>MAX_BODY_BYTES)return respond(413,{error:"Submission is too large."});
        let payload:Record<string,unknown>;
        try {
          const raw=await request.text();
          if(new TextEncoder().encode(raw).byteLength>MAX_BODY_BYTES)return respond(413,{error:"Submission is too large."});
          const data:unknown=JSON.parse(raw);
          if(!data||Array.isArray(data)||typeof data!=="object")return respond(422,{error:"Invalid input."});
          payload=data as Record<string,unknown>;
        }catch{return respond(400,{error:"Invalid JSON."});}
        if(payload.dataNoticeAccepted!==true || payload.consentVersion!=="2026-10-tool-v1")return respond(422,{error:"Data-use acknowledgement is required."});
        const base=process.env["SUPABASE_URL"];
        const publishableKey=process.env["SUPABASE_PUBLISHABLE_KEY"];
        if(!base||!publishableKey)return respond(503,{error:"The assessment service is temporarily unavailable."});
        try{
          const upstream=await fetch(base.replace(/\/$/,"")+"/functions/v1/public-studio-toolkit-submit",{
            method:"POST",
            headers:{"content-type":"application/json","apikey":publishableKey},
            body:JSON.stringify(payload),
            signal:AbortSignal.timeout(12000),
          });
          const text=await upstream.text();
          let data:unknown;
          try{data=JSON.parse(text)}catch{throw new Error("Unparseable upstream response")}
          if(!data || Array.isArray(data) || typeof data!=="object")throw new Error("Malformed upstream response");
          const response=data as Record<string,unknown>;
          if(!upstream.ok)return respond(upstream.status>=400&&upstream.status<500?upstream.status:503,{
            error:typeof response.error==="string"?response.error:"We could not save your answers. Please retry.",
          });
          if(typeof response.submissionId!=="string"||!response.result)throw new Error("Result not persisted");
          return respond(200,{submissionId:response.submissionId,result:response.result});
        }catch(error){
          console.error("Studio toolkit proxy failed",error instanceof Error?error.name:"unknown");
          return respond(503,{error:"We could not save your answers. Please retry."});
        }
      },
    },
  },
});
function respond(status:number, body:unknown){
  return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
}
