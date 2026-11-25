"use client";

import { useId, useRef, useState } from "react";

/**
 * Accordion, after the Annnimate starter-pack one (height eases open with expo.inOut, the plus turns),
 * rebuilt with the fixes our Playwright test asked for: real buttons with aria-expanded/aria-controls,
 * answers readable without JS (noscript), no layout shift on load, and with reduced motion they open instantly instead of not at all.
 */
export function Accordion({ items, className = "" }: { items: { q: string; a: string }[]; className?: string }) {
  const id = useId();
  const [open, setOpen] = useState(-1);
  const panels = useRef<(HTMLDivElement | null)[]>([]);

  async function toggle(i: number) {
    const next = open === i ? -1 : i;
    setOpen(next);
    const { gsap } = await import("gsap");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panels.current.forEach((p, k) => {
      if (!p) return;
      gsap.to(p, { height: k === next ? "auto" : 0, duration: reduce ? 0 : 0.75, ease: "expo.inOut", overwrite: true });
    });
  }

  return (
    <div className={`border-t border-line ${className}`}>
      {/* Without JS every answer is shown. */}
      <noscript><style>{`[data-acc-panel]{height:auto!important}`}</style></noscript>
      {items.map((it, i) => (
        <div key={i} className="border-b border-line">
          <h3>
            <button
              type="button"
              id={`${id}-b${i}`}
              aria-expanded={open === i}
              aria-controls={`${id}-p${i}`}
              onClick={() => toggle(i)}
              className="group flex min-h-[56px] w-full items-center justify-between gap-6 py-5 text-left font-display text-[1.45rem] leading-snug transition-colors duration-200 hover:text-gold"
            >
              <span>{it.q}</span>
              <span aria-hidden className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/50 text-gold transition-transform duration-500 ease-out group-aria-expanded:rotate-[135deg]">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1v14M1 8h14" /></svg>
              </span>
            </button>
          </h3>
          <div id={`${id}-p${i}`} role="region" aria-labelledby={`${id}-b${i}`} ref={(el) => { panels.current[i] = el; }} data-acc-panel inert={open !== i} style={{ height: 0 }} className="overflow-hidden">
            <p className="measure pb-6 text-ink-soft">{it.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
