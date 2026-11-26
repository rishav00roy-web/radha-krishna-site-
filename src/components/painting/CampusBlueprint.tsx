import type { IconKey } from "@/lib/types";

/**
 * The campus as an architect's blueprint: white linework on blueprint blue with a drafting grid, the
 * site boundary, paths from the temple to each proposed area, and each area drawn as a simple plan
 * symbol at its place on the schematic (pos_x / pos_y, 0-100). A concept only: the title block says
 * "proposed" and "not to scale", and nothing here is a surveyed or approved drawing. Static SVG, no JS.
 */
export type BlueprintArea = { id: string; code: string; name: string; icon: IconKey; x: number; y: number };

const VW = 1000;
const VH = 620;
const P = (a: BlueprintArea) => [90 + a.x * 8.2, 70 + a.y * 5] as const;
const INK = "#e8f1ff";
const FOOT: Partial<Record<IconKey, number>> = { temple: 76, water: 66, bamboo: 56, fruit: 58, herb: 52, cow: 64, meditate: 44, gathering: 60 };
const SOFT = "rgb(232 241 255 / 0.55)";
const FAINT = "rgb(232 241 255 / 0.3)";

function Symbol({ a }: { a: BlueprintArea }) {
  const [x, y] = P(a);
  switch (a.icon) {
    case "temple": // a mandala plan: square courtyard, inner sanctum, circle of the shikhara
      return (
        <g fill="none" stroke={INK}>
          <rect x={x - 62} y={y - 62} width="124" height="124" strokeWidth="1.6" />
          <rect x={x - 46} y={y - 46} width="92" height="92" strokeWidth="1" strokeDasharray="4 4" stroke={SOFT} />
          <rect x={x - 26} y={y - 26} width="52" height="52" strokeWidth="1.6" transform={`rotate(45 ${x} ${y})`} />
          <circle cx={x} cy={y} r="16" strokeWidth="1.4" />
          <circle cx={x} cy={y} r="4" fill={INK} />
          {[0, 90, 180, 270].map((r) => (
            <path key={r} d={`M${x} ${y - 62} v-18 M${x - 9} ${y - 80} h18`} strokeWidth="1.2" transform={`rotate(${r} ${x} ${y})`} />
          ))}
        </g>
      );
    case "water": // an organic pond with ripple contours
      return (
        <g fill="none" stroke={INK}>
          <path d={`M${x - 78} ${y} C${x - 72} ${y - 44} ${x + 30} ${y - 52} ${x + 74} ${y - 14} S${x + 44} ${y + 50} ${x - 14} ${y + 44} S${x - 84} ${y + 28} ${x - 78} ${y}Z`} strokeWidth="1.6" />
          <path d={`M${x - 54} ${y} C${x - 50} ${y - 28} ${x + 20} ${y - 34} ${x + 50} ${y - 8} S${x + 28} ${y + 32} ${x - 10} ${y + 28} S${x - 58} ${y + 18} ${x - 54} ${y}Z`} strokeWidth="0.9" stroke={SOFT} strokeDasharray="3 5" />
          <path d={`M${x - 26} ${y + 2} q10 -7 20 0 t20 0 M${x - 16} ${y + 14} q8 -5 16 0 t16 0`} strokeWidth="0.9" stroke={SOFT} />
        </g>
      );
    case "bamboo":
    case "fruit":
    case "herb": { // planting: tree canopies (bamboo clumps, fruit trees) or herb beds
      if (a.icon === "herb")
        return (
          <g fill="none" stroke={INK} strokeWidth="1.2">
            {[-36, -12, 12, 36].map((dx) => <rect key={dx} x={x + dx - 9} y={y - 34} width="18" height="68" rx="3" />)}
            {[-36, -12, 12, 36].map((dx) => <path key={`l${dx}`} d={`M${x + dx} ${y - 26} v52`} stroke={FAINT} strokeDasharray="2 4" />)}
          </g>
        );
      const spots = a.icon === "bamboo"
        ? [[-30, -30, 13], [2, -38, 11], [30, -18, 14], [-8, -4, 12], [24, 14, 11], [-34, 10, 12], [-4, 30, 13], [28, 40, 10]]
        : [[-36, -24, 17], [4, -34, 15], [36, -10, 17], [-12, 8, 16], [24, 30, 15], [-40, 30, 14]];
      return (
        <g fill="none" stroke={INK} strokeWidth="1.2">
          {spots.map(([dx, dy, r], i) => (
            <g key={i}>
              <circle cx={x + dx} cy={y + dy} r={r} />
              {a.icon === "bamboo" ? <circle cx={x + dx} cy={y + dy} r={r * 0.45} stroke={SOFT} /> : <path d={`M${x + dx - r * 0.5} ${y + dy} h${r} M${x + dx} ${y + dy - r * 0.5} v${r}`} stroke={SOFT} />}
            </g>
          ))}
        </g>
      );
    }
    case "cow": // a long shed with stalls, and a fenced paddock
      return (
        <g fill="none" stroke={INK}>
          <rect x={x - 56} y={y - 22} width="112" height="40" strokeWidth="1.6" />
          {[-34, -12, 10, 32].map((dx) => <path key={dx} d={`M${x + dx} ${y - 22} v40`} strokeWidth="0.9" stroke={SOFT} />)}
          <rect x={x - 56} y={y + 24} width="112" height="34" strokeWidth="1" strokeDasharray="6 4" stroke={SOFT} />
        </g>
      );
    case "meditate": // a round hall with a ring of decks
      return (
        <g fill="none" stroke={INK}>
          <circle cx={x} cy={y} r="40" strokeWidth="1" strokeDasharray="5 5" stroke={SOFT} />
          <path d={Array.from({ length: 8 }, (_, i) => { const t = (i / 8) * Math.PI * 2 + Math.PI / 8; return `${i ? "L" : "M"}${(x + Math.cos(t) * 26).toFixed(1)} ${(y + Math.sin(t) * 26).toFixed(1)}`; }).join(" ") + "Z"} strokeWidth="1.6" />
          <circle cx={x} cy={y} r="9" strokeWidth="1.2" />
        </g>
      );
    default: // gathering: a covered hall facing an open ground with tiered seating arcs
      return (
        <g fill="none" stroke={INK}>
          <rect x={x - 46} y={y - 40} width="92" height="34" rx="4" strokeWidth="1.6" />
          {[24, 40, 56].map((r) => <path key={r} d={`M${x - r} ${y + 4} A${r} ${r} 0 0 0 ${x + r} ${y + 4}`} strokeWidth={r === 56 ? 1.4 : 0.9} stroke={r === 56 ? INK : SOFT} />)}
        </g>
      );
  }
}

export function CampusBlueprint({ areas, title, note, proposed, className = "" }: { areas: BlueprintArea[]; title: string; note: string; proposed: string; className?: string }) {
  const temple = areas.find((a) => a.icon === "temple") ?? areas[0];
  const [tx, ty] = temple ? P(temple) : [VW / 2, VH / 2];
  const boundary = "M70 96 C180 34 420 26 560 40 S880 34 940 118 S990 380 962 500 S820 600 580 592 S190 606 96 534 S30 214 70 96Z";
  return (
    <figure className={`relative overflow-hidden rounded-[18px] bg-[#123156] shadow-[inset_0_0_0_1px_rgb(232_241_255/0.18),0_30px_60px_-30px_rgb(0_0_0/0.7)] ${className}`}>
      <svg viewBox={`0 0 ${VW} ${VH}`} className="block h-auto w-full" role="img" aria-label={`${title}. ${proposed}. ${note}.`}>
        <defs>
          <pattern id="bp-minor" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="rgb(232 241 255 / 0.06)" strokeWidth="1" />
          </pattern>
          <pattern id="bp-major" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#bp-minor)" />
            <path d="M100 0H0V100" fill="none" stroke="rgb(232 241 255 / 0.13)" strokeWidth="1" />
          </pattern>
          {/* Walkways stop at the edge of each area, so no line crosses a drawn building. */}
          <mask id="bp-walks" maskUnits="userSpaceOnUse" x="0" y="0" width={VW} height={VH}>
            <rect width={VW} height={VH} fill="#fff" />
            {areas.map((a) => {
              const [x, y] = P(a);
              return <circle key={a.id} cx={x} cy={y} r={FOOT[a.icon] ?? 56} fill="#000" />;
            })}
          </mask>
          <radialGradient id="bp-light" cx="45%" cy="40%" r="75%">
            <stop offset="0" stopColor="#1a4373" />
            <stop offset="1" stopColor="#0e2645" />
          </radialGradient>
        </defs>
        <rect width={VW} height={VH} fill="url(#bp-light)" />
        <rect width={VW} height={VH} fill="url(#bp-major)" />
        <rect x="14" y="14" width={VW - 28} height={VH - 28} fill="none" stroke={FAINT} strokeWidth="1" />

        {/* Site boundary */}
        <path d={boundary} fill="rgb(232 241 255 / 0.03)" stroke={INK} strokeWidth="1.6" strokeDasharray="14 6 3 6" />

        {/* Paths from the temple to every area: a double line, like a drawn walkway */}
        {areas.filter((a) => a !== temple).map((a) => {
          const [x, y] = P(a);
          const mx = (x + tx) / 2 + (y - ty) * 0.14;
          const my = (y + ty) / 2 - (x - tx) * 0.14;
          const d = `M${tx} ${ty} Q${mx} ${my} ${x} ${y}`;
          return (
            <g key={a.id} fill="none" mask="url(#bp-walks)">
              <path d={d} stroke={SOFT} strokeWidth="9" />
              <path d={d} stroke="#123a66" strokeWidth="6.4" />
            </g>
          );
        })}

        {areas.map((a) => <Symbol key={a.id} a={a} />)}

        {/* Area codes, in drafting bubbles */}
        {areas.map((a) => {
          const [x, y] = P(a);
          const lx = x + (a === temple ? 78 : 62), ly = y - (a === temple ? 70 : 50);
          return (
            <g key={`c${a.id}`}>
              <path d={`M${x + (a === temple ? 40 : 26)} ${y - (a === temple ? 40 : 20)} L${lx - 12} ${ly + 9}`} stroke={SOFT} strokeWidth="1" />
              <circle cx={lx} cy={ly} r="15" fill="#123156" stroke={INK} strokeWidth="1.4" />
              <text x={lx} y={ly + 5.5} textAnchor="middle" fill={INK} fontSize="16" fontFamily="var(--font-display), Georgia, serif">{a.code}</text>
            </g>
          );
        })}

        {/* North arrow */}
        <g transform="translate(920 74)" fill="none" stroke={INK} strokeWidth="1.3">
          <circle r="24" stroke={SOFT} />
          <path d="M0 -20 L7 8 L0 3 L-7 8Z" fill={INK} />
          <text y="-30" textAnchor="middle" fill={INK} stroke="none" fontSize="13" letterSpacing="2">N</text>
        </g>

        {/* Title block */}
        <g transform={`translate(${VW - 330} ${VH - 92})`}>
          <rect width="302" height="64" fill="#123156" stroke={INK} strokeWidth="1.2" />
          <path d="M0 30 H302 M196 30 V64" stroke={SOFT} strokeWidth="1" />
          <text x="12" y="21" fill={INK} fontSize="14" fontFamily="var(--font-display), Georgia, serif" letterSpacing="0.5">{title}</text>
          <text x="12" y="52" fill={SOFT} fontSize="11.5">{note}</text>
          <text x="249" y="52" textAnchor="middle" fill={INK} fontSize="11.5" letterSpacing="1.5">{proposed.toUpperCase()}</text>
        </g>
      </svg>
    </figure>
  );
}
