import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Clock3, ShieldAlert, Sparkles } from "lucide-react";
import { useState } from "react";
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

const CANONICAL_URL = "https://getinksight.co.uk/guides/grey-line-healing-week-by-week";

export const Route = createFileRoute("/guides/grey-line-healing-week-by-week")({
  component: GreyLineHealingGuide,
  head: () => ({
    meta: [
      { title: "Grey-Line Tattoo Healing Week by Week | INKSIGHT" },
      {
        name: "description",
        content:
          "What grey-line tattoos can look like on day 1, day 3, day 7 and through weeks 2–6, including normal changes and infection warning signs.",
      },
      { property: "og:title", content: "Grey-Line Healing: What to Expect Week by Week" },
      {
        property: "og:description",
        content:
          "Why structural grey lines can look dark, patchy or faded while a large tattoo project heals.",
      },
      { property: "og:url", content: CANONICAL_URL },
      { property: "og:image", content: "https://getinksight.co.uk/og/grey-line-healing.png" },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const healingStages = [
  {
    period: "Day 1",
    title: "Fresh, darker and more dramatic",
    normal:
      "The grey lines may look much darker than planned because the skin is freshly worked, slightly inflamed and may have blood, plasma or excess pigment on the surface.",
    action:
      "Follow the covering instructions given by the artist. Different dressings have different removal times, so do not replace specific studio guidance with a generic internet rule.",
  },
  {
    period: "Days 2–3",
    title: "Tight, shiny or mildly sore",
    normal:
      "Mild redness, tenderness and a tight or shiny surface can still be present. Some lines may appear thicker because the surrounding skin is irritated.",
    action:
      "Keep the area clean according to the artist's instructions, pat rather than rub and avoid unnecessary touching.",
  },
  {
    period: "Days 4–7",
    title: "Flaking can make the map look uneven",
    normal:
      "Peeling, light flaking and small areas of crusting can temporarily make diluted lines look patchy, broken or much lighter. The surface layer is changing; the final settled result cannot be judged yet.",
    action: "Do not pick, scratch or pull away flakes. Let the surface shed naturally.",
  },
  {
    period: "Week 2",
    title: "Dull, cloudy or lighter than expected",
    normal:
      "The surface may look dry or slightly cloudy. Grey lines can appear faint because diluted pigment was intentionally used and the new surface skin changes how the tattoo is seen.",
    action:
      "Continue the agreed aftercare and avoid soaking, friction and sun exposure while the area is still healing.",
  },
  {
    period: "Weeks 3–4",
    title: "The structure starts to settle",
    normal:
      "Most obvious flaking should have ended, but the tattoo can continue to settle. Some structural lines are designed to disappear beneath later shading or remain deliberately subtle.",
    action:
      "Do not request a correction based only on an early photograph. Wait for the artist's stated healed-review period.",
  },
  {
    period: "Weeks 4–6+",
    title: "Healed review, not self-diagnosis",
    normal:
      "The artist can now assess which lines healed as intended, which will be absorbed into later sessions and whether any unexpected loss needs attention.",
    action:
      "Send clear, natural-light photographs or attend the planned review. Large projects normally continue only after the area is sufficiently healed.",
  },
] as const;

type HealingCheckId =
  "mild-redness" | "flaking" | "lighter" | "increasing-redness" | "discharge" | "rash";
type HealingCheck = {
  id: HealingCheckId;
  label: string;
  status: "usually-compatible" | "medical";
  result: string;
};

const checks: readonly HealingCheck[] = [
  {
    id: "mild-redness",
    label: "Mild redness or tenderness that is improving",
    status: "usually-compatible",
    result:
      "This can be compatible with normal early healing, particularly in the first few days. Continue the artist's instructions and monitor the direction of change.",
  },
  {
    id: "flaking",
    label: "Thin flaking, peeling or small dry crusts",
    status: "usually-compatible",
    result:
      "Light peeling and crusting can occur as the surface heals. Do not pick or force it away; this can remove pigment or damage the surface.",
  },
  {
    id: "lighter",
    label: "Grey lines look much lighter after peeling",
    status: "usually-compatible",
    result:
      "Diluted structural lines can look faint once the fresh darkness and surface residue disappear. A settled assessment normally requires several weeks.",
  },
  {
    id: "increasing-redness",
    label: "Redness, heat, swelling or pain is increasing rather than improving",
    status: "medical",
    result:
      "Increasing redness, heat, swelling or pain can indicate a complication. Seek prompt medical advice rather than relying only on social media or the studio.",
  },
  {
    id: "discharge",
    label: "Pus, unpleasant discharge, spreading redness or feeling unwell",
    status: "medical",
    result:
      "These are warning signs that need prompt medical assessment. Use NHS 111, your GP or urgent care according to severity; use emergency services for life-threatening symptoms.",
  },
  {
    id: "rash",
    label: "A widespread rash, blistering or severe itching",
    status: "medical",
    result:
      "A widespread rash, blistering or severe itching is not something an online guide can diagnose. Seek medical advice, particularly if symptoms are worsening or accompanied by swelling or breathing difficulty.",
  },
];

function GreyLineHealingGuide() {
  const [selected, setSelected] = useState<HealingCheckId>("mild-redness");
  const current: HealingCheck = checks.find((item) => item.id === selected) ?? checks[0];
  const medical = current.status === "medical";

  return (
    <PublicShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Grey-Line Healing: What to Expect Week by Week",
          description: "A practical guide to grey-line tattoo healing and warning signs.",
          url: CANONICAL_URL,
          dateModified: "2026-07-26",
          publisher: { "@type": "Organization", name: "INKSIGHT" },
        }}
      />
      <PageHero
        eyebrow="Tattoo client education · Healing guide"
        title={
          <>
            Grey-Line Healing: <span className="text-mint">What to Expect Week by Week</span>
          </>
        }
        description={
          <>
            Grey-lining is often a structural stage in a larger tattoo project. It can heal lighter,
            duller and less complete than a finished tattoo because it was never intended to be the
            final shaded result.
          </>
        }
      />

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">
                Week-by-week reality
              </p>
              <div className="mt-6 space-y-4">
                {healingStages.map((stage) => (
                  <div
                    key={stage.period}
                    className="grid gap-4 rounded-2xl border border-border bg-ink-deep p-5 sm:grid-cols-[110px_1fr]"
                  >
                    <div>
                      <div className="inline-flex rounded-full bg-mint/10 px-3 py-1 text-xs font-bold text-mint">
                        {stage.period}
                      </div>
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-black text-ice">{stage.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {stage.normal}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-ice">
                        <strong className="text-mint">What to do:</strong> {stage.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-mint/40 bg-gradient-to-br from-ink-elev to-ink p-6 md:p-8 lg:sticky lg:top-24 lg:self-start">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-7 w-7 text-mint" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">
                    Healing reality checker
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-black text-ice">
                    What are you seeing?
                  </h2>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {checks.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(item.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${selected === item.id ? "border-mint bg-mint/10 text-ice" : "border-border bg-ink-deep text-muted-foreground hover:border-mint/60 hover:text-ice"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div
                className={`mt-6 rounded-2xl border p-5 ${medical ? "border-red-400/40 bg-red-400/10" : "border-mint/35 bg-mint/10"}`}
              >
                <div className="flex items-center gap-2 font-bold text-ice">
                  {medical ? (
                    <AlertCircle className="h-5 w-5 text-red-300" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-mint" />
                  )}
                  {medical
                    ? "Medical assessment is appropriate"
                    : "Often compatible with normal healing"}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {current.result}
                </p>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                This checker cannot diagnose infection, allergy or another skin condition.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ArticleLayout
        aside={
          <div className="space-y-4">
            <Card>
              <Clock3 className="h-7 w-7 text-mint" />
              <h2 className="mt-4 font-display text-xl font-black text-ice">
                Do not judge at day 7
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Flaking and new surface skin can temporarily make light grey structure look uneven.
                Use the artist's healed-review timeframe.
              </p>
            </Card>
            <Card>
              <Sparkles className="h-7 w-7 text-mint" />
              <h2 className="mt-4 font-display text-xl font-black text-ice">
                Shareable studio resource
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Studios can link this guide alongside their own specific aftercare sheet; it does
                not replace the instructions for the dressing and products used during the
                appointment.
              </p>
            </Card>
            <PrimaryButton href="/guides/full-sleeve-cost-uk">Plan a sleeve budget</PrimaryButton>
          </div>
        }
      >
        <Disclaimer>
          A tattoo is a skin wound. Follow the specific instructions from the tattooist who
          performed the procedure. This guide cannot diagnose infection, allergic reaction or
          another medical problem. Worsening symptoms or systemic illness need medical advice.
        </Disclaimer>

        <h2>What is grey-lining?</h2>
        <p>
          Grey-lining usually means using diluted black pigment to place a lighter structural
          outline. In large black-and-grey realism, it can act as a map for future sessions:
          portraits, architecture, armour, smoke, background and joins can be positioned before the
          final values are built.
        </p>
        <p>
          It is not the same as a finished bold outline. Some grey lines remain subtly visible, some
          are covered by shading and some almost disappear into the completed piece. Judging a
          grey-line session as though it were meant to be the final tattoo creates unnecessary
          panic.
        </p>

        <h2>Why the lines can look darker on day 1</h2>
        <p>
          Fresh tattooing changes the appearance of the surface. Redness, swelling, plasma, tiny
          amounts of blood and excess pigment can make a diluted line look heavier and more
          saturated. The colour normally looks less intense once the area is cleaned and the early
          inflammation reduces.
        </p>

        <h2>Why the lines can look patchy around day 7</h2>
        <p>
          As the surface flakes, different parts shed at different times. A pale line viewed through
          dry, cloudy or partially peeling skin can look broken even when the pigment underneath is
          healing normally. Picking the flakes can create actual loss, so the visual unevenness is
          not a reason to interfere with the skin.
        </p>

        <h2>Why the tattoo can look too light after peeling</h2>
        <p>
          Diluted pigment is intentionally lighter. Once fresh redness and surface residue have
          gone, the contrast can drop sharply. New surface skin may also create a temporarily dull
          or cloudy appearance. A healed photograph taken in natural light after several weeks is
          more useful than a close-up during peeling.
        </p>

        <h2>What not to do</h2>
        <ul>
          <li>
            <strong>Do not pick or scratch:</strong> crusts and flakes should separate naturally.
          </li>
          <li>
            <strong>Do not copy another artist's dressing schedule:</strong> cling film, absorbent
            dressings and adhesive films have different instructions.
          </li>
          <li>
            <strong>Do not soak the tattoo:</strong> avoid swimming, baths, hot tubs and other
            prolonged immersion until the skin is healed and your artist advises it is safe.
          </li>
          <li>
            <strong>Do not apply random products:</strong> fragrances, antiseptics, thick ointments
            or numbing products may not match the artist's method or your skin.
          </li>
          <li>
            <strong>Do not expose it to strong sun:</strong> fresh tattooed skin needs protection;
            use clothing while healing and follow long-term sun-protection advice once healed.
          </li>
          <li>
            <strong>Do not schedule the next pass too early:</strong> the surface can look closed
            before deeper recovery is complete.
          </li>
        </ul>

        <h2>When to contact the artist</h2>
        <p>The tattooist is the correct first contact for normal process questions such as:</p>
        <ul>
          <li>How long to leave the specific dressing in place.</li>
          <li>Which cleanser or moisturiser matches their method.</li>
          <li>Whether the next sleeve session should be moved.</li>
          <li>When to send healed photographs.</li>
          <li>Whether a faint line was intended to remain visible or be covered later.</li>
        </ul>

        <h2>When the question becomes medical</h2>
        <p>
          A tattoo artist can explain normal healing and recognise that something appears unusual,
          but they cannot replace medical assessment. Seek prompt medical advice if redness, heat,
          swelling or pain is increasing; if there is pus or unpleasant discharge; if redness is
          spreading; or if you feel unwell or feverish.
        </p>
        <p>
          NHS guidance for wounds advises getting help where a wound becomes swollen, red and
          increasingly painful, produces pus or is accompanied by feeling unwell or a high
          temperature. UCLH advises seeking medical assessment for suspected tattoo infection and
          urgent care for severe redness, swelling or fever.
        </p>

        <h2>How to photograph healing properly</h2>
        <ul>
          <li>Use indirect natural daylight rather than flash.</li>
          <li>Take one full-area image and one closer image.</li>
          <li>
            Do not apply moisturiser immediately before the photograph if shine hides the surface.
          </li>
          <li>Include the date and the number of days since the session.</li>
          <li>Explain whether symptoms are improving, stable or worsening.</li>
        </ul>

        <blockquote>
          A normal-looking photograph does not rule out a problem, and an alarming close-up does not
          prove one. The direction of symptoms and how you feel matter.
        </blockquote>

        <SourceList
          sources={[
            {
              label: "UK Health Security Agency — tattooing and body piercing infection prevention",
              href: "https://www.gov.uk/guidance/tattooing-and-body-piercing-infection-prevention-and-control",
              note: "National infection-prevention guidance and industry toolkit, published March 2025.",
            },
            {
              label: "UCLH — tattoos and cosmetic procedures",
              href: "https://www.uclh.nhs.uk/patients-and-visitors/patient-information-pages/tattoos-and-cosmetic-procedures",
              note: "Advises following studio aftercare and seeking medical help for infection signs.",
            },
            {
              label: "NHS — cuts and grazes",
              href: "https://www.nhs.uk/conditions/cuts-and-grazes/",
              note: "Current wound warning signs include increasing redness, pain, pus and feeling unwell.",
            },
            {
              label: "Dudley Group NHS — medical tattooing aftercare",
              href: "https://www.dgft.nhs.uk/pil/medical-tattooing-aftercare-advice/",
              note: "Describes crusting, peeling, fading and warning signs across a 14–21 day surface-healing period for medical tattooing.",
            },
            {
              label: "Leeds Teaching Hospitals — medical tattooing",
              href: "https://www.leedsth.nhs.uk/patients/resources/medical-tattooing/",
              note: "Notes temporary swelling, dulling and flaking, and advises not to pick.",
            },
          ]}
        />
      </ArticleLayout>
    </PublicShell>
  );
}
