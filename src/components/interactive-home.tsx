import {
  Activity,
  ArrowRight,
  CalendarCheck2,
  Eye,
  MousePointer2,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

const journeySteps = [
  {
    label: "Discover",
    eyebrow: "Local visibility",
    score: 78,
    icon: Search,
    description:
      "A potential client finds the studio through search, Maps, social or a recommendation.",
    leak: "Inconsistent location signals make a strong studio difficult to discover at the right moment.",
    fix: "Align the studio profile, website and local proof around one clear service area.",
  },
  {
    label: "Trust",
    eyebrow: "Proof and confidence",
    score: 64,
    icon: Eye,
    description:
      "The visitor checks healed work, reviews, policies, artist fit and professionalism.",
    leak: "Strong work is present, but the evidence is scattered or leaves key booking questions unanswered.",
    fix: "Sequence portfolio, reviews and process proof so the next decision feels low-risk.",
  },
  {
    label: "Enquire",
    eyebrow: "Enquiry quality",
    score: 42,
    icon: MousePointer2,
    description:
      "The prospect chooses a route, supplies the right information and receives a useful response.",
    leak: "The booking route is vague, slow or asks for too little information to qualify the project.",
    fix: "Use one prominent CTA and a short, structured enquiry path with immediate confirmation.",
  },
  {
    label: "Book",
    eyebrow: "Deposit and diary",
    score: 71,
    icon: CalendarCheck2,
    description: "A qualified request becomes a protected appointment with clear expectations.",
    leak: "Manual handoffs and inconsistent reminders allow warm enquiries to cool or appointments to fail.",
    fix: "Connect qualification, deposit, confirmation and reminder steps into one controlled flow.",
  },
  {
    label: "Return",
    eyebrow: "Retention and advocacy",
    score: 55,
    icon: UserRoundCheck,
    description:
      "Aftercare, reviews, rebooking and project continuation turn one session into long-term value.",
    leak: "The relationship becomes passive once the client leaves the studio.",
    fix: "Trigger useful aftercare, review and rebooking touchpoints at the correct intervals.",
  },
] as const;

const signalMetrics = [
  { label: "Visibility", value: 78, note: "Discoverable but inconsistent" },
  { label: "Enquiry route", value: 42, note: "Primary constraint detected" },
  { label: "Booking control", value: 71, note: "Strong foundation" },
  { label: "Client return", value: 55, note: "Untapped follow-up value" },
] as const;

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maximum > 0 ? Math.min(window.scrollY / maximum, 1) : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="site-scroll-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10%", threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element || event.pointerType === "touch") return;

    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const rotateX = (0.5 - y) * 7;
    const rotateY = (x - 0.5) * 7;

    element.style.setProperty("--tilt-x", `${rotateX}deg`);
    element.style.setProperty("--tilt-y", `${rotateY}deg`);
    element.style.setProperty("--pointer-x", `${x * 100}%`);
    element.style.setProperty("--pointer-y", `${y * 100}%`);
  };

  const reset = () => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={reset} className={`tilt-card ${className}`}>
      {children}
    </div>
  );
}

export function HeroSignalPanel() {
  const [activeMetric, setActiveMetric] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveMetric((current) => (current + 1) % signalMetrics.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const panel = panelRef.current;
    if (!panel || event.pointerType === "touch") return;
    const bounds = panel.getBoundingClientRect();
    panel.style.setProperty(
      "--panel-x",
      `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
    );
    panel.style.setProperty(
      "--panel-y",
      `${((event.clientY - bounds.top) / bounds.height) * 100}%`,
    );
  };

  return (
    <div
      ref={panelRef}
      onPointerMove={handlePointerMove}
      className="hero-signal-panel"
      aria-label="Interactive studio signal model"
    >
      <div className="hero-signal-glow" aria-hidden="true" />
      <div className="hero-radar" aria-hidden="true">
        <span className="radar-ring radar-ring-one" />
        <span className="radar-ring radar-ring-two" />
        <span className="radar-ring radar-ring-three" />
        <span className="radar-axis radar-axis-x" />
        <span className="radar-axis radar-axis-y" />
        <span className="radar-sweep" />
        <span className="orbit-node orbit-node-one" />
        <span className="orbit-node orbit-node-two" />
        <span className="orbit-node orbit-node-three" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-ink-deep/75 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-mint backdrop-blur-xl">
              <span className="live-dot" /> Interactive model
            </div>
            <h2 className="mt-4 max-w-xs font-display text-2xl font-black leading-tight text-ice sm:text-3xl">
              See where studio demand loses momentum.
            </h2>
          </div>
          <Activity className="h-7 w-7 shrink-0 text-mint" />
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {signalMetrics.map((metric, index) => {
            const active = activeMetric === index;
            return (
              <button
                key={metric.label}
                type="button"
                onClick={() => setActiveMetric(index)}
                className={`signal-metric ${active ? "is-active" : ""}`}
                aria-pressed={active}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {metric.label}
                  </span>
                  <span className="font-display text-2xl font-black text-mint">{metric.value}</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-deep/80">
                  <span className="signal-meter" style={{ width: `${metric.value}%` }} />
                </div>
                <p className="mt-2 text-left text-xs text-muted-foreground">{metric.note}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-mint/20 bg-ink-deep/75 p-4 backdrop-blur-xl">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-mint">
              Current priority
            </p>
            <p className="mt-1 text-sm font-bold text-ice">{signalMetrics[activeMetric].label}</p>
          </div>
          <a
            href="/studio-growth-check"
            className="group inline-flex items-center gap-2 text-sm font-bold text-mint"
          >
            Diagnose yours{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function SignalTicker() {
  const signals = [
    "Google visibility",
    "Portfolio trust",
    "Enquiry quality",
    "Deposit control",
    "Cancellation protection",
    "Review momentum",
    "Client retention",
    "Owner visibility",
  ];

  const repeated = [...signals, ...signals];

  return (
    <div className="signal-ticker" aria-label="INKSIGHT system coverage">
      <div className="signal-ticker-track">
        {repeated.map((signal, index) => (
          <span
            key={`${signal}-${index}`}
            className="signal-ticker-item"
            aria-hidden={index >= signals.length}
          >
            <Sparkles className="h-3.5 w-3.5" /> {signal}
          </span>
        ))}
      </div>
    </div>
  );
}

export function InteractiveJourney() {
  const [active, setActive] = useState(2);
  const [paused, setPaused] = useState(false);
  const step = journeySteps[active];
  const ActiveIcon = step.icon;

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % journeySteps.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section className="relative overflow-hidden border-y border-border bg-ink journey-section">
      <div className="journey-orb journey-orb-one" aria-hidden="true" />
      <div className="journey-orb journey-orb-two" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
        <Reveal>
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">
              Explore the client journey
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-black tracking-tight text-ice md:text-5xl">
              Move through the system. Find the leak.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Select a stage to see what the client experiences, where momentum commonly disappears
              and the minimum useful correction.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-stretch">
          <Reveal className="h-full" delay={80}>
            <div
              className="journey-map h-full"
              onPointerEnter={() => setPaused(true)}
              onPointerLeave={() => setPaused(false)}
            >
              <div className="journey-rail" aria-hidden="true">
                <span
                  className="journey-rail-progress"
                  style={{ width: `${(active / (journeySteps.length - 1)) * 100}%` }}
                />
              </div>
              <div className="relative z-10 grid grid-cols-5 gap-2">
                {journeySteps.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = index === active;
                  const isComplete = index < active;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setActive(index)}
                      className={`journey-node ${isActive ? "is-active" : ""} ${isComplete ? "is-complete" : ""}`}
                      aria-pressed={isActive}
                    >
                      <span className="journey-node-icon">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="mt-3 hidden text-xs font-bold sm:block">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 rounded-3xl border border-border/80 bg-ink-deep/80 p-6 backdrop-blur-xl md:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-mint">
                      {step.eyebrow}
                    </p>
                    <h3 className="mt-2 font-display text-3xl font-black text-ice">{step.label}</h3>
                    <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <div className="journey-score">
                    <span>{step.score}</span>
                    <small>/100</small>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-rose-300/15 bg-rose-300/5 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-200">
                      Common leak
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.leak}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-mint/20 bg-mint/5 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-mint">
                      Minimum useful fix
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.fix}</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="h-full" delay={160}>
            <TiltCard className="h-full">
              <div className="journey-focus-card h-full">
                <div className="journey-focus-icon">
                  <ActiveIcon className="h-8 w-8" />
                </div>
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-mint">
                  Active system signal
                </p>
                <h3 className="mt-3 font-display text-4xl font-black text-ice">{step.eyebrow}</h3>
                <p className="mt-5 leading-relaxed text-muted-foreground">
                  INKSIGHT separates observed information, assumptions and results so the next
                  action is tied to evidence rather than generic marketing advice.
                </p>
                <div className="mt-8 space-y-3">
                  {["One visible constraint", "One responsible owner", "One recheck metric"].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl border border-border/80 bg-ink-deep/70 px-4 py-3 text-sm font-semibold text-ice"
                      >
                        <ShieldCheck className="h-4 w-4 shrink-0 text-mint" /> {item}
                      </div>
                    ),
                  )}
                </div>
                <a
                  href="/studio-growth-check"
                  className="shine-button mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-mint px-6 py-3 font-bold text-ink-deep"
                >
                  Find your strongest leak <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
