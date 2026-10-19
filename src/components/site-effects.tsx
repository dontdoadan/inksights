import { useEffect, useRef } from "react";

export function SiteEffects() {
  const pulseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let pressedTarget: HTMLElement | null = null;
    let spotlightTarget: HTMLElement | null = null;
    let magneticTarget: HTMLElement | null = null;

    root.classList.add("site-motion");

    const resetSpotlight = () => {
      if (!spotlightTarget) return;
      spotlightTarget.classList.remove("is-spotlight-active");
      spotlightTarget.style.removeProperty("--spotlight-x");
      spotlightTarget.style.removeProperty("--spotlight-y");
      spotlightTarget = null;
    };

    const resetMagnet = () => {
      if (!magneticTarget) return;
      magneticTarget.style.removeProperty("--magnet-x");
      magneticTarget.style.removeProperty("--magnet-y");
      magneticTarget = null;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || reduceMotion.matches) return;
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        root.style.setProperty("--site-pointer-x", `${event.clientX}px`);
        root.style.setProperty("--site-pointer-y", `${event.clientY}px`);
        root.classList.add("has-site-pointer");

        const element = event.target instanceof Element ? event.target : null;
        const interactive = element?.closest(
          ".interactive-card, .revenue-leakage-step, .shine-button, .outline-button, .signal-metric, .journey-node",
        );
        root.classList.toggle("pointer-over-interactive", Boolean(interactive));

        const nextSpotlight = element?.closest<HTMLElement>(
          ".interactive-card, .revenue-leakage-step, .journey-focus-card",
        ) ?? null;
        if (nextSpotlight !== spotlightTarget) {
          resetSpotlight();
          spotlightTarget = nextSpotlight;
        }
        if (spotlightTarget) {
          const bounds = spotlightTarget.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width) * 100;
          const y = ((event.clientY - bounds.top) / bounds.height) * 100;
          spotlightTarget.style.setProperty("--spotlight-x", `${x}%`);
          spotlightTarget.style.setProperty("--spotlight-y", `${y}%`);
          spotlightTarget.classList.add("is-spotlight-active");
        }

        const nextMagnetic = element?.closest<HTMLElement>(".shine-button, .outline-button") ?? null;
        if (nextMagnetic !== magneticTarget) {
          resetMagnet();
          magneticTarget = nextMagnetic;
        }
        if (magneticTarget) {
          const bounds = magneticTarget.getBoundingClientRect();
          const dx = Math.max(-6, Math.min(6, ((event.clientX - (bounds.left + bounds.width / 2)) / bounds.width) * 12));
          const dy = Math.max(-5, Math.min(5, ((event.clientY - (bounds.top + bounds.height / 2)) / bounds.height) * 10));
          magneticTarget.style.setProperty("--magnet-x", `${dx.toFixed(2)}px`);
          magneticTarget.style.setProperty("--magnet-y", `${dy.toFixed(2)}px`);
        }
      });
    };

    const clearPointer = () => {
      root.classList.remove("has-site-pointer", "pointer-over-interactive");
      resetSpotlight();
      resetMagnet();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>("a, button, [role='button'], input, select, textarea")
        : null;
      if (!target) return;

      pressedTarget = target;
      target.classList.add("is-site-pressed");

      if (!finePointer.matches || reduceMotion.matches) return;
      const pulse = pulseRef.current;
      if (!pulse) return;
      pulse.style.left = `${event.clientX}px`;
      pulse.style.top = `${event.clientY}px`;
      pulse.classList.remove("is-active");
      void pulse.offsetWidth;
      pulse.classList.add("is-active");
    };

    const releasePressed = () => {
      pressedTarget?.classList.remove("is-site-pressed");
      pressedTarget = null;
    };

    const handleScroll = () => {
      const compact = window.scrollY > 96;
      document.querySelector<HTMLElement>(".site-header")?.classList.toggle("is-compact", compact);
      if (!reduceMotion.matches) {
        const shift = Math.min(18, window.scrollY * 0.018);
        root.style.setProperty("--site-scroll-shift", `${shift.toFixed(2)}px`);
      }
    };

    const observer = reduceMotion.matches
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px -8%", threshold: 0.08 },
        );

    const registered = new WeakSet<Element>();
    const registerRevealTargets = () => {
      const targets = document.querySelectorAll(
        "main > section:not(:first-of-type), main article > h2, main article > h3, main article > p, main article > ul, main article > ol, main article > blockquote, main article > .table-wrap, main form",
      );

      targets.forEach((target) => {
        if (registered.has(target) || target.closest("[data-motion='off']")) return;
        registered.add(target);
        target.classList.add("motion-reveal");

        if (reduceMotion.matches || target.getBoundingClientRect().top < window.innerHeight * 0.92) {
          target.classList.add("is-visible");
          return;
        }
        observer?.observe(target);
      });
    };

    registerRevealTargets();
    handleScroll();

    const mutationObserver = new MutationObserver(registerRevealTargets);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("blur", clearPointer);
    document.addEventListener("pointerleave", clearPointer);
    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("pointerup", releasePressed, { passive: true });
    document.addEventListener("pointercancel", releasePressed, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("site-motion", "has-site-pointer", "pointer-over-interactive");
      root.style.removeProperty("--site-pointer-x");
      root.style.removeProperty("--site-pointer-y");
      root.style.removeProperty("--site-scroll-shift");
      document.querySelector<HTMLElement>(".site-header")?.classList.remove("is-compact");
      releasePressed();
      resetSpotlight();
      resetMagnet();
      observer?.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("blur", clearPointer);
      document.removeEventListener("pointerleave", clearPointer);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", releasePressed);
      document.removeEventListener("pointercancel", releasePressed);
    };
  }, []);

  return (
    <>
      <div className="site-pointer-glow" aria-hidden="true" />
      <div ref={pulseRef} className="site-click-pulse" aria-hidden="true" />
    </>
  );
}
