import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScrollProgress } from "@/components/interactive-home";

const primaryNav = [
  ["/solutions", "What we fix"],
  ["/offers", "Solutions"],
  ["/resources", "Resources"],
  ["/about", "About"],
] as const;

const menuGroups = [
  {
    title: "Solutions",
    description: "Choose the smallest useful intervention for the studio's current constraint.",
    links: [
      ["/solutions", "What we fix", "Start with the commercial constraint"],
      ["/offers", "All solutions", "Compare the full INKSIGHTS offer stack"],
      ["/offers/72-hour-visibility-fix", "72-Hour Visibility Fix", "Repair urgent local visibility issues"],
      ["/offers/revenue-audit", "Revenue Audit", "Diagnose conversion, capacity and revenue leakage"],
      ["/offers/booking-retention-engine", "Booking & Retention", "Improve booking control and repeat value"],
      ["/offers/visibility-watch", "Visibility Watch", "Ongoing visibility monitoring"],
    ],
  },
  {
    title: "Studio tools",
    description: "Free diagnostics, benchmarks and commercial decision tools.",
    links: [
      ["/resources", "Resource library", "Browse all free studio tools"],
      ["/studio-growth-check", "Free Revenue Audit", "Find the strongest commercial pressure"],
      ["/tattoo-studio-visibility-scorecard", "Visibility Scorecard", "Check local search and booking visibility"],
      ["/pricing-benchmark", "Pricing Benchmark", "Compare rates with UK reference bands"],
      ["/growth-model", "Revenue Growth Model", "Model volume, value and frequency"],
      ["/tattoo-studio-software", "Software Comparison", "Compare studio workflow platforms"],
    ],
  },
  {
    title: "Growth guides",
    description: "Practical guidance across acquisition, booking, revenue and retention.",
    links: [
      ["/tattoo-studio-growth", "Studio growth", "Commercial growth systems for tattoo studios"],
      ["/tattoo-studio-marketing", "Marketing", "Demand generation and positioning"],
      ["/tattoo-studio-seo", "SEO & local search", "Improve discovery and search visibility"],
      ["/tattoo-studio-booking", "Booking systems", "Turn enquiries into protected diary time"],
      ["/tattoo-studio-client-retention", "Client retention", "Increase repeat projects and rebooking"],
      ["/tattoo-studio-revenue", "Revenue", "Understand the commercial drivers behind revenue"],
      ["/tattoo-studio-management", "Studio management", "Operational systems for studio owners"],
    ],
  },
  {
    title: "Company",
    description: "About INKSIGHTS, proof, support and contact routes.",
    links: [
      ["/about", "About INKSIGHTS", "Why the platform exists and how it works"],
      ["/case-studies", "Proof library", "Evidence, outcomes and studio examples"],
      ["/contact", "Contact", "Speak to INKSIGHTS"],
      ["/support", "Customer support", "Get help with an existing service"],
      ["/auth", "Sign in", "Access your INKSIGHTS account"],
    ],
  },
] as const;

type LogoVariant = "primary-dark" | "primary-light" | "mono-white" | "icon";

const logoAssets: Record<LogoVariant, { src: string; width: number; height: number }> = {
  "primary-dark": { src: "/brand/logo-v3/primary-dark.svg", width: 210, height: 40 },
  "primary-light": { src: "/brand/logo-v3/primary-light.svg", width: 210, height: 40 },
  "mono-white": { src: "/brand/logo-v3/mono-white.svg", width: 210, height: 40 },
  icon: { src: "/brand/logo-v3/icon-flat.svg", width: 52, height: 52 },
};

export function Logo({
  variant = "primary-dark",
  className = "",
  decorative = false,
}: {
  variant?: LogoVariant;
  className?: string;
  decorative?: boolean;
}) {
  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 300 300"
        width="52"
        height="52"
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : "INKSIGHTS"}
        aria-hidden={decorative ? true : undefined}
        className={`brand-logo brand-logo-icon brand-logo-motion-mark ${className}`}
      >
        <defs>
          <linearGradient id="inksights-logo-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7CFFF1" />
            <stop offset="55%" stopColor="#35E6D4" />
            <stop offset="100%" stopColor="#0A7076" />
          </linearGradient>
        </defs>
        <rect className="brand-logo-bar brand-logo-bar-one" x="32" y="170" width="58" height="94" rx="29" fill="url(#inksights-logo-gradient)" />
        <rect className="brand-logo-bar brand-logo-bar-two" x="121" y="132" width="58" height="132" rx="29" fill="url(#inksights-logo-gradient)" />
        <rect className="brand-logo-bar brand-logo-bar-three" x="210" y="72" width="58" height="192" rx="29" fill="url(#inksights-logo-gradient)" />
      </svg>
    );
  }

  const asset = logoAssets[variant];
  return (
    <img
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={decorative ? "" : "INKSIGHTS"}
      aria-hidden={decorative ? "true" : undefined}
      className={`brand-logo brand-logo-${variant} ${className}`}
      decoding="async"
    />
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Solutions", "Studio tools"]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const toggleGroup = (title: string) => {
    setExpandedGroups((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title],
    );
  };

  const closeMenu = () => setOpen(false);

  return (
    <>
      <a href="#main-content" className="sr-only z-[100] rounded-md bg-mint px-4 py-2 font-bold text-ink-deep focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>

      <header className="site-header sticky top-0 z-50 border-b border-border/50 bg-ink-deep/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-6">
          <Link to="/" aria-label="INKSIGHTS home"><Logo variant="primary-dark" /></Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground lg:flex" aria-label="Primary navigation">
            {primaryNav.map(([href, label]) => (
              <a key={href} href={href} className="nav-link transition hover:text-mint">{label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/studio-growth-check"
              className="shine-button hidden rounded-full bg-mint px-5 py-2.5 text-sm font-bold text-ink-deep transition hover:bg-mint-soft sm:inline-flex"
            >
              Free Revenue Audit
            </a>
            <button
              type="button"
              aria-label={open ? "Close site menu" : "Open site menu"}
              aria-expanded={open}
              aria-controls="site-menu-drawer"
              onClick={() => setOpen((value) => !value)}
              className={`burger-menu-trigger ${open ? "is-open" : ""}`}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="hidden text-sm font-bold sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="site-menu-layer" role="presentation">
          <button
            type="button"
            className="site-menu-backdrop"
            aria-label="Close site menu"
            onClick={closeMenu}
          />
          <aside
            id="site-menu-drawer"
            className="site-menu-drawer"
            aria-label="Site navigation"
            aria-modal="true"
            role="dialog"
          >
            <div className="site-menu-drawer-header">
              <Link to="/" onClick={closeMenu} aria-label="INKSIGHTS home">
                <Logo variant="mono-white" />
              </Link>
              <button type="button" onClick={closeMenu} className="site-menu-close" aria-label="Close site menu">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="site-menu-intro">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-mint">Navigate INKSIGHTS</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Explore studio growth solutions, diagnostics, tools, guides and account routes.
              </p>
            </div>

            <nav className="site-menu-groups" aria-label="Expanded site navigation">
              {menuGroups.map((group) => {
                const expanded = expandedGroups.includes(group.title);
                return (
                  <section key={group.title} className={`site-menu-group ${expanded ? "is-expanded" : ""}`}>
                    <button
                      type="button"
                      className="site-menu-group-toggle"
                      aria-expanded={expanded}
                      onClick={() => toggleGroup(group.title)}
                    >
                      <span>
                        <strong>{group.title}</strong>
                        <small>{group.description}</small>
                      </span>
                      <ChevronDown className="site-menu-chevron h-5 w-5" aria-hidden="true" />
                    </button>

                    {expanded ? (
                      <div className="site-menu-subpages">
                        {group.links.map(([href, label, description]) => (
                          <a key={href} href={href} onClick={closeMenu} className="site-menu-subpage">
                            <span>
                              <strong>{label}</strong>
                              <small>{description}</small>
                            </span>
                            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </nav>

            <div className="site-menu-actions">
              <a href="/studio-growth-check" onClick={closeMenu} className="shine-button inline-flex min-h-12 items-center justify-center rounded-full bg-mint px-5 py-3 font-bold text-ink-deep">
                Run the free Revenue Audit
              </a>
              <a href="/contact" onClick={closeMenu} className="outline-button inline-flex min-h-12 items-center justify-center rounded-full border border-border px-5 py-3 font-bold text-ice">
                Contact INKSIGHTS
              </a>
            </div>

            <div className="site-menu-legal">
              <a href="/privacy" onClick={closeMenu}>Privacy</a>
              <a href="/cookies" onClick={closeMenu}>Cookies</a>
              <a href="/terms" onClick={closeMenu}>Terms</a>
              <a href="/accessibility" onClick={closeMenu}>Accessibility</a>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

export function SiteFooter() {
  const groups = [
    { title: "Solutions", links: [["/solutions", "What we fix"], ["/offers", "All solutions"], ["/offers/72-hour-visibility-fix", "72-Hour Visibility Fix"], ["/offers/visibility-watch", "Visibility Watch"], ["/offers/booking-retention-engine", "Booking & Retention"]] },
    { title: "Studio tools", links: [["/studio-growth-check", "Free Revenue Audit"], ["/tattoo-studio-visibility-scorecard", "Visibility Scorecard"], ["/tattoo-studio-software", "Software comparison"], ["/growth-model", "Revenue Growth Model"]] },
    { title: "Company", links: [["/about", "About INKSIGHTS"], ["/case-studies", "Proof library"], ["/support", "Customer support"], ["/contact", "Contact"], ["/privacy", "Privacy"], ["/cookies", "Cookies"], ["/terms", "Terms"], ["/accessibility", "Accessibility"]] }
  ];
  return <footer className="border-t border-border bg-ink"><div className="mx-auto max-w-7xl px-6 py-14"><div className="grid gap-10 lg:grid-cols-[1.25fr_2fr]"><div><Logo variant="mono-white" /><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">Growth intelligence, diagnostics and commercial systems designed specifically for UK tattoo studios.</p><a href="/contact" className="mt-5 inline-block text-sm font-semibold text-mint hover:text-mint-soft">Contact INKSIGHTS →</a></div><div className="grid gap-8 sm:grid-cols-3">{groups.map((group) => <div key={group.title}><h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ice">{group.title}</h2><ul className="mt-4 space-y-3 text-sm text-muted-foreground">{group.links.map(([href, label]) => <li key={href}><a href={href} className="transition hover:text-mint">{label}</a></li>)}</ul></div>)}</div></div><div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} INKSIGHTS. All rights reserved.</p><button type="button" onClick={() => window.dispatchEvent(new Event("inksight:open-consent"))} className="text-left transition hover:text-mint">Change cookie preferences</button></div></div></footer>;
}

export function PublicShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen overflow-x-hidden bg-ink-deep text-foreground"><ScrollProgress /><SiteHeader /><main id="main-content" className="brand-dark brand-balanced">{children}</main><SiteFooter /></div>;
}

export function PageHero({ eyebrow, title, description, children, compact = false }: { eyebrow: string; title: ReactNode; description: ReactNode; children?: ReactNode; compact?: boolean }) {
  return <section className="brand-editorial-hero hero-ambient relative overflow-hidden border-b border-border grid-bg"><div className="ambient-orb ambient-orb-one" aria-hidden="true" /><div className="ambient-orb ambient-orb-two" aria-hidden="true" /><Logo variant="icon" decorative className="page-hero-logo-mark" /><div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ink-deep/55 to-ink-deep" /><div className={`relative mx-auto max-w-7xl px-6 ${compact ? "py-16 md:py-20" : "py-20 md:py-28"}`}><p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">{eyebrow}</p><h1 className="mt-5 max-w-5xl text-balance font-display text-4xl font-black leading-[1.02] tracking-tight text-ice sm:text-5xl md:text-7xl">{title}</h1><div className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">{description}</div>{children ? <div className="mt-9 flex flex-wrap gap-3">{children}</div> : null}</div></section>;
}

export function PrimaryButton({ href, children }: { href: string; children: ReactNode }) { return <a href={href} className="shine-button group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-mint px-6 py-3 font-bold text-ink-deep transition hover:bg-mint-soft">{children}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></a>; }
export function SecondaryButton({ href, children }: { href: string; children: ReactNode }) { return <a href={href} className="outline-button inline-flex min-h-12 items-center justify-center rounded-full border border-border px-6 py-3 font-bold text-ice transition hover:border-mint hover:text-mint">{children}</a>; }
export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: ReactNode; description?: ReactNode }) { return <div className="max-w-3xl">{eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">{eyebrow}</p> : null}<h2 className="mt-3 text-balance font-display text-3xl font-black tracking-tight text-ice md:text-5xl">{title}</h2>{description ? <div className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{description}</div> : null}</div>; }
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) { return <div className={`interactive-card rounded-2xl border border-border bg-ink p-6 ${className}`}>{children}</div>; }
export function CtaSection({ eyebrow = "Start with the diagnosis", title = "Find the constraint before buying another tool.", description = "The free Revenue Audit identifies the strongest commercial pressure and routes the studio to the most useful next step." }: { eyebrow?: string; title?: string; description?: string }) { return <section className="brand-dark relative overflow-hidden border-y border-border bg-ink"><div className="ambient-orb ambient-orb-one" aria-hidden="true" /><Logo variant="icon" decorative className="cta-logo-mark" /><div className="relative mx-auto max-w-5xl px-6 py-16 text-center md:py-24"><p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">{eyebrow}</p><h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-6xl">{title}</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p><div className="mt-8 flex justify-center"><PrimaryButton href="/studio-growth-check">Run the free Revenue Audit</PrimaryButton></div></div></section>; }
export function RevenueLeakageMap() {
  const steps = [
    ["01", "Search", "Can the right clients find you?"],
    ["02", "Enquiry", "Do they submit a useful request?"],
    ["03", "Booking", "Does demand become protected time?"],
    ["04", "Session", "Does capacity become revenue?"],
    ["05", "Return", "Does one client become repeat value?"],
  ] as const;
  const mapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = mapRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.28 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [paused, visible, steps.length]);

  return (
    <div
      ref={mapRef}
      className={`revenue-leakage-map brand-dark rounded-3xl border border-mint/25 bg-ink-deep p-5 shadow-2xl shadow-black/20 md:p-7 ${visible ? "is-visible" : ""}`}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-mint">Revenue leakage map</p>
          <h3 className="mt-2 font-display text-2xl font-black text-ice">Where does momentum disappear?</h3>
        </div>
        <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-mint/30 bg-mint/10 font-mono text-xs text-mint sm:flex">MODEL</div>
      </div>
      <div className="mt-7 grid gap-3 md:grid-cols-5">
        {steps.map(([number, label, text], index) => {
          const active = index === activeStep;
          const complete = index < activeStep;
          return (
            <button
              key={number}
              type="button"
              onClick={() => setActiveStep(index)}
              onFocus={() => setActiveStep(index)}
              onPointerEnter={() => setActiveStep(index)}
              className={`revenue-leakage-step relative rounded-2xl border border-border bg-ink p-5 text-left ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
              aria-pressed={active}
            >
              <div className="font-mono text-xs text-mint">{number}</div>
              <h4 className="mt-3 font-display text-xl font-black text-ice">{label}</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p>
              {index < steps.length - 1 ? <span className="revenue-leakage-connector pointer-events-none absolute -right-2.5 top-1/2 hidden h-px w-5 bg-mint/50 md:block" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/5 p-4 text-sm leading-relaxed text-muted-foreground">
        <strong className="text-ice">INKSIGHTS principle:</strong> more traffic is not automatically the answer. Find the first material point where demand, time or value is being lost.
      </div>
    </div>
  );
}
export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) { return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />; }
export function ArticleLayout({ children, aside }: { children: ReactNode; aside?: ReactNode }) { return <section className="bg-ink-deep"><div className={`mx-auto grid max-w-7xl gap-10 px-6 py-14 md:py-20 ${aside ? "lg:grid-cols-[minmax(0,1fr)_320px]" : "max-w-4xl"}`}><article className="article-prose min-w-0">{children}</article>{aside ? <aside className="lg:sticky lg:top-24 lg:self-start">{aside}</aside> : null}</div></section>; }
export function SourceList({ sources }: { sources: Array<{ label: string; href: string; note?: string }> }) { return <section aria-labelledby="sources-heading" className="mt-12 border-t border-border pt-8"><h2 id="sources-heading" className="font-display text-2xl font-black text-ice">Sources and verification</h2><ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">{sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer" className="font-semibold text-mint hover:text-mint-soft">{source.label}</a>{source.note ? ` — ${source.note}` : ""}</li>)}</ul></section>; }
export function Disclaimer({ children }: { children: ReactNode }) { return <div className="rounded-2xl border border-amber-300/35 bg-amber-300/10 p-5 text-sm leading-relaxed text-amber-100"><strong className="text-amber-200">Important:</strong> {children}</div>; }
