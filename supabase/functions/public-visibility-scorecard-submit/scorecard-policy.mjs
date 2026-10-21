export const SCORECARD_VERSION = "2026-10-scorecard-v1";
export const CONSENT_VERSION = "2026-10-tool-v1";
export const SECTIONS = Object.freeze([
  { id: "local-discovery", title:"Google and local discovery", checks:["gbp-complete","gbp-active","local-pages"] },
  { id: "website", title:"Website and indexability", checks:["indexable","mobile","services"] },
  { id: "trust", title:"Portfolio and trust", checks:["portfolio","healed-work","reviews"] },
  { id: "conversion", title:"Booking and conversion", checks:["booking-clear","intake","cta"] },
  { id: "retention", title:"Retention and reputation systems", checks:["aftercare","followup","measurement"] },
]);
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALL_CHECKS = SECTIONS.flatMap(section=>section.checks);
const ID_SET = new Set(ALL_CHECKS);

export function validateScorecardInput(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {ok:false,error:"Invalid input."};
  if (typeof data.submissionKey !== "string" || !UUID_V4.test(data.submissionKey))
    return {ok:false,error:"Invalid submission identifier."};
  if (data.consentVersion !== CONSENT_VERSION || data.dataNoticeAccepted !== true)
    return {ok:false,error:"Data use acknowledgement required."};
  if (data.scorecardVersion !== SCORECARD_VERSION) return {ok:false,error:"Unsupported scorecard version."};
  if (!Array.isArray(data.checkedIds) || data.checkedIds.length > ALL_CHECKS.length)
    return {ok:false,error:"Invalid scorecard selections."};
  const unique = new Set(data.checkedIds);
  if (unique.size !== data.checkedIds.length || data.checkedIds.some(id=>typeof id!=="string" || !ID_SET.has(id)))
    return {ok:false,error:"Invalid scorecard selections."};
  const ids = ALL_CHECKS.filter(id=>unique.has(id));
  const sectionScores=SECTIONS.map(section=>({
    id:section.id, title:section.title,
    score:Math.round(section.checks.filter(id=>unique.has(id)).length/section.checks.length*100)
  }));
  const weakest = sectionScores.reduce((lowest,candidate)=>candidate.score<lowest.score?candidate:lowest,sectionScores[0]);
  const normalized={ checked_ids:ids, scorecard_version:SCORECARD_VERSION };
  const result={
    score:Math.round((ids.length/ALL_CHECKS.length)*100),
    checked_count:ids.length,
    total_checks:ALL_CHECKS.length,
    sections:sectionScores,
    weakest_area:weakest.id,
    gaps:ALL_CHECKS.filter(id=>!unique.has(id)),
    result_version:SCORECARD_VERSION,
    quality_status:"unverified_self_report"
  };
  return {ok:true,submissionKey:data.submissionKey,normalized,result};
}

export function isSameScorecard(existing, incoming) {
  if (!existing?.normalized_inputs || !incoming?.normalized || existing.consent_version!==CONSENT_VERSION) return false;
  const a=existing.normalized_inputs;const b=incoming.normalized;
  return a.scorecard_version===b.scorecard_version && Array.isArray(a.checked_ids)
    && a.checked_ids.length===b.checked_ids.length && a.checked_ids.every((v,i)=>v===b.checked_ids[i]);
}
