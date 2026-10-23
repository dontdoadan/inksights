import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  candidateId: z.string().uuid(),
  claimantName: z.string().trim().min(2).max(160),
  claimantRole: z.enum(["owner","authorised_manager"]),
  evidenceUrl: z.string().trim().max(500).optional().default(""),
  evidenceSummary: z.string().trim().min(15).max(1600),
  consent: z.literal(true),
}).strict();
function response(body:unknown,status=200) {
  return new Response(JSON.stringify(body),{status,headers:{
    "content-type":"application/json; charset=utf-8","cache-control":"no-store",
    "x-content-type-options":"nosniff",
  }});
}

export const Route = createFileRoute("/api/public/studio-claim")({
  server: {handlers: {POST: async ({request}) => {
    if (request.headers.get("origin") !== new URL(request.url).origin)
      return response({error:"Origin not allowed."},403);
    const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!bearer || bearer.length>6000) return response({error:"Sign in to claim a studio."},401);
    const raw = await request.text();
    if (raw.length>8000) return response({error:"Request too large."},413);
    let input:unknown;
    try {input=JSON.parse(raw)}catch{return response({error:"Malformed submission."},400)}
    const parsed=bodySchema.safeParse(input);
    if(!parsed.success) return response({error:"Complete all required proof fields."},400);
    const v=parsed.data;
    if(v.evidenceUrl) {
      try {
        const u=new URL(v.evidenceUrl);
        if(u.protocol!=="https:" || u.username || u.password) return response({error:"Proof URL must be HTTPS."},400);
      } catch {return response({error:"Proof URL is invalid."},400)}
    }
    try {
      const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
      const {data:userData,error:userError}=await supabaseAdmin.auth.getUser(bearer);
      const user=userData?.user;
      if(userError||!user?.email||!user.email_confirmed_at) return response({error:"Verify your account email before requesting a studio claim."},401);
      const db=supabaseAdmin as any;
      const {data:studio,error:lookupError}=await db.from("studio_candidates")
        .select("id,name,payload").eq("id",v.candidateId).maybeSingle();
      if(lookupError||!studio||studio.payload?.directory_publication_status!=="public_observed_location_reviewed")
        return response({error:"Studio not available for claiming."},404);
      const {data:other,error:ownerError}=await db.from("studio_directory_claims")
        .select("id").eq("candidate_id",v.candidateId).eq("status","verified").neq("user_id",user.id).limit(1);
      if(ownerError)return response({error:"Verification temporarily unavailable."},503);
      if((other??[]).length) return response({error:"This profile is already verified. Contact INKSIGHTS for a reviewed ownership transfer."},409);
      const {createHash}=await import("node:crypto");
      const hash=createHash("sha256").update("studio-claim:"+user.id+":"+v.candidateId).digest("hex");
      const windowStart=new Date(Math.floor(Date.now()/3600000)*3600000).toISOString();
      const gate=await db.rpc("consume_public_endpoint_rate_limit",{
        p_endpoint:"studio-claim-v1",p_key_hash:hash,p_window_started_at:windowStart,p_max_requests:3,
      });
      if(gate.error)return response({error:"Verification temporarily unavailable."},503);
      if(gate.data!==true)return response({error:"Too many requests. Try later."},429);
      const {data:existing}=await db.from("studio_directory_claims")
        .select("id,status").eq("candidate_id",v.candidateId).eq("user_id",user.id).maybeSingle();
      if(existing) return response({ok:true,claimId:existing.id,status:existing.status,reviewRequired:true});
      const {data:created,error:insertError}=await db.from("studio_directory_claims")
        .insert({candidate_id:v.candidateId,user_id:user.id,email:user.email,claimant_name:v.claimantName,
          claimant_role:v.claimantRole,evidence_url:v.evidenceUrl||null,evidence_summary:v.evidenceSummary,status:"pending_review"})
        .select("id,status").single();
      if(insertError||!created) {
        if(insertError?.code==="23505") return response({ok:true,status:"pending_review",reviewRequired:true});
        console.error("Owner claim storage rejected",insertError?.code||"unknown");
        return response({error:"Unable to save verification request."},503);
      }
      return response({ok:true,claimId:created.id,status:"pending_review",reviewRequired:true},202);
    } catch(e) {
      console.error("Owner claim service failed",e instanceof Error?e.message:"unknown");
      return response({error:"Verification temporarily unavailable."},503);
    }
  }}},
});
