"use client";

import { useEffect, useRef } from "react";
import { TouchSurface } from "./TouchSurface";
import "./journey-timeline.css";

/**
 * The project journey as an alternating timeline. A centre line draws down the page as you scroll; each
 * stage's text rises on one side as the line reaches it while its piece of Rishav's art opens on the other
 * (hidden until reached), and the dot of the current stage grows into a ring. On phones it is one column
 * with the line on the left and the art under the text.
 * Without JS or with reduced motion everything shows and the line is full.
 * Stages stay "Planned" until the foundation verifies them (src/lib/content.ts).
 */
export type JourneyStage = {
  num: string; title: string; body?: string; status: string; done: boolean;
  /** An illustrative photo for the stage (Unsplash), with its credit. Falls back to Rishav's art. */
  photo?: { src: string; srcSet: string; alt: string; credit: string; creditHref: string; siteHref: string };
};

// Rishav's art, one per stage, cycling. "cover" fills the frame; cut-outs sit on a moonlit backdrop.
const ART = [
  { src: "/art/hero/radha-krishna-1280.webp", w: 1280, h: 865, fit: "cover", pos: "62% 28%" },
  { src: "/art/lotus-float.webp", w: 800, h: 800, fit: "cutout" },
  { src: "/art/temple-concept.jpg", w: 984, h: 1040, fit: "cover", pos: "50% 40%" },
  { src: "/art/hanging-diya.jpg", w: 1200, h: 1444, fit: "cover", pos: "50% 45%" },
  { src: "/art/peacock-feather.jpg", w: 1400, h: 1200, fit: "cover", pos: "45% 50%" },
  { src: "/art/diya-float.webp", w: 600, h: 600, fit: "cutout" },
] as const;

export function JourneyTimeline({ stages, label }: { stages: JourneyStage[]; label: string }) {
  const root = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let dead = false;
    let cleanup = () => {};
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (dead) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        el.classList.add("tl-live");
        const fill = el.querySelector<HTMLElement>("[data-tl-fill]");
        const rows = [...el.querySelectorAll<HTMLElement>("[data-tl-row]")];
        const setCurrent = () => {
          const reached = rows.filter((r) => r.hasAttribute("data-in"));
          rows.forEach((r) => r.removeAttribute("data-current"));
          reached.at(-1)?.setAttribute("data-current", "");
        };
        const fillTween = fill
          ? gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 62%", end: "bottom 62%", scrub: 0.4 } })
          : null;
        // Each row comes in when the drawing line (62% down the screen) reaches its dot.
        const triggers = rows.map((row) =>
          ScrollTrigger.create({
            trigger: row.querySelector("[data-tl-dot]") ?? row,
            start: "center 62%",
            onEnter: () => { row.setAttribute("data-in", ""); setCurrent(); },
            onLeaveBack: () => { row.removeAttribute("data-in"); setCurrent(); },
          }),
        );
        return () => {
          fillTween?.scrollTrigger?.kill();
          fillTween?.kill();
          triggers.forEach((t) => t.kill());
          el.classList.remove("tl-live");
          rows.forEach((r) => { r.removeAttribute("data-in"); r.removeAttribute("data-current"); });
          if (fill) gsap.set(fill, { clearProps: "transform" });
        };
      });
      cleanup = () => mm.revert();
    })();
    return () => {
      dead = true;
      cleanup();
    };
  }, [stages]);

  return (
    <div className="tl-wrap relative">
      <TouchSurface />
      <ol ref={root} className="tl relative" aria-label={label}>
        <span aria-hidden className="tl-track" />
        <span aria-hidden data-tl-fill className="tl-fill" />
        {stages.map((s, i) => {
          const right = i % 2 === 1;
          const art = ART[i % ART.length];
          return (
            <li key={s.num} data-tl-row className={`tl-row${right ? " tl-right" : ""}${s.done ? " is-done" : ""}`}>
              <div className="tl-text">
                <p className="tl-kicker"><span className="tl-num">{s.num}</span><span aria-hidden className="tl-sep" />{s.status}</p>
                <h3 className="tl-title">{s.title}</h3>
                {s.body ? <p className="tl-body">{s.body}</p> : null}
              </div>
              <span aria-hidden data-tl-dot className="tl-dot"><span /></span>
              {s.photo ? (
                <figure className="tl-art tl-art--photo">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Unsplash serves pre-sized images */}
                  <img src={s.photo.src} srcSet={s.photo.srcSet} sizes="(min-width: 768px) 22rem, 90vw" alt={s.photo.alt} loading="lazy" decoding="async" />
                  <figcaption className="tl-credit">
                    <a href={s.photo.creditHref} target="_blank" rel="noopener noreferrer">{s.photo.credit}</a> · <a href={s.photo.siteHref} target="_blank" rel="noopener noreferrer">Unsplash</a>
                  </figcaption>
                </figure>
              ) : (
                <figure aria-hidden className={`tl-art tl-art--${art.fit}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
                  <img src={art.src} alt="" width={art.w} height={art.h} loading="lazy" decoding="async" style={"pos" in art ? { objectPosition: art.pos } : undefined} />
                </figure>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
