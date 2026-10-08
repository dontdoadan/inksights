import type { ReactNode } from "react";
import { CtaSection, JsonLd, PageHero, PublicShell, SectionHeading, SourceList } from "@/components/public-site";

export type StudioTopicSource = {
  label: string;
  href: string;
  note?: string;
};

export type StudioTopicRelatedLink = {
  href: string;
  label: string;
  description: string;
};

export type StudioTopicFaq = {
  question: string;
  answer: string;
};

export type StudioTopic = {
  canonical: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: ReactNode;
  updated: string;
  updatedLabel?: string;
  sections: Array<{ id?: string; title: string; body: ReactNode; bullets?: string[] }>;
  sources?: StudioTopicSource[];
  related?: StudioTopicRelatedLink[];
  faqs?: StudioTopicFaq[];
  ctaTitle: string;
  ctaDescription: string;
};

function sectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatUpdatedDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function StudioTopicPage({ topic }: { topic: StudioTopic }) {
  const visibleUpdated = topic.updatedLabel ?? formatUpdatedDate(topic.updated);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: topic.title,
    description: topic.description,
    url: topic.canonical,
    mainEntityOfPage: topic.canonical,
    dateModified: topic.updated,
    author: {
      "@type": "Organization",
      name: "INKSIGHTS",
      url: "https://getinksights.co.uk/about",
    },
    publisher: {
      "@type": "Organization",
      name: "INKSIGHTS",
      url: "https://getinksights.co.uk/",
      logo: {
        "@type": "ImageObject",
        url: "https://getinksights.co.uk/brand/logo-v3/primary-dark.svg",
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Resources",
        item: "https://getinksights.co.uk/resources",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: topic.title.replace(" | INKSIGHTS", ""),
        item: topic.canonical,
      },
    ],
  };

  const faqJsonLd = topic.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: topic.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  return (
    <PublicShell>
      <JsonLd data={faqJsonLd ? [articleJsonLd, breadcrumbJsonLd, faqJsonLd] : [articleJsonLd, breadcrumbJsonLd]} />
      <PageHero eyebrow={topic.eyebrow} title={topic.title} description={topic.intro}>
        <a
          href="/studio-growth-check"
          className="inline-flex min-h-12 items-center rounded-full bg-mint px-6 py-3 font-bold text-ink-deep"
        >
          Run the free Revenue Audit →
        </a>
        <a
          href="/tattoo-studio-visibility-scorecard"
          className="inline-flex min-h-12 items-center rounded-full border border-border px-6 py-3 font-bold text-ice"
        >
          Check studio visibility
        </a>
      </PageHero>

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="text-sm font-semibold text-ice">Last updated {visibleUpdated}</p>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Reviewed by INKSIGHTS. Guidance is written specifically for UK tattoo-studio operators and distinguishes
                observed evidence, operating principles and recommendations.
              </p>
            </div>
            <a href="/about" className="text-sm font-bold text-mint hover:text-mint-soft">
              How INKSIGHTS evaluates evidence →
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <nav aria-label="On this page" className="mb-12 rounded-2xl border border-border bg-ink p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">On this page</p>
            <ul className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              {topic.sections.map((section) => {
                const id = section.id ?? sectionId(section.title);
                return (
                  <li key={id}>
                    <a href={`#${id}`} className="font-semibold text-ice hover:text-mint">
                      {section.title}
                    </a>
                  </li>
                );
              })}
              {topic.faqs?.length ? (
                <li>
                  <a href="#frequently-asked-questions" className="font-semibold text-ice hover:text-mint">
                    Frequently asked questions
                  </a>
                </li>
              ) : null}
              {topic.sources?.length ? (
                <li>
                  <a href="#sources-heading" className="font-semibold text-ice hover:text-mint">
                    Sources and verification
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>

          <div className="space-y-14">
            {topic.sections.map((section) => {
              const id = section.id ?? sectionId(section.title);
              return (
                <article key={section.title} id={id} className="scroll-mt-28">
                  <SectionHeading title={section.title} />
                  <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
                    <div>{section.body}</div>
                    {section.bullets ? (
                      <ul className="grid gap-3 md:grid-cols-2">
                        {section.bullets.map((item) => (
                          <li key={item} className="rounded-xl border border-border bg-ink p-4">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          {topic.faqs?.length ? (
            <section id="frequently-asked-questions" className="mt-16 scroll-mt-28 border-t border-border pt-12">
              <SectionHeading
                eyebrow="Practical answers"
                title="Frequently asked questions"
                description="Short answers to common owner questions related to this topic."
              />
              <div className="mt-8 space-y-4">
                {topic.faqs.map((faq) => (
                  <details key={faq.question} className="rounded-2xl border border-border bg-ink p-5">
                    <summary className="cursor-pointer font-display text-lg font-black text-ice">{faq.question}</summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          {topic.related?.length ? (
            <section className="mt-16 border-t border-border pt-12">
              <SectionHeading
                eyebrow="Related INKSIGHTS guides"
                title="Follow the constraint into the next part of the system."
                description="These guides connect this topic to the adjacent commercial conditions that influence studio performance."
              />
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {topic.related.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl border border-border bg-ink p-5 transition hover:border-mint"
                  >
                    <h3 className="font-display text-lg font-black text-ice">{link.label}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{link.description}</p>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {topic.sources?.length ? <SourceList sources={topic.sources} /> : null}
        </div>
      </section>

      <CtaSection title={topic.ctaTitle} description={topic.ctaDescription} />
    </PublicShell>
  );
}

export function topicHead(topic: StudioTopic) {
  return {
    meta: [
      { title: topic.title },
      { name: "description", content: topic.description },
      { property: "og:title", content: topic.title },
      { property: "og:description", content: topic.description },
      { property: "og:url", content: topic.canonical },
      { property: "og:type", content: "article" },
      { property: "article:modified_time", content: topic.updated },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: topic.canonical }],
  };
}
