/**
 * Decorative layers for the homepage scenes. The painted artwork comes from Rishav's own
 * mockup (public/art); these SVG layers add depth for parallax. All are aria-hidden.
 */

/** Line, lotus, line: the mockup's ornament. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center justify-center gap-4 text-gold-bright ${className}`}>
      <span className="h-px w-16 bg-[linear-gradient(90deg,transparent,currentColor)] opacity-70 md:w-24" />
      <svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 36c-3.5-3-5-7.5-4-13.5 2.5 1 4 3 4 5.5 0-2.5 1.5-4.5 4-5.5 1 6-.5 10.5-4 13.5z" />
        <path d="M24 36c-6.5 0-11.5-3.5-13.5-9.5 4-.5 8 1 10.5 4.5" />
        <path d="M24 36c6.5 0 11.5-3.5 13.5-9.5-4-.5-8 1-10.5 4.5" />
        <path d="M24 36c-9 1-15.5-1-19-6 4.5-2 9-1.5 12.5 1M24 36c9 1 15.5-1 19-6-4.5-2-9-1.5-12.5 1" />
        <path d="M10 41c4.5-2 9.5-3 14-3s9.5 1 14 3" />
      </svg>
      <span className="h-px w-16 bg-[linear-gradient(270deg,transparent,currentColor)] opacity-70 md:w-24" />
    </div>
  );
}

/**
 * Soft god-rays falling from the upper left. The sway animates the whole <svg> (an HTML-level
 * transform the GPU can move), never the blurred group inside it, which would re-blur every frame.
 */
export function Rays({ className = "" }: { className?: string }) {
  const beams = [
    { x: 300, w: 70, o: 0.34 },
    { x: 380, w: 40, o: 0.26 },
    { x: 450, w: 110, o: 0.2 },
    { x: 560, w: 50, o: 0.16 },
  ];
  return (
    <svg aria-hidden viewBox="0 0 1200 900" preserveAspectRatio="xMidYMin slice" className={`rays-sway ${className}`}>
      <defs>
        <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffdca0" stopOpacity="1" />
          <stop offset="0.7" stopColor="#ffdca0" stopOpacity="0.25" />
          <stop offset="1" stopColor="#ffdca0" stopOpacity="0" />
        </linearGradient>
        <filter id="rayBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      <g filter="url(#rayBlur)">
        {beams.map((b) => (
          <polygon key={b.x} points={`${b.x - 30},-40 ${b.x + 30},-40 ${b.x + 260 + b.w},900 ${b.x + 260},900`} fill="url(#ray)" opacity={b.o} />
        ))}
      </g>
    </svg>
  );
}

/** Deterministic leaf cluster silhouette, for out-of-focus foreground branches. */
/** `blur` softens them inside the SVG (painted once), cheaper than a CSS filter on a moving layer. */
export function Leaves({ className = "", tone = "#06090c", flip = false, blur = false }: { className?: string; tone?: string; flip?: boolean; blur?: boolean }) {
  const leaves: { x: number; y: number; r: number; s: number }[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 46; i++) {
    const t = i / 46;
    leaves.push({ x: 20 + t * 420 + rnd() * 60, y: 30 + Math.sin(t * 3) * 60 + t * 120 + rnd() * 70, r: rnd() * 180, s: 0.6 + rnd() * 0.8 });
  }
  return (
    <svg aria-hidden viewBox="0 0 520 360" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined}>
      {blur ? <defs><filter id="leafBlur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.6" /></filter></defs> : null}
      <g filter={blur ? "url(#leafBlur)" : undefined}>
      <path d="M-10 40 C120 70 260 120 470 250" stroke={tone} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M150 85 C190 60 230 50 280 52 M260 150 C300 170 330 200 350 240" stroke={tone} strokeWidth="4" fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <path key={i} d="M0 0 C10 -12 30 -12 40 0 C30 12 10 12 0 0Z" fill={tone} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`} />
      ))}
      </g>
    </svg>
  );
}

/**
 * Drifting mist bands, drawn with soft radial gradients instead of an SVG blur filter, so nothing
 * has to be re-blurred while the bands slide (the drift itself is a compositor-only transform).
 */
type Puff = [cx: number, cy: number, rx: number, ry: number, opacity: number];
const farPuffs: Puff[] = [[12, 63, 26, 33, 0.75], [48, 70, 30, 37, 0.65], [84, 62, 27, 34, 0.75]];
const nearPuffs: Puff[] = [[31, 83, 35, 33, 0.9], [72, 85, 36, 34, 0.9]];

function puffs(list: Puff[], color: string) {
  return list
    .map(([cx, cy, rx, ry, o]) => `radial-gradient(${rx}% ${ry}% at ${cx}% ${cy}%, color-mix(in srgb, ${color} ${o * 100}%, transparent) 35%, transparent 100%)`)
    .join(", ");
}

export function Mist({ className = "", color = "#f1dcc4" }: { className?: string; color?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none overflow-hidden ${className.includes("absolute") ? "" : "relative"} ${className}`}>
      <div className="mist-drift absolute inset-y-0 -left-[5%] w-[110%]" style={{ background: puffs(farPuffs, color) }} />
      <div className="mist-drift mist-drift--slow absolute inset-y-0 -left-[5%] w-[110%]" style={{ background: puffs(nearPuffs, color) }} />
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 68%, ${color} 92%)` }} />
    </div>
  );
}

/** A few birds crossing the sky. */
export function Birds({ className = "", tone = "#5b4d3d" }: { className?: string; tone?: string }) {
  const birds = [
    { top: "18%", delay: "0s", dur: "26s", s: 1 },
    { top: "26%", delay: "-9s", dur: "31s", s: 0.75 },
    { top: "12%", delay: "-17s", dur: "29s", s: 0.6 },
  ];
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {birds.map((b, i) => (
        <span key={i} className="bird" style={{ top: b.top, animationDelay: b.delay, animationDuration: b.dur, scale: String(b.s) }}>
          <svg viewBox="0 0 40 16" width="26" height="11">
            <path className="bird-wing" d="M2 10 Q11 2 20 9 Q29 2 38 10" fill="none" stroke={tone} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      ))}
    </div>
  );
}

/** Canopy outline: many overlapping leaf-clumps along a ridge, so the edge reads as foliage, not shapes. */
function canopy(seed0: number, base: number, amp: number, step: number) {
  let seed = seed0;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  let d = `M0 ${base}`;
  for (let x = 0; x <= 1600; x += step) {
    const h = base - amp * (0.35 + rnd() * 0.65) * (0.6 + 0.4 * Math.sin(x / 210 + seed0));
    d += ` Q${x + step / 2} ${h - rnd() * 18} ${x + step} ${base - amp * 0.3 * rnd()}`;
  }
  return `${d} V220 H0Z`;
}

/** Dark ground with a soft, painterly tree line that carries the cream section into the night one. */
export function Hill({ className = "", tone = "#141b24" }: { className?: string; tone?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1600 220" preserveAspectRatio="none" className={className}>
      <defs>
        <filter id="hillSoft" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="2.2" /></filter>
        <filter id="hillFar" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <path d={canopy(3, 120, 70, 46)} fill="#5a5450" opacity="0.35" filter="url(#hillFar)" />
      <path d={canopy(11, 150, 60, 30)} fill={tone} opacity="0.75" filter="url(#hillSoft)" />
      <path d="M0 150 C220 118 420 110 640 128 C840 146 1000 118 1200 114 C1380 110 1500 128 1600 140 V220 H0Z" fill={tone} filter="url(#hillSoft)" />
      <rect x="0" y="180" width="1600" height="40" fill={tone} />
    </svg>
  );
}
