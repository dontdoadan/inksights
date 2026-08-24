import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, BatteryMedium, Brain, Clock3, Gauge, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import {
  ArticleLayout,
  Card,
  Disclaimer,
  JsonLd,
  PageHero,
  PrimaryButton,
  PublicShell,
  SourceList,
} from "@/components/public-site";

const CANONICAL_URL = "https://getinksight.co.uk/tools/tattoo-pain-chart-reality-check";

export const Route = createFileRoute("/tools/tattoo-pain-chart-reality-check")({
  component: TattooPainRealityCheck,
  head: () => ({
    meta: [
      { title: "Tattoo Pain Chart Reality Check | INKSIGHT" },
      { name: "description", content: "An honest interactive tattoo pain guide explaining placement, session length, style, stress and individual variability." },
      { property: "og:title", content: "Tattoo Pain Chart Reality Check" },
      { property: "og:description", content: "Why viral tattoo pain maps cannot predict exactly how your tattoo will feel." },
      { property: "og:url", content: CANONICAL_URL },
      { property: "og:image", content: "https://getinksight.co.uk/og/tattoo-pain-reality-check.png" },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

type Region = {
  id: string;
  label: string;
  group: string;
  base: number;
  explanation: string;
};

const regions: Region[] = [
  { id: "outer-upper-arm", label: "Outer upper arm", group: "Arms", base: 2, explanation: "More padding and a broad working area often make this one of the more manageable placements." },
  { id: "inner-upper-arm", label: "Inner upper arm", group: "Arms", base: 4, explanation: "Thinner, softer skin and proximity to the armpit can make the sensation feel sharper and more intense." },
  { id: "forearm", label: "Outer forearm", group: "Arms", base: 2, explanation: "Often manageable, although the wrist and elbow ends usually feel more sensitive than the centre." },
  { id: "wrist", label: "Wrist", group: "Arms", base: 4, explanation: "Less padding, tendons and frequent movement can make the experience more concentrated." },
  { id: "elbow", label: "Elbow and ditch", group: "Arms", base: 5, explanation: "Bone, thin skin, vibration and the sensitive elbow ditch make this a commonly difficult area." },
  { id: "shoulder", label: "Shoulder cap", group: "Torso", base: 2, explanation: "The rounded muscle usually offers a relatively forgiving surface, though the collarbone edge is different." },
  { id: "chest", label: "Chest", group: "Torso", base: 4, explanation: "Pain varies substantially between the padded pec area, sternum and collarbone." },
  { id: "ribs", label: "Ribs and sternum", group: "Torso", base: 5, explanation: "Thin coverage over bone, breathing movement and vibration often make these areas demanding." },
  { id: "back", label: "Upper back", group: "Torso", base: 3, explanation: "Broad muscle can be manageable, while the spine, shoulder blades and lower ribs are usually more sensitive." },
  { id: "thigh", label: "Outer thigh", group: "Legs", base: 2, explanation: "A broad, padded area that many people tolerate relatively well during larger work." },
  { id: "inner-thigh", label: "Inner thigh", group: "Legs", base: 5, explanation: "Soft, sensitive skin and proximity to the groin can make this area feel disproportionately intense." },
  { id: "knee", label: "Knee and ditch", group: "Legs", base: 5, explanation: "Bone, vibration, movement and the sensitive back of the knee make both sides challenging." },
  { id: "calf", label: "Calf", group: "Legs", base: 3, explanation: "The muscle can be manageable, but the shin edge, ankle and back of the knee increase sensitivity." },
  { id: "ankle-foot", label: "Ankle and foot", group: "Legs", base: 5, explanation: "Little padding, many small structures and difficult healing conditions can make this a demanding placement." },
  { id: "hand-fingers", label: "Hand and fingers", group: "Other", base: 5, explanation: "Thin skin, bone, movement and repeated passes in a small area often make this feel sharp." },
  { id: "neck", label: "Neck", group: "Other", base: 5, explanation: "Thin skin, vibration, sound and a strong sense of vulnerability can amplify the experience." },
];

const scale = [
  { max: 1.7, label: "Lower relative sensitivity", description: "Often described as easier to settle into, but not painless." },
  { max: 2.7, label: "Manageable for many people", description: "Usually tolerable with normal breaks, preparation and a suitable session length." },
  { max: 3.7, label: "Moderate to demanding", description: "Likely to become tiring, particularly during long shading or repeated passes." },
  { max: 4.5, label: "Higher relative sensitivity", description: "Expect sharper, more concentrated or more fatiguing sensations." },
  { max: 99, label: "Potentially very demanding", description: "A placement or session combination many people find difficult to sustain for long periods." },
];

function TattooPainRealityCheck() {
  const [regionId, setRegionId] = useState("outer-upper-arm");
  const [session, setSession] = useState<"short" | "medium" | "long">("medium");
  const [style, setStyle] = useState<"line" | "shading" | "packing">("shading");
  const [rest, setRest] = useState<"good" | "average" | "poor">("average");
  const [anxiety, setAnxiety] = useState<"settled" | "uncertain" | "high">("uncertain");

  const selected = regions.find((region) => region.id === regionId) || regions[0];
  const result = useMemo(() => {
    const adjustments = {
      session: session === "short" ? -0.3 : session === "long" ? 0.7 : 0,
      style: style === "line" ? -0.15 : style === "packing" ? 0.45 : 0.1,
      rest: rest === "good" ? -0.25 : rest === "poor" ? 0.5 : 0,
      anxiety: anxiety === "settled" ? -0.2 : anxiety === "high" ? 0.5 : 0.1,
    };
    const score = Math.max(1, Math.min(5, selected.base + Object.values(adjustments).reduce((sum, value) => sum + value, 0)));
    return { score, band: scale.find((item) => score <= item.max) || scale[scale.length - 1] };
  }, [selected, session, style, rest, anxiety]);

  const grouped = Array.from(new Set(regions.map((region) => region.group)));

  return (
    <PublicShell>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Tattoo Pain Chart Reality Check",
        description: "An honest guide to tattoo pain variability and placement.",
        url: CANONICAL_URL,
        dateModified: "2026-07-26",
        publisher: { "@type": "Organization", name: "INKSIGHT" },
      }} />
      <PageHero
        eyebrow="Tattoo client education"
        title={<>Tattoo Pain Chart <span className="text-mint">Reality Check</span></>}
        description={<>Viral body maps look precise, but pain is a personal self-report—not a fixed number attached to a body part. Use this tool to understand relative sensitivity and the factors that can change the experience.</>}
      />

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-3xl border border-border bg-ink-deep p-6 md:p-8">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-mint" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Interactive reality check</p>
                  <h2 className="mt-1 font-display text-2xl font-black text-ice">Select the placement and context</h2>
                </div>
              </div>

              <div className="mt-7 space-y-7">
                {grouped.map((group) => (
                  <fieldset key={group}>
                    <legend className="mb-3 text-sm font-bold text-ice">{group}</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {regions.filter((region) => region.group === group).map((region) => (
                        <button
                          key={region.id}
                          type="button"
                          onClick={() => setRegionId(region.id)}
                          className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${regionId === region.id ? "border-mint bg-mint/10 text-ice" : "border-border bg-ink text-muted-foreground hover:border-mint/60 hover:text-ice"}`}
                        >
                          {region.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}

                <Factor title="Session length" icon={<Clock3 className="h-4 w-4" />} value={session} onChange={(value) => setSession(value as typeof session)} options={[["short", "Under 2 hours"], ["medium", "2–4 hours"], ["long", "5+ hours"]]} />
                <Factor title="Technique emphasis" icon={<Gauge className="h-4 w-4" />} value={style} onChange={(value) => setStyle(value as typeof style)} options={[["line", "Linework"], ["shading", "Shading"], ["packing", "Dense packing"]]} />
                <Factor title="Sleep and food" icon={<BatteryMedium className="h-4 w-4" />} value={rest} onChange={(value) => setRest(value as typeof rest)} options={[["good", "Well prepared"], ["average", "Average"], ["poor", "Poorly prepared"]]} />
                <Factor title="Anticipation" icon={<Brain className="h-4 w-4" />} value={anxiety} onChange={(value) => setAnxiety(value as typeof anxiety)} options={[["settled", "Settled"], ["uncertain", "Unsure"], ["high", "Very anxious"]]} />
              </div>
            </div>

            <div className="rounded-3xl border border-mint/40 bg-gradient-to-br from-ink-elev to-ink p-7 md:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Relative result</p>
              <div className="mt-4 font-display text-6xl font-black text-ice">{result.score.toFixed(1)}<span className="text-2xl text-muted-foreground"> / 5</span></div>
              <h2 className="mt-5 font-display text-3xl font-black text-mint">{result.band.label}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{result.band.description}</p>
              <div className="mt-7 rounded-2xl border border-border bg-ink-deep p-5">
                <h3 className="font-bold text-ice">{selected.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selected.explanation}</p>
              </div>
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/35 bg-amber-300/10 p-5 text-sm leading-relaxed text-amber-100">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
                This is an educational comparison, not a clinical prediction. Two people can validly report very different pain in the same placement.
              </div>
            </div>
          </div>
        </div>
      </section>

      <ArticleLayout aside={
        <Card className="bg-ink">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Preparation basics</p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>✓ Sleep properly where possible</li>
            <li>✓ Eat and hydrate before the appointment</li>
            <li>✓ Wear practical clothing for the placement</li>
            <li>✓ Agree realistic breaks with the artist</li>
            <li>✓ Do not hide illness or relevant medication</li>
            <li>✓ Ask before using numbing products</li>
          </ul>
          <div className="mt-6"><PrimaryButton href="/resources">More client guides</PrimaryButton></div>
        </Card>
      }>
        <Disclaimer>
          This page does not assess medical suitability, prescribe pain relief or replace advice from your tattoo artist or healthcare professional. Do not alter medication or use topical anaesthetic without appropriate advice.
        </Disclaimer>

        <h2>Why most tattoo pain charts overpromise</h2>
        <p>
          A typical tattoo pain chart colours a body silhouette from green to red and presents the result as though every person will feel the same thing. That is useful as a rough conversation starter, but it is not a scientific measuring instrument.
        </p>
        <p>
          Pain is inherently subjective. Clinical pain assessment still relies heavily on the person's own report because the experience cannot be read directly from a body location or external observation. The same principle applies to tattooing: a placement can be relatively sensitive without predicting your exact score.
        </p>

        <h2>Placement matters—but it is not the whole answer</h2>
        <p>Body area changes the sensation through several overlapping factors:</p>
        <ul>
          <li><strong>Padding:</strong> broad muscle or fatty tissue can reduce the concentrated sensation compared with thin skin over bone.</li>
          <li><strong>Vibration:</strong> work over ribs, sternum, ankle, elbow or knee can create a strong vibrating or resonant feeling.</li>
          <li><strong>Skin sensitivity:</strong> inner limbs, ditches, armpit-adjacent areas and the groin can feel much sharper.</li>
          <li><strong>Movement:</strong> breathing, twitching and joint movement can make the placement harder to settle into.</li>
          <li><strong>Healing conditions:</strong> hands, feet and joints may be difficult not only during tattooing but during daily movement afterwards.</li>
        </ul>

        <h2>Session length changes the experience</h2>
        <p>
          The first hour of a tattoo and the fifth hour of the same tattoo are not equivalent. Repeated passes, swelling, fatigue, hunger, position discomfort and anticipation can make a manageable placement become significantly harder later in the day.
        </p>
        <blockquote>
          A useful question is not only “How painful is this body part?” but “How long can I sit well for this technique in this position?”
        </blockquote>

        <h2>Linework, shading and packing feel different</h2>
        <p>
          Linework is often described as sharper and more clearly defined. Shading may feel scratchier or more diffuse. Dense black or colour packing can become tiring because the artist repeatedly works the same area. None is universally worse; technique, machine setup, artist approach, skin and session order all matter.
        </p>

        <h2>What an honest chart can tell you</h2>
        <p>An honest pain guide can help with planning rather than prediction:</p>
        <ul>
          <li>Choose a realistic first placement.</li>
          <li>Decide whether a long day or shorter sessions suit you better.</li>
          <li>Discuss breaks before the appointment rather than during a crisis point.</li>
          <li>Understand why a sensitive boundary—such as wrist, elbow or ditch—may feel different from the centre of a larger piece.</li>
          <li>Separate normal discomfort from feeling faint, unwell or unable to continue safely.</li>
        </ul>

        <h2>When to stop trying to prove a point</h2>
        <p>
          Sitting well does not mean staying silent until you feel unwell. Tell the artist if you feel faint, nauseated, confused, unusually unwell or unable to maintain the required position. A professional session can be paused, shortened or rescheduled; endurance is not a measure of character.
        </p>

        <SourceList sources={[
          {
            label: "International Association for the Study of Pain — revised definition and notes",
            href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7680716/",
            note: "Pain is described as a personal experience influenced by biological, psychological and social factors.",
          },
          {
            label: "NCBI Bookshelf — measurement of subjective pain states",
            href: "https://www.ncbi.nlm.nih.gov/books/NBK219245/",
            note: "Explains why pain measurement commonly depends on self-report.",
          },
          {
            label: "PubMed — professionals underestimate patients' pain",
            href: "https://pubmed.ncbi.nlm.nih.gov/29351169/",
            note: "Supports taking the individual's report seriously rather than assuming an external observer can rank it precisely.",
          },
        ]} />
      </ArticleLayout>
    </PublicShell>
  );
}

function Factor({
  title,
  icon,
  value,
  onChange,
  options,
}: {
  title: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <fieldset>
      <legend className="mb-3 flex items-center gap-2 text-sm font-bold text-ice">{icon}{title}</legend>
      <div className="grid grid-cols-3 gap-2">
        {options.map(([optionValue, label]) => (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={`rounded-xl border px-2 py-3 text-xs font-semibold transition ${value === optionValue ? "border-mint bg-mint/10 text-ice" : "border-border bg-ink text-muted-foreground hover:border-mint/60"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
