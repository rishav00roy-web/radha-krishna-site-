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

      const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const ctx = gsap.context(() => {
        const phone = window.innerWidth < 768;

        // Hand-placed reveals.
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 28,
            opacity: 0,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        // Inner-page headers rise in on load.
        const intro = gsap.utils.toArray<HTMLElement>("[data-intro-line]");
        if (intro.length) gsap.from(intro, { y: 30, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, delay: 0.1 });

        // Site-wide reveals: every heading, paragraph, list item, picture and form row in the page body,
        // except inside the hero, page headers, hand-placed reveals and anything marked data-no-reveal.
        const skip = "[data-hero], [data-intro-line], [data-reveal], [data-no-reveal], header, footer, [role=dialog]";
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
        gsap.set(pictures, { clipPath: "inset(100% 0% 0% 0%)" });
        ScrollTrigger.batch(pictures, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            batch.forEach((el, i) => {
              gsap.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "expo.out", delay: i * 0.08 });
              const img = el.querySelector("img");
              if (img) gsap.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1.4, ease: "expo.out", delay: i * 0.08 });
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
              scrollTrigger: { trigger: section, start: isHero ? "top top" : "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true },
            },
          );
        });

        const hero = document.querySelector<HTMLElement>("[data-hero]");
        if (hero) {
          gsap.from(hero.querySelectorAll("[data-hero-line]"), {
            y: 30, opacity: 0, duration: 1.4, ease: "expo.out", stagger: 0.12, delay: 0.15,
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
