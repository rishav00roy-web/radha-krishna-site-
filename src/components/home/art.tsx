import { LotusLogo } from "../BrandMark";
/**
 * Decorative layers for the homepage scenes. The painted artwork comes from Rishav's own
 * mockup (public/art); these SVG layers add depth for parallax. All are aria-hidden.
 */

/** Line, lotus, line: the mockup's ornament. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden data-ornament className={`flex items-center justify-center gap-4 text-gold-bright ${className}`}>
      <span data-ornament-line className="h-px w-16 origin-right bg-[linear-gradient(90deg,transparent,currentColor)] opacity-70 md:w-24" />
      <LotusLogo width={96} strokeWidth={2.6} glow className="text-[#e2c486] md:h-[66px] md:w-[120px]" />
      <span data-ornament-line className="h-px w-16 origin-left bg-[linear-gradient(270deg,transparent,currentColor)] opacity-70 md:w-24" />
    </div>
  );
}

/**
 * Soft god-rays falling from the upper left. A pre-blurred image (public/art/rays.webp), so the
 * sway is a plain compositor transform: an SVG blur here had to be re-rasterised every frame.
 */
export function Rays({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny local decorative image
    <img src="/art/rays.webp" alt="" aria-hidden width={800} height={598} decoding="async" className={`rays-sway object-cover object-top ${className}`} />
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
