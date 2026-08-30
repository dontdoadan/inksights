import type { ReactNode } from "react";
import { PageHero, PublicShell } from "@/components/public-site";

export function LegalPage({
  eyebrow,
  title,
  description,
  updated = "26 July 2026",
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <PublicShell>
      <PageHero eyebrow={eyebrow} title={title} description={description} compact />
      <section>
        <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">
          <div className="mb-8 rounded-xl border border-border bg-ink p-4 text-sm text-muted-foreground">
            Last updated: {updated}
          </div>
          <article className="article-prose">{children}</article>
        </div>
      </section>
    </PublicShell>
  );
}
