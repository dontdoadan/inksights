import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const inputSchema = z.object({
  candidateId: z.string().uuid(),
  summary: z.string().trim().max(1200),
  specialisms: z.array(z.string().trim().min(2).max(60)).max(12),
  bookingUrl: z.string().trim().max(450).optional().default(""),
}).strict();

const json = (body: unknown, status=200) =>
  new Response(JSON.stringify(body),{status,headers:{
    "content-type":"application/json; charset=utf-8",
    "cache-control":"private, no-store", "x-content-type-options":"nosniff",
  }});

function validBookingUrl(value:string) {
  if (!value) return true;
  try { const v = new URL(value);return v.protocol === "https:" && !v.username && !v.password; }
  catch {return false;}
}

export const Route = createFileRoute("/api/studio-profile")({
  server: {handlers: {
    GET: async ({request}) => processRequest(request, "GET"),
    POST: async ({request}) => processRequest(request, "POST"),
  }},
});

async function processRequest(request: Request, method: "GET"|"POST") {
  if(method==="POST"&&request.headers.get("origin")!==new URL(request.url).origin)
    return json({error:"Invalid origin."},403);

  const token=request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if(!token||token.length>6000) return json({error:"Sign in to edit your studio profile."},401);

  let candidateId:string, input:z.infer<typeof inputSchema>|null=null;
  if(method==="POST") {
    const raw=await request.text();
    if(raw.length>6000)return json({error:"Request too large."},413);
    let body:unknown;
    try{body=JSON.parse(raw)}catch{return json({error:"Invalid profile data."},400)}
    const parsed=inputSchema.safeParse(body);
    if(!parsed.success) return json({error:"Review your profile fields."},400);
    input=parsed.data;
    if(!validBookingUrl(input.bookingUrl))return json({error:"Booking URL must be an HTTPS address."},400);
    candidateId=input.candidateId;
  } else {
    candidateId=new URL(request.url).searchParams.get("studio")||"";
    if(!z.string().uuid().safeParse(candidateId).success) return json({error:"Invalid studio."},400);
  }

  try {
    const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
    const {data:auth,error:authError}=await supabaseAdmin.auth.getUser(token);
    if(authError||!auth?.user?.email_confirmed_at)return json({error:"Verified sign-in required."},401);
    // New service-only claim/profile tables are added by approved migrations, then Database types must regenerate.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db=supabaseAdmin as any;
    const {data:claim,error:claimError}=await db.from("studio_directory_claims")
      .select("id,status,verified_at,reviewed_by,verification_method")
      .eq("candidate_id",candidateId).eq("user_id",auth.user.id)
      .eq("status","verified").maybeSingle();
    if(claimError)return json({error:"Profile verification service unavailable."},503);
    if(!claim?.verified_at||!claim?.reviewed_by||!claim?.verification_method)
      return json({error:"Your studio claim has not been verified. Contact INKSIGHTS if it is under review."},403);
    const {data:candidate,error:studioError}=await db.from("studio_candidates")
      .select("id,name,payload").eq("id",candidateId).maybeSingle();
    if(studioError||!candidate||candidate.payload?.directory_publication_status!=="public_observed_location_reviewed")
      return json({error:"This listing is unavailable for editing."},404);
    if(method==="GET") {
      const {data,error}=await db.from("studio_directory_profiles")
        .select("summary,specialisms,booking_url,updated_at").eq("candidate_id",candidateId).maybeSingle();
      if(error)return json({error:"Unable to load studio profile."},503);
      return json({ok:true,studio:{id:candidate.id,name:candidate.name},profile:{
        summary:data?.summary||"",specialisms:data?.specialisms||[],
        bookingUrl:data?.booking_url||"",updatedAt:data?.updated_at||null,
      }});
    }
    if(!input)return json({error:"Invalid input."},400);
    const {error}=await db.from("studio_directory_profiles").upsert({
      candidate_id:candidateId,summary:input.summary,
      specialisms:Array.from(new Set(input.specialisms)),
      booking_url:input.bookingUrl||null,
      owner_editor_id:auth.user.id,updated_at:new Date().toISOString(),
    },{onConflict:"candidate_id"});
    if(error){console.error("Studio profile save failure",error.code||"unknown");return json({error:"Unable to save profile."},503)}
    return json({ok:true,saved:true});
  }catch(error){
    console.error("Studio profile service failed",error instanceof Error?error.message:"unknown");
    return json({error:"Profile service unavailable."},503);
  }
}
