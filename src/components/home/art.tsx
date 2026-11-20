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

/** Soft god-rays falling from the upper left. */
export function Rays({ className = "" }: { className?: string }) {
  const beams = [
    { x: 300, w: 70, o: 0.22 },
    { x: 380, w: 40, o: 0.16 },
    { x: 450, w: 110, o: 0.12 },
    { x: 560, w: 50, o: 0.1 },
  ];
  return (
    <svg aria-hidden viewBox="0 0 1200 900" preserveAspectRatio="xMidYMin slice" className={className}>
      <defs>
        <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffdca0" stopOpacity="1" />
          <stop offset="0.7" stopColor="#ffdca0" stopOpacity="0.25" />
          <stop offset="1" stopColor="#ffdca0" stopOpacity="0" />
        </linearGradient>
        <filter id="rayBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      <g className="rays-sway" filter="url(#rayBlur)" style={{ transformOrigin: "260px -40px" }}>
        {beams.map((b) => (
          <polygon key={b.x} points={`${b.x - 30},-40 ${b.x + 30},-40 ${b.x + 260 + b.w},900 ${b.x + 260},900`} fill="url(#ray)" opacity={b.o} />
        ))}
      </g>
    </svg>
  );
}

/** Deterministic leaf cluster silhouette, for out-of-focus foreground branches. */
export function Leaves({ className = "", tone = "#06090c", flip = false }: { className?: string; tone?: string; flip?: boolean }) {
  const leaves: { x: number; y: number; r: number; s: number }[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 46; i++) {
    const t = i / 46;
    leaves.push({ x: 20 + t * 420 + rnd() * 60, y: 30 + Math.sin(t * 3) * 60 + t * 120 + rnd() * 70, r: rnd() * 180, s: 0.6 + rnd() * 0.8 });
  }
  return (
    <svg aria-hidden viewBox="0 0 520 360" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M-10 40 C120 70 260 120 470 250" stroke={tone} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M150 85 C190 60 230 50 280 52 M260 150 C300 170 330 200 350 240" stroke={tone} strokeWidth="4" fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <path key={i} d="M0 0 C10 -12 30 -12 40 0 C30 12 10 12 0 0Z" fill={tone} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`} />
      ))}
    </svg>
  );
}

/** Drifting mist bands. */
export function Mist({ className = "", color = "#f1dcc4" }: { className?: string; color?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1600 300" preserveAspectRatio="none" className={className}>
      <defs>
        <filter id="mistBlur" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="28" /></filter>
      </defs>
      <g filter="url(#mistBlur)" fill={color}>
        <g className="mist-drift">
          <ellipse cx="200" cy="190" rx="360" ry="70" opacity="0.75" />
          <ellipse cx="760" cy="210" rx="420" ry="80" opacity="0.65" />
          <ellipse cx="1350" cy="185" rx="380" ry="72" opacity="0.75" />
        </g>
        <g className="mist-drift mist-drift--slow">
          <ellipse cx="500" cy="250" rx="500" ry="70" opacity="0.9" />
          <ellipse cx="1150" cy="255" rx="520" ry="74" opacity="0.9" />
        </g>
        <rect x="-100" y="262" width="1800" height="80" opacity="1" />
      </g>
    </svg>
  );
}

/** A few birds crossing the sky. */
export function Birds({ className = "" }: { className?: string }) {
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
            <path className="bird-wing" d="M2 10 Q11 2 20 9 Q29 2 38 10" fill="none" stroke="#5b4d3d" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      ))}
    </div>
  );
}

/** Dark hill with tree line that carries the cream section into the night one. */
export function Hill({ className = "", tone = "#141a21" }: { className?: string; tone?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1600 220" preserveAspectRatio="none" className={className}>
      <path d="M0 120 C220 70 420 60 640 92 C840 120 1000 70 1200 66 C1380 62 1500 90 1600 110 V220 H0Z" fill={tone} />
      <g fill={tone}>
        {[[180, 92, 34], [214, 84, 26], [470, 76, 30], [500, 70, 22], [1290, 70, 38], [1336, 64, 28]].map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y - r} r={r} />
            <circle cx={x + r * 0.7} cy={y - r * 0.6} r={r * 0.75} />
            <circle cx={x - r * 0.7} cy={y - r * 0.5} r={r * 0.7} />
            <rect x={x - 3} y={y - r * 0.4} width="6" height={r * 0.8} />
          </g>
        ))}
      </g>
    </svg>
  );
}
