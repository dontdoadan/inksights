import type { ReactNode } from "react";
import { CtaSection, JsonLd, PageHero, PublicShell, SectionHeading } from "@/components/public-site";

export type StudioTopic = {
  canonical: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: ReactNode;
  sections: Array<{ title: string; body: ReactNode; bullets?: string[] }>;
  ctaTitle: string;
  ctaDescription: string;
};

export function StudioTopicPage({ topic }: { topic: StudioTopic }) {
  return <PublicShell>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: topic.title, description: topic.description, url: topic.canonical, author: { "@type": "Organization", name: "INKSIGHTS" }, publisher: { "@type": "Organization", name: "INKSIGHTS" } }} />
    <PageHero eyebrow={topic.eyebrow} title={topic.title} description={topic.intro}><a href="/studio-growth-check" className="inline-flex min-h-12 items-center rounded-full bg-mint px-6 py-3 font-bold text-ink-deep">Run the free Revenue Audit →</a><a href="/tattoo-studio-visibility-scorecard" className="inline-flex min-h-12 items-center rounded-full border border-border px-6 py-3 font-bold text-ice">Check studio visibility</a></PageHero>
    <section><div className="mx-auto max-w-5xl px-6 py-16 md:py-24"><div className="space-y-12">{topic.sections.map((section) => <article key={section.title}><SectionHeading title={section.title} /><div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground"><div>{section.body}</div>{section.bullets ? <ul className="grid gap-3 md:grid-cols-2">{section.bullets.map((item) => <li key={item} className="rounded-xl border border-border bg-ink p-4">{item}</li>)}</ul> : null}</div></article>)}</div></div></section>
    <CtaSection title={topic.ctaTitle} description={topic.ctaDescription} />
  </PublicShell>;
}

export function topicHead(topic: StudioTopic) {
  return { meta: [{ title: topic.title }, { name: "description", content: topic.description }, { property: "og:title", content: topic.title }, { property: "og:description", content: topic.description }, { property: "og:url", content: topic.canonical }], links: [{ rel: "canonical", href: topic.canonical }] };
}
