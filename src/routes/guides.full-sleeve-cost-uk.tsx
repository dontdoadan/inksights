import { createFileRoute } from "@tanstack/react-router";
import { Calculator, CirclePoundSterling, Clock3, Layers3 } from "lucide-react";
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

const CANONICAL_URL = "https://getinksight.co.uk/guides/full-sleeve-cost-uk";
const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export const Route = createFileRoute("/guides/full-sleeve-cost-uk")({
  component: FullSleeveCostGuide,
  head: () => ({
    meta: [
      { title: "How Much Does a Full Sleeve Cost in the UK? | INKSIGHT" },
      {
        name: "description",
        content:
          "Estimate a UK full sleeve tattoo by day rate or hourly rate, including grey-lining, shading, finishing and possible touch-up work.",
      },
      { property: "og:title", content: "How Much Does a Full Sleeve Actually Cost in the UK?" },
      {
        property: "og:description",
        content:
          "A transparent day-rate and hourly breakdown with an interactive sleeve budget calculator.",
      },
      { property: "og:url", content: CANONICAL_URL },
      { property: "og:image", content: "https://getinksight.co.uk/og/full-sleeve-cost-uk.png" },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

type CostMode = "day" | "hour";

function FullSleeveCostGuide() {
  const [mode, setMode] = useState<CostMode>("day");
  const [dayRate, setDayRate] = useState(500);
  const [hourlyRate, setHourlyRate] = useState(100);
  const [lineUnits, setLineUnits] = useState(1);
  const [shadeUnits, setShadeUnits] = useState(4);
  const [finishUnits, setFinishUnits] = useState(1);
  const [touchUnits, setTouchUnits] = useState(0);
  const [additional, setAdditional] = useState(0);

  const estimate = useMemo(() => {
    const rate = mode === "day" ? dayRate : hourlyRate;
    const totalUnits = lineUnits + shadeUnits + finishUnits + touchUnits;
    const base = Math.max(0, totalUnits * rate + additional);
    return {
      rate,
      totalUnits,
      base,
      upper: base * 1.2,
      line: lineUnits * rate,
      shade: shadeUnits * rate,
      finish: finishUnits * rate,
      touch: touchUnits * rate,
    };
  }, [mode, dayRate, hourlyRate, lineUnits, shadeUnits, finishUnits, touchUnits, additional]);

  const unitLabel = mode === "day" ? "days" : "hours";

  return (
    <PublicShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "How Much Does a Full Sleeve Actually Cost in the UK?",
          description: "A UK full sleeve tattoo cost guide and interactive calculator.",
          url: CANONICAL_URL,
          dateModified: "2026-07-26",
          publisher: { "@type": "Organization", name: "INKSIGHT" },
        }}
      />
      <PageHero
        eyebrow="Tattoo pricing guide · Updated 26 July 2026"
        title={
          <>
            How Much Does a Full Sleeve <span className="text-mint">Actually Cost in the UK?</span>
          </>
        }
        description={
          <>
            A full sleeve is not one tattoo appointment. It is a multi-stage project involving
            planning, line structure, shading or colour, transitions, difficult areas and sometimes
            a healed touch-up. This guide shows how the budget is built.
          </>
        }
      />

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-3xl border border-border bg-ink-deep p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">
                    Interactive budget builder
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-black text-ice">
                    Build the project by stage
                  </h2>
                </div>
                <Calculator className="h-8 w-8 text-mint" />
              </div>

              <div className="mt-7 grid grid-cols-2 gap-2 rounded-xl border border-border bg-ink p-1.5">
                <button
                  type="button"
                  onClick={() => setMode("day")}
                  className={`rounded-lg px-4 py-3 text-sm font-bold ${mode === "day" ? "bg-mint text-ink-deep" : "text-muted-foreground"}`}
                >
                  Day rate
                </button>
                <button
                  type="button"
                  onClick={() => setMode("hour")}
                  className={`rounded-lg px-4 py-3 text-sm font-bold ${mode === "hour" ? "bg-mint text-ink-deep" : "text-muted-foreground"}`}
                >
                  Hourly rate
                </button>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {mode === "day" ? (
                  <NumberField
                    label="Artist day rate"
                    value={dayRate}
                    onChange={setDayRate}
                    prefix="£"
                    min={100}
                    step={25}
                  />
                ) : (
                  <NumberField
                    label="Artist hourly rate"
                    value={hourlyRate}
                    onChange={setHourlyRate}
                    prefix="£"
                    min={20}
                    step={5}
                  />
                )}
                <NumberField
                  label={`Grey-line / structure ${unitLabel}`}
                  value={lineUnits}
                  onChange={setLineUnits}
                  min={0}
                  step={mode === "day" ? 0.5 : 1}
                />
                <NumberField
                  label={`Shading / colour ${unitLabel}`}
                  value={shadeUnits}
                  onChange={setShadeUnits}
                  min={0}
                  step={mode === "day" ? 0.5 : 1}
                />
                <NumberField
                  label={`Finishing / difficult-area ${unitLabel}`}
                  value={finishUnits}
                  onChange={setFinishUnits}
                  min={0}
                  step={mode === "day" ? 0.5 : 1}
                />
                <NumberField
                  label={`Touch-up ${unitLabel}`}
                  value={touchUnits}
                  onChange={setTouchUnits}
                  min={0}
                  step={mode === "day" ? 0.25 : 0.5}
                />
                <NumberField
                  label="Other agreed project costs"
                  value={additional}
                  onChange={setAdditional}
                  prefix="£"
                  min={0}
                  step={25}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-mint/40 bg-gradient-to-br from-ink-elev to-ink p-7 md:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">
                Working estimate
              </p>
              <div className="mt-4 font-display text-5xl font-black text-ice md:text-6xl">
                {gbp.format(estimate.base)}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Planning range up to approximately {gbp.format(estimate.upper)}
              </p>
              <div className="mt-7 space-y-3 rounded-2xl border border-border bg-ink-deep p-5 text-sm">
                <Breakdown label="Grey-line / structure" value={estimate.line} />
                <Breakdown label="Shading / colour" value={estimate.shade} />
                <Breakdown label="Finishing / difficult areas" value={estimate.finish} />
                <Breakdown label="Touch-up allowance" value={estimate.touch} />
                <Breakdown label="Other agreed costs" value={additional} />
                <div className="flex justify-between border-t border-border pt-3 font-bold text-ice">
                  <span>Total {unitLabel}</span>
                  <span>{estimate.totalUnits}</span>
                </div>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                The 20% upper planning allowance is not a quote. It illustrates how extra detail,
                difficult healing, anatomy, design changes or an additional sitting can affect a
                multi-session project.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ArticleLayout
        aside={
          <div className="space-y-4">
            <Card>
              <CirclePoundSterling className="h-7 w-7 text-mint" />
              <h2 className="mt-4 font-display text-xl font-black text-ice">Quick reality check</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Published UK studio examples reviewed in July 2026 commonly show full-day rates
                around £400–£500, while specialist London realism artists may publish £900 or more
                per day.
              </p>
            </Card>
            <Card>
              <Clock3 className="h-7 w-7 text-mint" />
              <h2 className="mt-4 font-display text-xl font-black text-ice">Project length</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                One London studio states that many sleeves take roughly four to six full-day
                sessions, but anatomy, coverage, style, detail and existing tattoos can move the
                total substantially.
              </p>
            </Card>
            <PrimaryButton href="/tools/tattoo-pain-chart-reality-check">
              Check placement reality
            </PrimaryButton>
          </div>
        }
      >
        <Disclaimer>
          This calculator provides a budgeting framework, not a quote. Only the chosen artist can
          price the exact arm, design, coverage, technique and project conditions after
          consultation.
        </Disclaimer>

        <h2>The realistic answer</h2>
        <p>
          A professionally planned full sleeve in the UK commonly costs several thousand pounds.
          Public prices reviewed for this guide show day rates around <strong>£400–£500</strong> at
          several studios, with specialist London artists publishing <strong>£900 or more</strong>.
          One studio that starts large-project days at £500 says many sleeves take roughly four to
          six sessions.
        </p>
        <p>
          That does not create one universal range. A four-day black-and-grey sleeve at £400 per day
          is £1,600. An eight-day realism project at £900 per day is £7,200. Both can be legitimate
          because “full sleeve” describes coverage, not complexity, artist demand or working method.
        </p>

        <h2>Day rate versus hourly pricing</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pricing method</th>
                <th>Usually useful when</th>
                <th>What to clarify</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Day rate</strong>
                </td>
                <td>
                  Large custom projects, realism, Japanese, blackwork or sleeves requiring repeated
                  full sittings.
                </td>
                <td>
                  How many hours are normally tattooed, whether breaks and stencil time are
                  included, and how unfinished days are handled.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Hourly rate</strong>
                </td>
                <td>
                  Shorter continuation sessions, smaller additions or artists whose workflow varies
                  significantly by appointment.
                </td>
                <td>
                  Whether design, stencil, breaks and setup are charged, plus the likely total hours
                  rather than the hourly figure alone.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Fixed project price</strong>
                </td>
                <td>
                  A tightly defined design where the artist is willing to absorb some time
                  variation.
                </td>
                <td>
                  What happens if the concept, scale, placement or coverage changes after the price
                  is agreed.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Why sleeves are built in stages</h2>
        <h3>Consultation and design planning</h3>
        <p>
          The artist must understand theme, focal points, flow around the arm, existing tattoos,
          skin breaks, negative space and how the inside and outside connect. Some artists include
          design time in the session or deposit; others price complex drawing separately. Ask rather
          than assume.
        </p>

        <h3>Grey-lining or structural linework</h3>
        <p>
          In black-and-grey realism and some large-scale styles, the first major session may
          establish the complete structure using diluted grey lines or a lighter map. This is not
          the finished look. It creates placement and proportion references that can later be
          shaded, softened or partly disappear into the final piece.
        </p>
        <p>
          A dedicated grey-line day can make the project look unusually light, incomplete or
          technical until later sittings. That stage still uses appointment time, sterile setup,
          design decisions and a full healing cycle, so it is part of the price rather than “just an
          outline”.
        </p>

        <h3>Shading, packing and transitions</h3>
        <p>
          Most of the time is usually spent developing the actual image: black saturation, smooth
          grey transitions, texture, focal detail, background and the joins between different arm
          sections. Large realism work may need several days because every session covers only the
          amount the artist and client can complete properly.
        </p>

        <h3>Elbow, ditch, wrist and final joins</h3>
        <p>
          Difficult areas often take longer than their physical size suggests. The artist may need
          to adjust the stencil, stretch, needle angle and design around movement. The final session
          can be less visually dramatic than the first but still essential for continuity and
          finish.
        </p>

        <h3>Healed review and touch-up</h3>
        <p>
          A touch-up is not automatically evidence of poor work. Different areas heal differently,
          especially joints, hands, wrists and dense black sections. Some artists include one healed
          touch-up within a stated period; others charge for it, particularly where aftercare, sun,
          work conditions or missed appointments affected healing. Confirm the policy before
          starting.
        </p>

        <h2>What changes the final total?</h2>
        <ul>
          <li>
            <strong>Arm size and desired coverage:</strong> full wrap, inner arm and shoulder/chest
            transitions require more work than an outer-arm composition.
          </li>
          <li>
            <strong>Style:</strong> dense realism, colour saturation, geometric precision and
            detailed blackwork have different time demands.
          </li>
          <li>
            <strong>Existing tattoos or cover-ups:</strong> the new design may need to be larger,
            darker or more complex.
          </li>
          <li>
            <strong>Skin and healing:</strong> swelling, texture, scarring and difficult healing can
            slow later stages.
          </li>
          <li>
            <strong>How you sit:</strong> frequent movement, long breaks or ending sessions early
            can increase the number of appointments.
          </li>
          <li>
            <strong>Design changes:</strong> changing theme, scale or focal pieces after the project
            starts creates additional work.
          </li>
          <li>
            <strong>Artist demand and location:</strong> specialist artists and high-overhead
            locations may charge more.
          </li>
        </ul>

        <h2>The deposit is usually not an extra tattoo charge</h2>
        <p>
          A booking deposit commonly secures time and covers preparation risk, then is deducted from
          the final session or project balance under the artist's terms. It can become an additional
          cost if the appointment is missed, moved without enough notice or the project is abandoned
          contrary to those terms.
        </p>

        <h2>How to ask for a useful quote</h2>
        <p>
          Send enough information for the artist to estimate the project rather than asking only,
          “How much for a sleeve?”
        </p>
        <ul>
          <li>
            Clear photographs of the full arm, including inside, outside, elbow and any existing
            tattoos.
          </li>
          <li>The preferred style and a small, focused reference set.</li>
          <li>Must-have focal elements and anything that should not be included.</li>
          <li>Desired coverage and whether the shoulder, chest or hand is included.</li>
          <li>Your budget structure: full-day sessions, shorter sessions or staged payments.</li>
          <li>
            Any deadline, understanding that healing cycles limit how quickly a sleeve can be
            completed.
          </li>
        </ul>

        <h2>Price shopping versus value checking</h2>
        <p>
          Comparing prices is sensible. Choosing only the lowest number is not. A sleeve is visible,
          permanent and difficult to correct. Compare healed work, full-arm composition,
          consistency, hygiene, communication, consultation quality and whether the artist's
          portfolio proves they can execute the style at that scale.
        </p>
        <blockquote>
          The useful question is not “Who can do a sleeve cheapest?” It is “What project, artist and
          payment structure can I complete properly without compromising the result?”
        </blockquote>

        <SourceList
          sources={[
            {
              label: "TATTOOMA London — sleeve pricing guidance",
              href: "https://www.tattooma.co.uk/prices",
              note: "States full-day sessions start at £500 and many sleeves take approximately four to six sessions, subject to variables.",
            },
            {
              label: "Resurrection Studio — full-day session",
              href: "https://www.resurrectionstudio.co.uk/service-page/tattoo-full-day-session",
              note: "Publishes a £500 full-day session and explains that 5–6 hours may be tattooing time within the appointment.",
            },
            {
              label: "The Cheshire Tattoo Studio — price guide",
              href: "https://www.thecheshiretattoostudio.co.uk/",
              note: "Publishes hourly pricing from £100 and full days from £500.",
            },
            {
              label: "Milan Boros — specialist London realism pricing",
              href: "https://www.milanborostattoo.co.uk/pricing",
              note: "Publishes £900 for a 5–7 hour full-day session and £1,200 for extended sessions.",
            },
            {
              label: "Cold Iron Tattoo Company — pricing",
              href: "https://www.coldirontattoo.co.uk/pages/prices",
              note: "Publishes full-day sittings around £400–£500 and hourly continuation rates, with prices marked as January 2025.",
            },
          ]}
        />
      </ArticleLayout>
    </PublicShell>
  );
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  min,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  min: number;
  step: number;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-ice">{label}</span>
      <span className="flex items-center rounded-xl border border-border bg-ink px-3 focus-within:border-mint">
        {prefix ? <span className="text-muted-foreground">{prefix}</span> : null}
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(Math.max(min, Number(event.target.value) || 0))}
          className="w-full bg-transparent px-2 py-3 text-ice outline-none"
        />
      </span>
    </label>
  );
}

function Breakdown({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4 text-muted-foreground">
      <span>{label}</span>
      <span className="font-semibold text-ice">{gbp.format(value)}</span>
    </div>
  );
}
