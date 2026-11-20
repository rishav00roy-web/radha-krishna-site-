"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import type { FacilityStatus, IconKey } from "@/lib/types";

export type PlanFacility = {
  id: string;
  code: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  status: FacilityStatus;
  icon: IconKey;
  x: number;
  y: number;
};

type Strings = {
  zoomIn: string; zoomOut: string; reset: string; selectHint: string; disclaimer: string;
  statusLabels: Record<FacilityStatus, string>;
};

const MIN = 1;
const MAX = 3;

/** Schematic zones drawn from each facility's position (percent of the plan). */
function Schematic({ facilities }: { facilities: PlanFacility[] }) {
  const temple = facilities.find((f) => f.code === "A") ?? facilities[0];
  const P = (f: PlanFacility) => [f.x * 10, f.y * 7] as const;
  const [tx, ty] = temple ? P(temple) : [500, 350];
  return (
    <svg viewBox="0 0 1000 700" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <pattern id="grass" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M4 20l2-5M12 12l1.5-4M19 22l2-5" stroke="#9fb48e" strokeWidth="1" strokeLinecap="round" />
        </pattern>
      </defs>
      <path
        d="M70 110 C160 40 380 30 520 48 S850 40 930 120 S990 380 960 520 S800 680 560 668 S180 690 90 600 S20 220 70 110Z"
        fill="#e8eedb"
        stroke="#7d9670"
        strokeWidth="2"
        strokeDasharray="10 8"
      />
      <path d="M70 110 C160 40 380 30 520 48 S850 40 930 120 S990 380 960 520 S800 680 560 668 S180 690 90 600 S20 220 70 110Z" fill="url(#grass)" />
      {facilities.filter((f) => f !== temple).map((f) => {
        const [x, y] = P(f);
        const mx = (x + tx) / 2 + (y - ty) * 0.12;
        const my = (y + ty) / 2 - (x - tx) * 0.12;
        return <path key={f.id} d={`M${tx} ${ty} Q${mx} ${my} ${x} ${y}`} fill="none" stroke="#c9b68e" strokeWidth="6" strokeLinecap="round" opacity="0.8" />;
      })}
      {facilities.map((f) => {
        const [x, y] = P(f);
        if (f.icon === "water")
          return <path key={f.id} d={`M${x - 110} ${y} C${x - 100} ${y - 60} ${x + 40} ${y - 70} ${x + 105} ${y - 20} S${x + 60} ${y + 70} ${x - 20} ${y + 62} S${x - 120} ${y + 40} ${x - 110} ${y}Z`} fill="#9cc3bd" stroke="#4f8c86" strokeWidth="2" />;
        if (f.icon === "bamboo" || f.icon === "fruit" || f.icon === "herb")
          return (
            <g key={f.id} fill={f.icon === "herb" ? "#c7d7a6" : "#a9c08f"} stroke="#6f8a5e" strokeWidth="1.5">
              {[[-60, -20, 34], [-20, -46, 30], [30, -30, 36], [56, 10, 30], [10, 34, 34], [-44, 30, 28]].map(([dx, dy, r], i) => (
                <circle key={i} cx={x + dx} cy={y + dy} r={r} />
              ))}
            </g>
          );
        if (f === temple)
          return (
            <g key={f.id}>
              <rect x={x - 120} y={y - 95} width="240" height="190" rx="10" fill="#f6f1e6" stroke="#b9a37a" strokeWidth="2" />
              <rect x={x - 80} y={y - 62} width="160" height="124" rx="6" fill="none" stroke="#b9a37a" strokeWidth="1.5" strokeDasharray="6 6" />
              <circle cx={x} cy={y} r="44" fill="#fbf8f2" stroke="#a87a26" strokeWidth="2.5" />
            </g>
          );
        return <rect key={f.id} x={x - 82} y={y - 58} width="164" height="116" rx="18" fill="#f2ead8" stroke="#b9a37a" strokeWidth="1.5" />;
      })}
    </svg>
  );
}

export function MasterPlan({ facilities, image, strings }: { facilities: PlanFacility[]; image: string | null; strings: Strings }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const viewport = useRef<HTMLDivElement>(null);

  const clampPos = useCallback((p: { x: number; y: number }, s: number) => {
    const el = viewport.current;
    if (!el) return p;
    const maxX = ((s - 1) * el.clientWidth) / 2;
    const maxY = ((s - 1) * el.clientHeight) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, p.x)), y: Math.max(-maxY, Math.min(maxY, p.y)) };
  }, []);

  const zoomTo = useCallback(
    (s: number) => {
      const next = Math.max(MIN, Math.min(MAX, s));
      setScale(next);
      setPos((p) => clampPos(p, next));
    },
    [clampPos],
  );

  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      const f = facilities.find((x) => x.slug === slug);
      if (f) setSelected(f.id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [facilities]);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    // Ctrl/Cmd + wheel (and trackpad pinch) zooms; a plain wheel keeps scrolling the page.
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setScale((s) => {
        const next = Math.max(MIN, Math.min(MAX, s * (e.deltaY < 0 ? 1.12 : 0.89)));
        setPos((p) => clampPos(p, next));
        return next;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [clampPos]);

  const current = facilities.find((f) => f.id === selected) ?? null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <div>
        <div
          ref={viewport}
          data-lenis-prevent
          className={`relative aspect-[10/7] touch-none select-none overflow-hidden rounded border border-line bg-marble-2 ${scale > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
          onPointerDown={(e) => {
            if (scale === 1 || (e.target as HTMLElement).closest("button")) return;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            setPos(clampPos({ x: drag.current.px + e.clientX - drag.current.x, y: drag.current.py + e.clientY - drag.current.y }, scale));
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          <div
            className="absolute inset-0 origin-center transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})` }}
          >
            {image ? <Image src={image} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-contain" /> : <Schematic facilities={facilities} />}
            {facilities.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelected(f.id)}
                aria-pressed={selected === f.id}
                aria-label={`${f.code}. ${f.name}, ${strings.statusLabels[f.status]}`}
                className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                style={{ left: `${f.x}%`, top: `${f.y}%` }}
              >
                <span
                  className={`grid place-items-center rounded-full border-2 bg-marble transition-[background-color,border-color,transform] duration-200 ease-out group-hover:scale-110 group-aria-pressed:scale-110 group-aria-pressed:border-gold group-aria-pressed:bg-gold group-aria-pressed:text-[#fffaf0] ${
                    f.code === "A" ? "h-16 w-16 border-gold text-gold md:h-20 md:w-20" : "h-11 w-11 border-[#b9a37a] text-gold md:h-14 md:w-14"
                  }`}
                >
                  <Icon name={f.icon} size={f.code === "A" ? 40 : 28} />
                </span>
                <span className="rounded-full bg-marble px-2 text-xs leading-5 text-ink shadow-[0_1px_2px_rgb(42_33_24/0.2)] md:text-sm">{f.code}</span>
              </button>
            ))}
          </div>

          <div className="absolute bottom-3 right-3 flex overflow-hidden rounded-full border border-line bg-marble shadow-[0_6px_20px_-8px_rgb(42_33_24/0.35)]">
            <button type="button" onClick={() => zoomTo(scale * 1.4)} disabled={scale >= MAX} aria-label={strings.zoomIn} className="grid h-11 w-11 place-items-center transition-colors duration-150 hover:bg-marble-2 disabled:opacity-40">
              <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 5v14M5 12h14" /></svg>
            </button>
            <button type="button" onClick={() => zoomTo(scale / 1.4)} disabled={scale <= MIN} aria-label={strings.zoomOut} className="grid h-11 w-11 place-items-center border-l border-line transition-colors duration-150 hover:bg-marble-2 disabled:opacity-40">
              <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14" /></svg>
            </button>
            <button type="button" onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); }} aria-label={strings.reset} className="grid h-11 w-11 place-items-center border-l border-line transition-colors duration-150 hover:bg-marble-2">
              <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4" /></svg>
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-soft">{strings.disclaimer}</p>
      </div>

      <aside aria-live="polite" className="rounded border border-line bg-marble p-7 lg:sticky lg:top-28 lg:self-start">
        {current ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <Icon name={current.icon} size={56} className="text-gold" />
              <span className="proposed-tag">{strings.statusLabels[current.status]}</span>
            </div>
            <p className="tabular mt-6 text-ink-soft">{current.code}</p>
            <h2 className="display-md">{current.name}</h2>
            <p className="mt-3 text-lg">{current.summary}</p>
            <p className="mt-3 text-ink-soft">{current.description}</p>
          </>
        ) : (
          <div className="flex flex-col items-start gap-4 text-ink-soft">
            <Icon name="lotus" size={48} className="text-gold" />
            <p className="text-lg">{strings.selectHint}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
