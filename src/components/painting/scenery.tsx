/**
 * Painted-landscape layers for the Home page's continuous scene. All static SVG or CSS drawn on the
 * server (no JS), all aria-hidden. They stand in for the matched Gemini backdrops planned in
 * project-files prem-mandir/gemini-prompts/prompts.md (section D) until Rishav paints them.
 */

/** Small seeded generator, so every ridge and star field is identical on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/** A soft hill or mountain ridge: a sum of slow sines plus a little seeded wobble, as one closed path. */
function ridgePath(seed: number, base: number, amp: number, freq: number, w = 1600, h = 400) {
  const r = rng(seed);
  const a = r() * 6, b = r() * 6, c = r() * 6;
  let d = `M0 ${h}`;
  for (let x = 0; x <= w; x += 20) {
    const y =
      base -
      amp * (0.55 * Math.sin(x / (260 / freq) + a) + 0.3 * Math.sin(x / (110 / freq) + b) + 0.15 * Math.sin(x / (47 / freq) + c));
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return `${d} L${w} ${h} Z`;
}

/** A treeline: many small rounded crowns along a ridge, so the edge reads as forest, not a wave. */
function treePath(seed: number, base: number, amp: number, step: number, w = 1600, h = 400) {
  const r = rng(seed);
  let d = `M-40 ${h} L-40 ${base}`;
  for (let x = -40; x <= w + 40; x += step * (0.7 + r() * 0.6)) {
    const tall = r() < 0.18 ? 1.5 : 1; // the odd taller crown (a palm or a big tree) breaks the rhythm
    const top = base - amp * tall * (0.3 + r() * 0.7);
    const sw = step * (0.6 + r() * 0.9);
    d += ` C${(x + sw * 0.1).toFixed(1)} ${(top + amp * 0.2).toFixed(1)} ${(x + sw * 0.35).toFixed(1)} ${top.toFixed(1)} ${(x + sw * 0.5).toFixed(1)} ${top.toFixed(1)}`;
    d += ` C${(x + sw * 0.65).toFixed(1)} ${top.toFixed(1)} ${(x + sw * 0.9).toFixed(1)} ${(top + amp * 0.2).toFixed(1)} ${(x + sw).toFixed(1)} ${(base - amp * 0.15 * r()).toFixed(1)}`;
  }
  return `${d} L${w + 40} ${h} Z`;
}

export type RidgeLayer = { kind?: "hill" | "trees"; seed: number; base: number; amp: number; freq?: number; fill: string; opacity?: number };

/** Layered ridges, far to near, in one SVG. Atmospheric perspective comes from the colours passed in. */
export function Ridges({ layers, className = "", height = 400 }: { layers: RidgeLayer[]; className?: string; height?: number }) {
  return (
    <svg aria-hidden viewBox={`0 0 1600 ${height}`} preserveAspectRatio="none" className={`pointer-events-none block w-full ${className}`}>
      {layers.map((l, i) => (
        <path
          key={i}
          d={l.kind === "trees" ? treePath(l.seed, l.base, l.amp, l.freq ?? 34, 1600, height) : ridgePath(l.seed, l.base, l.amp, l.freq ?? 1, 1600, height)}
          fill={l.fill}
          opacity={l.opacity ?? 1}
        />
      ))}
    </svg>
  );
}

/** A field of small stars. Two groups twinkle out of step; the rest stay still. */
export function Stars({ count = 70, seed = 5, className = "" }: { count?: number; seed?: number; className?: string }) {
  const r = rng(seed);
  const stars = Array.from({ length: count }, (_, i) => ({ x: r() * 100, y: r() * 100, s: 0.5 + r() * r() * 1.6, o: 0.35 + r() * 0.6, g: i % 3 }));
  return (
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className={`pointer-events-none ${className}`}>
      {[0, 1, 2].map((g) => (
        <g key={g} className={g === 0 ? "" : `twinkle twinkle--${g}`}>
          {stars.filter((s) => s.g === g).map((s, i) => (
            <ellipse key={i} cx={s.x} cy={s.y} rx={s.s * 0.09} ry={s.s * 0.14} fill="#f6ead2" opacity={s.o} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/** A soft full moon with a wide halo, painted with gradients only. */
export function Moon({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <span className="absolute inset-[-120%] rounded-full bg-[radial-gradient(closest-side,rgb(242_229_208/0.22),rgb(242_229_208/0.07)_45%,transparent)]" />
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_42%_38%,#fbf3e2_0%,#efe0c2_55%,#d9c49d_100%)] shadow-[0_0_60px_12px_rgb(242_229_208/0.25)]" />
      <span className="absolute left-[22%] top-[30%] h-[22%] w-[26%] rounded-full bg-[#d8c6a2]/40" />
      <span className="absolute left-[55%] top-[52%] h-[16%] w-[18%] rounded-full bg-[#d8c6a2]/35" />
    </div>
  );
}

/** A few birds far off: curved wings with a small body, each a slightly different wingbeat pose. */
const BIRD = [
  "M0 7C3 3 7 2 11 6.2 15 2 19 3 22 7 18.8 5.4 15.2 5.6 11 8.6 6.8 5.6 3.2 5.4 0 7Z",
  "M0 4C3.5 4.5 7.5 5 11 8 14.5 5 18.5 4.5 22 4 18.5 6.4 14.6 7.2 11 9.6 7.4 7.2 3.5 6.4 0 4Z",
];
export function Birds({ className = "", color = "#4a4036" }: { className?: string; color?: string }) {
  const flock = [
    { x: 6, y: 30, s: 1, p: 0 }, { x: 18, y: 18, s: 0.8, p: 1 }, { x: 27, y: 36, s: 0.7, p: 0 },
    { x: 40, y: 12, s: 0.6, p: 1 }, { x: 50, y: 26, s: 0.55, p: 0 }, { x: 62, y: 8, s: 0.45, p: 1 },
  ];
  return (
    <svg aria-hidden viewBox="0 0 100 50" className={`pointer-events-none overflow-visible ${className}`}>
      {flock.map((b, i) => (
        <path key={i} d={BIRD[b.p]} fill={color} opacity={0.55 + b.s * 0.35} transform={`translate(${b.x} ${b.y}) scale(${b.s * 0.42})`} className={`bird bird--${i % 3}`} />
      ))}
    </svg>
  );
}

/** A small steady flame with a soft glow, for the clay diya. */
export function Flame({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute ${className}`}>
      <span className="flame-glow absolute left-1/2 top-1/2 h-[360%] w-[360%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_200_120/0.5),rgb(197_139_67/0.14)_45%,transparent_70%)]" />
      <span className="flame absolute inset-0 rounded-[50%_50%_50%_50%/62%_62%_38%_38%] bg-[radial-gradient(ellipse_at_50%_75%,#fff6dc_0%,#ffd88a_35%,#e8963c_70%,transparent_100%)]" />
    </span>
  );
}
