"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lenis smooth scrolling, GSAP reveals for [data-reveal] blocks and parallax for [data-speed] layers.
 * Content is visible by default: animations only run once JS loads and motion is allowed.
 */
export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      // Phones resize the viewport as the address bar hides; don't recalculate every trigger for that.
      ScrollTrigger.config({ ignoreMobileResize: true });

      // One clock for everything: Lenis advances on GSAP's ticker and tells ScrollTrigger when it moves.
      const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      // Exposed so scroll-to helpers (stacking cards counter) move through Lenis instead of fighting it.
      (window as unknown as { lenis?: typeof lenis }).lenis = lenis;
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // gsap.matchMedia: phone and desktop get their own setup (fewer shutter slats, half the parallax
      // travel on phones), and crossing the breakpoint (a tablet rotating) reverts one and builds the other.
      const mm = gsap.matchMedia();
      mm.add({ phone: "(max-width: 767px)", desktop: "(min-width: 768px)" }, (mmCtx) => {
        const phone = Boolean(mmCtx.conditions?.phone);

        // Masked type: words rise from behind their cut line, each a beat after the last.
        // Once landed, the windows stop clipping, so shadows and diacritics are never cut off.
        const riseWords = (el: Element, vars: gsap.TweenVars = {}) =>
          gsap.from(el.querySelectorAll("[data-mask-word]"), {
            yPercent: 118, duration: 1.15, ease: "expo.out", stagger: 0.07, ...vars,
            onComplete: () => el.querySelectorAll<HTMLElement>(".mask-w").forEach((w) => (w.style.overflow = "visible")),
          });

        // Hand-placed reveals.
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          if (el.querySelector("[data-mask-word]")) {
            riseWords(el, { scrollTrigger: { trigger: el, start: "top 90%", once: true } });
            return;
          }
          gsap.from(el, {
            y: 28,
            opacity: 0,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        // Inner-page headers rise in on load.
        const introTitle = document.querySelector("[data-intro-title]");
        if (introTitle) riseWords(introTitle, { delay: 0.05 });
        const intro = gsap.utils.toArray<HTMLElement>("[data-intro-line]");
        if (intro.length) gsap.from(intro, { y: 30, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, delay: introTitle ? 0.35 : 0.1 });

        // Site-wide reveals: every heading, paragraph, list item, picture and form row in the page body,
        // except inside the hero, page headers, hand-placed reveals and anything marked data-no-reveal.
        const skip = "[data-hero], [data-intro-line], [data-intro-title], [data-reveal], [data-no-reveal], header, footer, [role=dialog]";
        const pick = (sel: string) =>
          gsap.utils.toArray<HTMLElement>(sel).filter((el) => !el.closest(skip) && !el.querySelector("[data-reveal]"));
        const pictures = pick("main figure, main [data-reveal-image]");
        const blocks = pick("main section h2, main section h3, main section p, main section li, main section dl, main section form > *, main section aside, main section .btn")
          // Animate the outermost match only, so nested items don't double up.
          .filter((el, _i, all) => !all.some((o) => o !== el && o.contains(el)) && !pictures.some((f) => f.contains(el)));

        gsap.set(blocks, { opacity: 0, y: 24 });
        ScrollTrigger.batch(blocks, {
          start: "top 92%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.07, overwrite: true }),
        });
        // Shutter reveal: the picture opens through vertical slats, each widening from its own
        // centre line, left to right a beat apart. One clip-path polygon, so it works on masked art too.
        const SLATS = phone ? 5 : 7;
        const slatClip = (open: number[]) => {
          const pts: string[] = [];
          open.forEach((o, i) => {
            const c = ((i + 0.5) / SLATS) * 100;
            const half = (o * 50) / SLATS + (o > 0 && o < 1 ? 0.02 : 0);
            const l = (c - half).toFixed(3), r = (c + half).toFixed(3);
            pts.push(`${l}% 100%`, `${l}% 0%`, `${r}% 0%`, `${r}% 100%`);
          });
          return `polygon(${pts.join(", ")})`;
        };
        const closed = slatClip(new Array(SLATS).fill(0));
        gsap.set(pictures, { clipPath: closed });
        ScrollTrigger.batch(pictures, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            (batch as HTMLElement[]).forEach((el, i) => {
              const open = new Array(SLATS).fill(0);
              const state = { t: 0 };
              gsap.to(state, {
                t: 1,
                duration: 1.5,
                ease: "none",
                delay: i * 0.1,
                onUpdate: () => {
                  // Each slat gets its own expo-out ride inside the shared clock, starting 0.07 later than the one before.
                  for (let s = 0; s < SLATS; s++) {
                    const local = Math.min(1, Math.max(0, (state.t * 1.5 - s * 0.07) / 0.95));
                    open[s] = local === 1 ? 1 : 1 - Math.pow(2, -10 * local);
                  }
                  el.style.clipPath = slatClip(open);
                },
                onComplete: () => { el.style.clipPath = ""; },
              });
              const img = el.querySelector("img");
              if (img) gsap.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1.6, ease: "expo.out", delay: i * 0.1 });
            }),
        });

        // Parallax: every [data-speed] layer drifts with scroll inside its [data-parallax] section.
        // Positive speeds lag behind the page (far away), negative ones run ahead (close to the eye).
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((layer) => {
          const section = layer.closest<HTMLElement>("[data-parallax]");
          if (!section) return;
          const speed = Number(layer.dataset.speed ?? 0);
          const isHero = section.hasAttribute("data-hero");
          const travel = () => section.offsetHeight * speed * (isHero ? 0.6 : 0.35) * (phone ? 0.5 : 1);
          gsap.fromTo(
            layer,
            { y: () => (isHero ? 0 : -travel()) },
            {
              y: () => travel(),
              ease: "none",
              // scrub: true follows Lenis exactly; a numeric scrub would smooth twice and feel laggy.
              scrollTrigger: { trigger: section, start: isHero ? "top top" : "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
            },
          );
        });

        const hero = document.querySelector<HTMLElement>("[data-hero]");
        if (hero) {
          // The lotus draws itself and its two lines reach outward, then the title's words rise
          // through their cut line, then the rest follows.
          const ornament = hero.querySelector("[data-ornament]");
          if (ornament) {
            ornament.querySelectorAll<SVGPathElement>("path").forEach((p, i) => {
              const len = p.getTotalLength();
              gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", delay: 0.1 + i * 0.08, onComplete: () => gsap.set(p, { clearProps: "strokeDasharray,strokeDashoffset" }) });
            });
            gsap.from(ornament.querySelectorAll("[data-ornament-line]"), { scaleX: 0, duration: 1.2, ease: "expo.out", delay: 0.5 });
          }
          const title = hero.querySelector("[data-hero-title]");
          if (title) riseWords(title, { duration: 1.3, stagger: 0.09, delay: 0.35 });
          gsap.from(hero.querySelectorAll("[data-hero-line]"), {
            y: 30, opacity: 0, duration: 1.4, ease: "expo.out", stagger: 0.12, delay: 0.75,
          });
          // The hero copy fades as it leaves, so the mist takes over.
          const copy = hero.querySelector("[data-hero-copy]");
          if (copy) {
            gsap.to(copy, { opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "60% top", scrub: true } });
          }
          // A slow push-in on the artwork.
          const art = hero.querySelector("[data-hero-art]");
          if (art) {
            gsap.fromTo(art, { scale: 1.08 }, { scale: 1, duration: 2.4, ease: "expo.out" });
          }
        }
      });

      // Desktop: hero layers lean gently toward the pointer, at different depths.
      const depthLayers = gsap.utils.toArray<HTMLElement>("[data-hero] [data-depth]");
      let onPointer: ((e: PointerEvent) => void) | null = null;
      if (depthLayers.length && window.matchMedia("(pointer: fine)").matches) {
        const movers = depthLayers.map((el) => {
          const d = Number(el.dataset.depth ?? 0);
          return { d, x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power3.out" }) };
        });
        // Sideways only: rotating these big layers made the browser re-rasterise them every frame.
        onPointer = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          movers.forEach((m) => m.x(nx * 24 * m.d));
        };
        window.addEventListener("pointermove", onPointer, { passive: true });
      }

      // Web fonts (Assamese and Hindi especially) change text heights once they swap in, which moves
      // every trigger below them; measure again when they are ready.
      document.fonts?.ready.then(() => { if (!cancelled) ScrollTrigger.refresh(); });

      // Pause the CSS loops (petals, rays, mist, diya, glow) in scenes that are off screen.
      const scenes = new Set<HTMLElement>();
      document.querySelectorAll<HTMLElement>(".petal, .rays-sway, .mist-drift, .diya-swing, .sun-glow, .twinkle, .bird-drift, .flame, .scroll-thread").forEach((el) => {
        const scene = el.closest<HTMLElement>("section");
        if (scene) scenes.add(scene);
      });
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => e.target.toggleAttribute("data-offscreen", !e.isIntersecting));
      }, { rootMargin: "100px 0px" });
      scenes.forEach((s) => io.observe(s));

      cleanup = () => {
        if (onPointer) window.removeEventListener("pointermove", onPointer);
        io.disconnect();
        scenes.forEach((s) => s.removeAttribute("data-offscreen"));
        mm.revert();
        gsap.ticker.remove(tick);
        delete (window as unknown as { lenis?: unknown }).lenis;
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [pathname]);

  return null;
}
