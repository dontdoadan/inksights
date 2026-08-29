import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  BadgePoundSterling,
  CreditCard,
  LifeBuoy,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import {
  Card,
  JsonLd,
  PageHero,
  PrimaryButton,
  PublicShell,
  SecondaryButton,
  SectionHeading,
} from "@/components/public-site";

const CANONICAL_URL = "https://getinksight.co.uk/support";
const SUPPORT_EMAIL = "dontdoadan@icloud.com";

const faq = [
  {
    question: "How do I contact INKSIGHT support?",
    answer:
      "Use the secure contact form at getinksight.co.uk/contact or email dontdoadan@icloud.com. Include your studio name, the service involved and enough detail for INKSIGHT to identify the issue. Do not send passwords, full card details, private API keys or verification codes.",
  },
  {
    question: "When does the 72-Hour Studio Visibility Fix delivery period begin?",
    answer:
      "The three-working-day delivery period begins only after payment, complete intake, required access and a named approver are in place. Missing access, approvals or information can pause or move the delivery window.",
  },
  {
    question: "How do I cancel Visibility Watch?",
    answer:
      "Visibility Watch is £99 per month billed monthly in advance until cancelled. Cancellation must be completed before the next renewal to avoid the next charge. Service continues until the end of the paid billing period.",
  },
  {
    question: "Can I request a refund?",
    answer:
      "If INKSIGHT cannot accept or commence a fixed-scope engagement, payment should be returned. Once client-specific work has begun, any refund is limited to undelivered work unless the written scope states otherwise or a legal right applies. Monthly subscriptions do not promise a partial-period refund except where a legal right applies or INKSIGHT agrees otherwise in writing.",
  },
  {
    question: "Where do I send a privacy or data-rights request?",
    answer:
      "Send the request to dontdoadan@icloud.com. The Privacy Notice explains how INKSIGHT handles access, correction, deletion, restriction, objection, portability and consent-withdrawal requests where applicable.",
  },
  {
    question: "Can INKSIGHT support diagnose a medical or tattoo-healing problem?",
    answer:
      "No. INKSIGHT website and aftercare material is educational and does not replace advice from the tattoo artist or an appropriate healthcare professional. Medical warning signs require appropriate healthcare assessment.",
  },
];

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () => ({
    meta: [
      { title: "Customer Support | INKSIGHT" },
      {
        name: "description",
        content:
          "Customer support for INKSIGHT services, billing, cancellations, technical issues, privacy requests and current tattoo studio offers.",
      },
      { property: "og:title", content: "Customer Support | INKSIGHT" },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function SupportPage() {
  return (
    <PublicShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />

      <PageHero
        eyebrow="Customer support"
        title={<>Get the right issue to the right place.</>}
        description={
          <>
            Support for existing INKSIGHT clients, billing and cancellations, website problems, privacy requests and questions about current service delivery. For a new studio recommendation, use the free Growth Check instead.
          </>
        }
      >
        <PrimaryButton href="/contact">Contact support</PrimaryButton>
        <SecondaryButton href={`mailto:${SUPPORT_EMAIL}`}>Email {SUPPORT_EMAIL}</SecondaryButton>
      </PageHero>

      <section className="border-b border-border bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="Start here"
            title="What do you need help with?"
            description="Choose the closest route and include the information below. That makes it easier to verify the issue without asking for sensitive credentials."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <LifeBuoy className="h-7 w-7 text-mint" />
              <h2 className="mt-5 font-display text-xl font-black text-ice">Existing client support</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Include your studio name, service or written scope, the relevant page or workflow, what happened and the outcome you need.
              </p>
              <a href="/contact" className="mt-5 inline-block text-sm font-bold text-mint hover:text-mint-soft">Open the support form</a>
            </Card>

            <Card>
              <CreditCard className="h-7 w-7 text-mint" />
              <h2 className="mt-5 font-display text-xl font-black text-ice">Billing or cancellation</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Include the studio name, billing email, offer name, invoice or receipt reference if available, and the transaction or renewal you are asking about.
              </p>
              <a href="/contact" className="mt-5 inline-block text-sm font-bold text-mint hover:text-mint-soft">Ask about billing</a>
            </Card>

            <Card>
              <Wrench className="h-7 w-7 text-mint" />
              <h2 className="mt-5 font-display text-xl font-black text-ice">Website or technical issue</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Send the page URL, device and browser, the steps that caused the issue, what you expected to happen and a screenshot where useful.
              </p>
              <a href="/contact" className="mt-5 inline-block text-sm font-bold text-mint hover:text-mint-soft">Report a technical issue</a>
            </Card>

            <Card>
              <ShieldCheck className="h-7 w-7 text-mint" />
              <h2 className="mt-5 font-display text-xl font-black text-ice">Privacy or data request</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Use the contact email for access, correction, deletion, restriction, objection, portability or consent questions where those rights apply.
              </p>
              <a href="/privacy" className="mt-5 inline-block text-sm font-bold text-mint hover:text-mint-soft">Read the Privacy Notice</a>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="Current service terms"
            title="Support rules for active INKSIGHT offers."
            description="These summaries mirror the current website and service terms. A later signed service order or written scope takes priority where it contains client-specific terms."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Card className="bg-ink-deep">
              <BadgePoundSterling className="h-7 w-7 text-mint" />
              <h2 className="mt-5 font-display text-2xl font-black text-ice">72-Hour Studio Visibility Fix</h2>
              <p className="mt-2 font-bold text-mint">£249 one-off</p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li>Payment is due before work begins.</li>
                <li>The three-working-day delivery period begins only after payment, complete intake, required access and a named approver are in place.</li>
                <li>Delays in access, information or approvals can pause delivery or change the delivery date.</li>
              </ul>
              <a href="/offers/72-hour-visibility-fix" className="mt-5 inline-block text-sm font-bold text-mint">View the offer</a>
            </Card>

            <Card className="bg-ink-deep">
              <CreditCard className="h-7 w-7 text-mint" />
              <h2 className="mt-5 font-display text-2xl font-black text-ice">Tattoo Studio Visibility Watch</h2>
              <p className="mt-2 font-bold text-mint">£99/month</p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li>Billed monthly in advance until cancelled.</li>
                <li>Cancellation must be completed before the next renewal to avoid the next charge.</li>
                <li>Service continues until the end of the paid billing period.</li>
              </ul>
              <a href="/offers/visibility-watch" className="mt-5 inline-block text-sm font-bold text-mint">View the offer</a>
            </Card>

            <Card className="bg-ink-deep">
              <LifeBuoy className="h-7 w-7 text-mint" />
              <h2 className="mt-5 font-display text-2xl font-black text-ice">Founding Studio Pilot</h2>
              <p className="mt-2 font-bold text-mint">£1,500 installation + £750/month for a minimum three-month management term</p>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                The standard minimum package totals £3,750. The signed service order governs the client-specific scope, access requirements, delivery, early termination and any remaining commitment.
              </p>
              <a href="/offers/founding-studio-pilot" className="mt-5 inline-block text-sm font-bold text-mint">View the pilot</a>
            </Card>

            <Card className="bg-ink-deep">
              <LockKeyhole className="h-7 w-7 text-mint" />
              <h2 className="mt-5 font-display text-2xl font-black text-ice">Revenue Audit & Booking / Retention work</h2>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                These are scoped services rather than fixed public checkouts. The agreed written quote or scope controls the price, payment schedule, dependencies and delivery conditions for that engagement.
              </p>
              <a href="/offers" className="mt-5 inline-block text-sm font-bold text-mint">See current solutions</a>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-ink-deep">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 md:py-24">
          <div>
            <SectionHeading eyebrow="Cancellations and refunds" title="What the current policy says." />
            <div className="mt-7 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                If INKSIGHT cannot accept or commence a fixed-scope engagement, payment should be returned. Once client-specific work has begun, any refund is limited to undelivered work unless the written scope states otherwise or a legal right applies.
              </p>
              <p>
                Monthly subscriptions do not promise a partial-period refund except where a legal right applies or INKSIGHT agrees otherwise in writing. Minimum-term implementation or management packages follow the signed service order for early termination, completed work and any remaining commitment.
              </p>
              <p>
                Nothing in the service terms limits a right that cannot lawfully be excluded.
              </p>
            </div>
            <a href="/terms" className="mt-6 inline-block text-sm font-bold text-mint hover:text-mint-soft">Read the full terms</a>
          </div>

          <div className="rounded-3xl border border-amber-300/30 bg-amber-300/10 p-7 md:p-9">
            <AlertTriangle className="h-8 w-8 text-amber-200" />
            <h2 className="mt-5 font-display text-2xl font-black text-ice">Keep sensitive information out of support messages.</h2>
            <p className="mt-4 text-sm leading-relaxed text-amber-100/85">
              Never send your password, a full payment-card number, card security code, private API key, one-time verification code or another person&apos;s confidential information. INKSIGHT can investigate normal billing and technical issues using references, screenshots and account-identifying information without those secrets.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading eyebrow="Frequently asked questions" title="Common support questions." />
          <div className="mt-9 divide-y divide-border rounded-2xl border border-border bg-ink-deep px-5 md:px-7">
            {faq.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="cursor-pointer list-none pr-8 font-bold text-ice marker:hidden">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-deep">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center md:py-24">
          <Mail className="mx-auto h-8 w-8 text-mint" />
          <h2 className="mt-5 font-display text-4xl font-black text-ice md:text-5xl">Still need help?</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            Send a clear description of the issue through the secure contact form or email {SUPPORT_EMAIL}. If your signed scope contains a specific support or escalation process, use that process first.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <PrimaryButton href="/contact">Contact support</PrimaryButton>
            <SecondaryButton href={`mailto:${SUPPORT_EMAIL}`}>Email support</SecondaryButton>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
