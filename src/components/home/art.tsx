/**
 * Decorative layers for the homepage scenes. The painted artwork comes from Rishav's own
 * mockup (public/art); these SVG layers add depth for parallax. All are aria-hidden.
 */

/** Line, lotus, line: the mockup's ornament. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden data-ornament className={`flex items-center justify-center gap-4 text-gold-bright ${className}`}>
      <span data-ornament-line className="h-px w-16 origin-right bg-[linear-gradient(90deg,transparent,currentColor)] opacity-70 md:w-24" />
      <svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 36c-3.5-3-5-7.5-4-13.5 2.5 1 4 3 4 5.5 0-2.5 1.5-4.5 4-5.5 1 6-.5 10.5-4 13.5z" />
        <path d="M24 36c-6.5 0-11.5-3.5-13.5-9.5 4-.5 8 1 10.5 4.5" />
        <path d="M24 36c6.5 0 11.5-3.5 13.5-9.5-4-.5-8 1-10.5 4.5" />
        <path d="M24 36c-9 1-15.5-1-19-6 4.5-2 9-1.5 12.5 1M24 36c9 1 15.5-1 19-6-4.5-2-9-1.5-12.5 1" />
        <path d="M10 41c4.5-2 9.5-3 14-3s9.5 1 14 3" />
      </svg>
      <span data-ornament-line className="h-px w-16 origin-left bg-[linear-gradient(270deg,transparent,currentColor)] opacity-70 md:w-24" />
    </div>
  );
}

/**
 * Soft god-rays falling from the upper left. A pre-blurred image (public/art/rays.png), so the
 * sway is a plain compositor transform: an SVG blur here had to be re-rasterised every frame.
 */
export function Rays({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny local decorative image
    <img src="/art/rays.png" alt="" aria-hidden width={600} height={450} decoding="async" className={`rays-sway object-cover object-top ${className}`} />
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

/** Canopy outline: many overlapping leaf-clumps along a ridge, so the edge reads as foliage, not shapes. */
function canopy(seed0: number, base: number, amp: number, step: number) {
  let seed = seed0;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  let d = `M-60 ${base}`;
  for (let x = -60; x <= 1660; x += step) {
    const h = base - amp * (0.35 + rnd() * 0.65) * (0.6 + 0.4 * Math.sin(x / 210 + seed0));
    d += ` Q${x + step / 2} ${h - rnd() * 18} ${x + step} ${base - amp * 0.3 * rnd()}`;
  }
  return `${d} V240 H-60Z`;
}

/** Dark ground with a soft, painterly tree line that carries the cream section into the night one. */
export function Hill({ className = "", tone = "#141b24" }: { className?: string; tone?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1600 220" preserveAspectRatio="none" className={className}>
      <defs>
        <filter id="hillSoft" x="-5%" y="-20%" width="110%" height="140%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation="2.2" /></filter>
        <filter id="hillFar" x="-5%" y="-20%" width="110%" height="140%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <path d={canopy(3, 120, 70, 46)} fill="#5a5450" opacity="0.35" filter="url(#hillFar)" />
      <path d={canopy(11, 150, 60, 30)} fill={tone} opacity="0.75" filter="url(#hillSoft)" />
      <path d="M-60 152 C220 118 420 110 640 128 C840 146 1000 118 1200 114 C1380 110 1500 128 1660 142 V240 H-60Z" fill={tone} filter="url(#hillSoft)" />
      <rect x="-60" y="170" width="1720" height="60" fill={tone} />
    </svg>
  );
}
