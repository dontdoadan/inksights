import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ScrollProgress } from "@/components/interactive-home";

const navItems = [
  ["/offers", "Solutions"],
  ["/resources", "Resources"],
  ["/case-studies", "Proof"],
  ["/about", "About"],
] as const;

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="logo-mark flex h-8 w-8 items-center justify-center rounded-lg bg-mint">
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink-deep">
          <span className="h-1.5 w-1.5 rounded-full bg-mint-soft" />
        </span>
      </span>
      <span className="text-xl font-extrabold tracking-tight text-ice">
        INK<span className="text-mint">SIGHT</span>
      </span>
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <a href="#main-content" className="sr-only z-[100] rounded-md bg-mint px-4 py-2 font-bold text-ink-deep focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <header className="site-header sticky top-0 z-50 border-b border-border/50 bg-ink-deep/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6">
          <Link to="/" aria-label="INKSIGHT home"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground lg:flex" aria-label="Primary navigation">
            {navItems.map(([href, label]) => (
              <a key={href} href={href} className="nav-link transition hover:text-mint">{label}</a>
            ))}
            <a href="/studio-growth-check" className="shine-button rounded-full bg-mint px-5 py-2.5 font-bold text-ink-deep transition hover:bg-mint-soft">
              Free Growth Check
            </a>
          </nav>
          <button
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-ice transition hover:border-mint hover:text-mint lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open ? (
          <nav className="border-t border-border bg-ink px-5 py-5 lg:hidden" aria-label="Mobile navigation">
            <div className="mx-auto grid max-w-7xl gap-2">
              {navItems.map(([href, label]) => (
                <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 font-semibold text-ice transition hover:bg-ink-elev hover:text-mint">{label}</a>
              ))}
              <a href="/studio-growth-check" onClick={() => setOpen(false)} className="shine-button mt-2 rounded-xl bg-mint px-4 py-3 text-center font-bold text-ink-deep">
                Start the free Growth Check
              </a>
            </div>
          </nav>
        ) : null}
      </header>
    </>
  );
}

export function SiteFooter() {
  const groups = [
    {
      title: "Solutions",
      links: [
        ["/offers", "All solutions"],
        ["/offers/72-hour-visibility-fix", "72-Hour Visibility Fix"],
        ["/offers/visibility-watch", "Visibility Watch"],
        ["/offers/booking-retention-engine", "Booking & Retention"],
      ],
    },
    {
      title: "Resources",
      links: [
        ["/resources", "Resource library"],
        ["/studio-growth-check", "Studio Growth Check"],
        ["/tattoo-studio-visibility-scorecard", "Visibility Scorecard"],
        ["/tattoo-studio-software", "Software comparison"],
      ],
    },
    {
      title: "Company",
      links: [
        ["/about", "About INKSIGHT"],
        ["/case-studies", "Proof and demonstrations"],
        ["/support", "Customer support"],
        ["/contact", "Contact"],
        ["/privacy", "Privacy"],
        ["/cookies", "Cookies"],
        ["/terms", "Terms"],
        ["/accessibility", "Accessibility"],
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-ink">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Growth, booking and retention systems designed specifically for UK tattoo studios.
            </p>
            <a href="mailto:contact@getinksight.co.uk" className="mt-5 inline-block text-sm font-semibold text-mint hover:text-mint-soft">
              contact@getinksight.co.uk
            </a>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ice">{group.title}</h2>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {group.links.map(([href, label]) => (
                    <li key={href}><a href={href} className="transition hover:text-mint">{label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} INKSIGHT. All rights reserved.</p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("inksight:open-consent"))}
            className="text-left transition hover:text-mint"
          >
            Change cookie preferences
          </button>
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-ink-deep text-foreground">
      <ScrollProgress />
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="hero-ambient relative overflow-hidden border-b border-border grid-bg">
      <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-two" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ink-deep/55 to-ink-deep" />
      <div className={`relative mx-auto max-w-7xl px-6 ${compact ? "py-16 md:py-20" : "py-20 md:py-28"}`}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">{eyebrow}</p>
        <h1 className="mt-5 max-w-5xl text-balance font-display text-4xl font-black leading-[1.02] tracking-tight text-ice sm:text-5xl md:text-7xl">
          {title}
        </h1>
        <div className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">{description}</div>
        {children ? <div className="mt-9 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </section>
  );
}

export function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="shine-button group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-mint px-6 py-3 font-bold text-ink-deep transition hover:bg-mint-soft">
      {children}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </a>
  );
}

export function SecondaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="outline-button inline-flex min-h-12 items-center justify-center rounded-full border border-border px-6 py-3 font-bold text-ice transition hover:border-mint hover:text-mint">
      {children}
    </a>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: ReactNode; description?: ReactNode }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">{eyebrow}</p> : null}
      <h2 className="mt-3 text-balance font-display text-3xl font-black tracking-tight text-ice md:text-5xl">{title}</h2>
      {description ? <div className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{description}</div> : null}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`interactive-card rounded-2xl border border-border bg-ink p-6 ${className}`}>{children}</div>;
}

export function CtaSection({
  eyebrow = "Start with the diagnosis",
  title = "Find the constraint before buying another tool.",
  description = "The free Studio Growth Check identifies the strongest commercial pressure and routes the studio to the most useful next step.",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden border-y border-border bg-ink">
      <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
      <div className="relative mx-auto max-w-5xl px-6 py-16 text-center md:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">{eyebrow}</p>
        <h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-6xl">{title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-8 flex justify-center"><PrimaryButton href="/studio-growth-check">Start the free Growth Check</PrimaryButton></div>
      </div>
    </section>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ArticleLayout({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="bg-ink-deep">
      <div className={`mx-auto grid max-w-7xl gap-10 px-6 py-14 md:py-20 ${aside ? "lg:grid-cols-[minmax(0,1fr)_320px]" : "max-w-4xl"}`}>
        <article className="article-prose min-w-0">{children}</article>
        {aside ? <aside className="lg:sticky lg:top-24 lg:self-start">{aside}</aside> : null}
      </div>
    </section>
  );
}

export function SourceList({ sources }: { sources: Array<{ label: string; href: string; note?: string }> }) {
  return (
    <section aria-labelledby="sources-heading" className="mt-12 border-t border-border pt-8">
      <h2 id="sources-heading" className="font-display text-2xl font-black text-ice">Sources and verification</h2>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {sources.map((source) => (
          <li key={source.href}>
            <a href={source.href} target="_blank" rel="noreferrer" className="font-semibold text-mint hover:text-mint-soft">{source.label}</a>
            {source.note ? ` — ${source.note}` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-300/35 bg-amber-300/10 p-5 text-sm leading-relaxed text-amber-100">
      <strong className="text-amber-200">Important:</strong> {children}
    </div>
  );
}
