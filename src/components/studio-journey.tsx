import { PrimaryButton, SectionHeading } from "@/components/public-site";

const journey = [
  {
    title: "Start with the free Studio Growth Check",
    detail: "Use your monthly figures to estimate where there may be room to improve. Built for UK studios with 3+ artists; the result is a starting point for investigation.",
    href: "/studio-growth-check",
    cta: "Get my free Growth Check",
    price: "Free",
  },
  {
    title: "72-hour Visibility Watch & Fix",
    detail: "If the problem is public visibility or an unclear booking route, explore the existing 72-Hour Visibility Fix: a focused review, agreed corrections and follow-up. Delivery is three working days after payment, complete intake and required access. Recurring Visibility Watch is separate.",
    href: "/offers/72-hour-visibility-fix",
    cta: "Check the visibility-fix scope",
    price: "Visibility Fix: £249 one-off",
  },
  {
    title: "Studio Intelligence Audit",
    detail: "For a wider or uncertain problem, investigate visibility, competitors and the customer journey. Receive prioritised recommendations, a 90-day action plan and a 45–60 minute findings session.",
    href: "/offers/studio-intelligence-audit",
    cta: "Explore the £395 audit",
    price: "£395 one-off · founding validation price",
  },
  {
    title: "Primary Constraint Programme",
    detail: "Put one evidenced priority into practice. Agree the work, price, responsibilities and measures before implementation, then review what changed against the starting point.",
    href: "/offers/primary-constraint-programme",
    cta: "See how implementation works",
    price: "Separately scoped proposal",
  },
  {
    title: "Ongoing monitoring",
    detail: "Monitor only what can inform a useful decision. Visibility Watch covers agreed public visibility signals; broader INKSIGHTS Watch is considered separately where ongoing measurement is justified.",
    href: "/offers/visibility-watch",
    cta: "Review Visibility Watch",
    price: "Visibility Watch: £99/month",
  },
] as const;

export function StudioJourney() {
  return (
    <section className="brand-dark border-y border-border bg-ink-deep">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <SectionHeading
          eyebrow="Your next step"
          title="Start small. Go deeper when the evidence calls for it."
          description="This is a route through the available help, not a compulsory package. You can stop after the free check, choose a focused fix or move directly to a structured audit when that fits the question."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {journey.map((step, index) => (
            <article key={step.href} className="flex flex-col rounded-2xl border border-border bg-ink p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-mint">0{index + 1} · {step.price}</p>
              <h3 className="mt-4 font-display text-2xl font-bold text-ice">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
              <a className="mt-auto pt-5 font-bold text-mint" href={step.href}>{step.cta} →</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StudioFaqs() {
  return (
    <section className="brand-dark border-b border-border bg-ink">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <SectionHeading eyebrow="Before you start" title="Clear answers before you commit." />
        <div className="mt-8 space-y-3">
          {[
            ["Who is INKSIGHTS for?", "Our core service is built for established UK tattoo studios with three or more artists and an owner who can act on the findings. Smaller studios can enquire about fit. Suppliers, brands, software providers, educators and event organisers should use the separate industry enquiry route."],
            ["What is the difference between the free check and the £395 audit?", "The Studio Growth Check calculates a first-pass estimate from the figures you provide. The paid Studio Intelligence Audit reviews the available studio, market and customer-journey evidence and provides prioritised recommendations, a 90-day action plan and a findings session. Neither is a financial audit."],
            ["Do I have to buy every stage?", "No. The next step depends on the question and the evidence. A focused visibility problem may suit the 72-Hour Visibility Fix; a wider problem may need the audit. Implementation and monitoring are separate decisions."],
            ["Does 72-hour Watch & Fix include monthly monitoring?", "No. This stage points to the published £249 one-off 72-Hour Visibility Fix and its follow-up review. Its delivery period is three working days after payment, complete intake and required access. The £99/month Visibility Watch is a separate service."],
            ["What if I do not have reliable studio numbers?", "Do not enter zero for information you do not know. Use the contact form to explain what you can access. Any paid analysis must distinguish observations, estimates and missing information; better measurement may be the first recommendation."],
            ["Is implementation included in the £395 audit?", "No. The audit provides the diagnosis and action plan. A Primary Constraint Programme is proposed separately when there is a justified priority, with written scope, pricing and measures agreed before work starts."],
            ["Can you guarantee more bookings or revenue?", "No. Outcomes depend on demand, the studio, implementation and other factors. We agree what can be measured and report the result with its limitations. Illustrative scores and estimates are not proof of client performance."],
            ["Can I see client results?", "The proof library currently presents labelled demonstrations and our evidence standard. We will only present a studio outcome as a case study when there is permission, a starting baseline, a measurement period and enough evidence to support the claim."],
          ].map(([question, answer]) => (
            <details key={question} className="rounded-2xl border border-border bg-ink-deep p-5">
              <summary className="cursor-pointer font-bold text-ice">{question}</summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IndustryEnquiry() {
  return (
    <section className="brand-dark border-b border-border bg-ink-deep">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <SectionHeading
          eyebrow="Beyond studio operations"
          title="Working with the tattoo industry?"
          description="Suppliers, product brands, software providers, educators and event organisers face different questions from studio owners. Tell us about the market, audience or commercial decision you need to understand. We will discuss fit and scope separately; studio pricing and diagnostics do not automatically apply."
        />
        <div className="mt-6"><PrimaryButton href="/contact?topic=partnership">Discuss an industry enquiry</PrimaryButton></div>
      </div>
    </section>
  );
}
