import type { Confidence, EvidenceClass } from "../types";

const classTone:Record<EvidenceClass,string>={VERIFIED:"border-emerald-400/30 bg-emerald-400/10 text-emerald-200",OBSERVED:"border-sky-400/30 bg-sky-400/10 text-sky-200",CALCULATED:"border-mint/30 bg-mint/10 text-mint",MODELLED:"border-violet-400/30 bg-violet-400/10 text-violet-200",HYPOTHESIS:"border-amber-400/30 bg-amber-400/10 text-amber-200"};

export function EvidenceBadge({classification,confidence}:{classification:EvidenceClass;confidence:Confidence}){
  return <span aria-label={`${classification} evidence, ${confidence.toLowerCase()} confidence`} className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black tracking-[0.12em] ${classTone[classification]}`}>{classification} · {confidence}</span>;
}
