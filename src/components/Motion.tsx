"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lenis smooth scrolling + one GSAP reveal for [data-reveal] blocks and the hero parallax.
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

      const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 28,
            opacity: 0,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });

        const hero = document.querySelector<HTMLElement>("[data-hero]");
        if (hero) {
          hero.querySelectorAll<SVGGElement>("[data-depth]").forEach((layer) => {
            const depth = Number(layer.dataset.depth ?? 0);
            gsap.to(layer, {
              yPercent: depth * 12,
              ease: "none",
              scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
            });
          });
          gsap.from(hero.querySelectorAll("[data-hero-line]"), {
            y: 30, opacity: 0, duration: 1.4, ease: "expo.out", stagger: 0.12, delay: 0.15,
          });
          const rays = hero.querySelector(".rays");
          if (rays) gsap.to(rays, { rotation: 8, svgOrigin: "600 300", duration: 14, yoyo: true, repeat: -1, ease: "sine.inOut" });
        }
      });

      cleanup = () => {
        ctx.revert();
        gsap.ticker.remove(tick);
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
