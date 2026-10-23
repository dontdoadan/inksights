// INKSIGHTS acquisition research — deterministic, read-only qualification.
// Pure functions: no CRM/database writes and no unverified revenue estimates.
export const VERSION = 'industry-intelligence-v1.0.0';

const words = value => String(value ?? '').trim();
export function normaliseName(value) {
  return words(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
}
export function normalisePostcode(value) {
  return words(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
}
export function websiteDomain(value) {
  if (!words(value)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : 'https://' + value);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (!host || ['facebook.com','instagram.com','tiktok.com','linktr.ee','booking.com','yell.com'].includes(host)) return null;
    return host;
  } catch { return null; }
}
// Location-aware: same brand website in different postcodes must not merge.
export function identityKey(candidate) {
  const pc = normalisePostcode(candidate.normalized_postcode || candidate.postcode);
  const domain = websiteDomain(candidate.website_url);
  if (domain && pc) return 'domain-postcode:' + domain + ':' + pc;
  if (pc && normaliseName(candidate.name)) return 'name-postcode:' + normaliseName(candidate.name) + ':' + pc;
  return null; // insufficient independent identifiers: manual resolution only
}
export function artistCount(candidate) {
  const raw = candidate.payload?.artist_count ?? candidate.artist_count;
  if (raw === null || raw === undefined || words(raw) === '') return null;
  // A range such as '3-8' or '15+' is NOT an exact artist count.
  if (!/^\d{1,3}$/.test(words(raw))) return null;
  const n = Number(raw);
  return n > 0 && n <= 200 ? n : null;
}
export function isExcluded(candidate) {
  const text = [candidate.name, candidate.website_url, candidate.source_url].map(words).join(' ').toLowerCase();
  return /\[test|\[duplicate|\[legacy|example\.com|\.invalid\b/.test(text) ||
    ['excluded','inactive','duplicate','rejected'].includes(words(candidate.identity_status).toLowerCase());
}
const sourceWeights = { studio_website:12, owner_submission:12, companies_house:5, public_tattoo_directory:4, open_geodata:3, inksights_research_chat:2, booking_platform_listing:3 };
export function qualify(candidate) {
  if (isExcluded(candidate)) {
    return {candidate_id: candidate.id ?? '', name: words(candidate.name), score: 0,
      tier:'exclude', review_gate:'EXCLUDED', next_action:'Do not import or contact',
      reasons:['Explicit test/duplicate/legacy or invalid record'], identity_key:identityKey(candidate)};
  }
  const evidence = [];
  let score = 0;
  const count = artistCount(candidate);
  if (count !== null) {
    if (count >= 3 && count <= 8) {score += 35; evidence.push('Exact artist count in ICP range');}
    else if (count >= 2 && count <= 12) {score += 10; evidence.push('Exact artist count outside target range');}
    else evidence.push('Artist count outside target range');
  } else evidence.push('Artist count not verified');
  if (websiteDomain(candidate.website_url)) {score += 18; evidence.push('Studio website URL supplied; live status not rechecked');}
  if (normalisePostcode(candidate.postcode)) {score += 8; evidence.push('Postcode supplied');}
  if (words(candidate.town)) {score += 5; evidence.push('Town supplied');}
  if (words(candidate.phone)) {score += 3; evidence.push('Phone listed; not independently verified');}
  if (words(candidate.companies_house_number)) {score += 3; evidence.push('Corporate identity reference; not proof of active trading');}
  const source = candidate.source_key || candidate.source?.source_key || '';
  score += sourceWeights[source] ?? 0;
  const key = identityKey(candidate);
  // Readiness must be supported by actual evidence; scores only rank research.
  const identity = words(candidate.identity_status).toLowerCase();
  const sourceUrl = candidate.source_url || '';
  const needs = [];
  if (!key) needs.push('Establish reliable location identity');
  if (!count) needs.push('Verify current working artist count');
  if (!websiteDomain(candidate.website_url)) needs.push('Find official website');
  if (!sourceUrl) needs.push('Attach source reference');
  if (identity !== 'matched') needs.push('Resolve candidate against canonical studio');
  const tier = score >= 70 ? 'A-research' : score >= 40 ? 'B-research' : 'C-research';
  return {
    candidate_id:candidate.id ?? '', name:words(candidate.name), town:words(candidate.town),
    postcode:words(candidate.postcode), website:words(candidate.website_url),
    public_phone:words(candidate.phone), source_url:words(sourceUrl), source_key:source,
    identity_status:identity, artist_count:count, identity_key:key, score:Math.min(100,score),
    tier, review_gate:'RESEARCH_ONLY', crm_eligible:false,
    evidence, evidence_gaps:needs,
    next_action:needs[0] ?? 'Review public booking journey and source evidence manually'
  };
}
export function assessCandidates(candidates) {
  if (!Array.isArray(candidates)) throw new TypeError('Expected candidate array');
  const seen = new Map(); const results = [];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const result = qualify(candidate);
    if (result.identity_key && !result.tier.includes('exclude')) {
      const previous = seen.get(result.identity_key);
      if (previous) {
        // No automatic studio merge: preserve both and flag for review.
        result.review_gate = 'POSSIBLE_DUPLICATE';
        result.crm_eligible = false;
        result.evidence_gaps = ['Compare against candidate ' + previous, ...result.evidence_gaps];
      } else seen.set(result.identity_key, result.candidate_id);
    }
    results.push(result);
  }
  results.sort((a,b)=>b.score-a.score || a.name.localeCompare(b.name));
  return {version:VERSION, generated_at:new Date().toISOString(), input_count:candidates.length,
    excluded_count:results.filter(r=>r.review_gate==='EXCLUDED').length,
    duplicate_review_count:results.filter(r=>r.review_gate==='POSSIBLE_DUPLICATE').length,
    candidates:results};
}
export function csvSerialize(rows) {
  const fields=['candidate_id','name','town','postcode','website','public_phone','source_key','source_url',
    'identity_status','artist_count','score','tier','review_gate','crm_eligible','identity_key','next_action','evidence_gaps'];
  const esc=v=>'"'+String(v===null||v===undefined?'':Array.isArray(v)?v.join(' | '):v).replace(/"/g,'""')+'"';
  return [fields.map(esc).join(','), ...rows.map(r=>fields.map(f=>esc(r[f])).join(','))].join('\n')+'\n';
}
