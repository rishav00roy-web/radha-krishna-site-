/**
 * The project journey as a glowing path winding down through the night landscape. Each stage is a
 * lamp on the path. The path draws itself as you scroll and each lamp lights as the path reaches it
 * (Motion.tsx, [data-golden-path]). Without JS or with reduced motion the whole path shows lit.
 * Stages stay "Planned" until the foundation verifies them (src/lib/content.ts).
 */
type Step = { num: string; title: string; status: string; done: boolean };

const pts = (n: number, left: number, right: number) =>
  Array.from({ length: n }, (_, i) => ({ x: i % 2 === 0 ? left : right, y: ((i + 0.5) / n) * 100 }));

/** A smooth S-curve through the lamp points, entering from the top edge and leaving at the bottom. */
function curve(p: { x: number; y: number }[]) {
  const step = 100 / p.length;
  let d = `M${p[0].x} 0 C${p[0].x} ${step * 0.25} ${p[0].x} ${p[0].y - step * 0.25} ${p[0].x} ${p[0].y}`;
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1], b = p[i];
    d += ` C${a.x} ${a.y + step * 0.55} ${b.x} ${b.y - step * 0.55} ${b.x} ${b.y}`;
  }
  const last = p[p.length - 1];
  d += ` C${last.x} ${last.y + step * 0.25} ${last.x} ${100 - step * 0.25} ${last.x} 100`;
  return d;
}

export function GoldenPath({ steps }: { steps: Step[] }) {
  const n = steps.length;
  const desk = pts(n, 44, 56);
  const phone = pts(n, 9, 19);
  return (
    <div data-golden-path className="gp relative" style={{ ["--gp-rows" as string]: n }}>
      {[{ d: curve(desk), cls: "hidden md:block" }, { d: curve(phone), cls: "md:hidden" }].map((p, i) => (
        <svg key={i} aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible ${p.cls}`}>
          <path d={p.d} fill="none" stroke="rgb(197 139 67 / 0.14)" strokeWidth="14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={p.d} fill="none" stroke="rgb(242 229 208 / 0.09)" strokeWidth="1.5" strokeDasharray="2 7" vectorEffect="non-scaling-stroke" />
          <path data-gp-draw d={p.d} pathLength={1} fill="none" stroke="url(#gp-grad)" strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path data-gp-draw d={p.d} pathLength={1} fill="none" stroke="rgb(207 174 114 / 0.22)" strokeWidth="9" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <defs>
            <linearGradient id="gp-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e8c98d" />
              <stop offset="1" stopColor="#c58b43" />
            </linearGradient>
          </defs>
        </svg>
      ))}
      <ol className="relative grid" style={{ gridTemplateRows: `repeat(${n}, minmax(7.5rem, 1fr))` }}>
        {steps.map((s, i) => (
          <li key={s.num} data-gp-node className={`gp-row ${i % 2 === 0 ? "gp-row--l" : "gp-row--r"}`} style={{ ["--gp-y" as string]: `${desk[i].y}%` }}>
            <span aria-hidden className={`gp-lamp ${s.done ? "gp-lamp--done" : ""}`} />
            <div className="gp-text">
              <span className="block font-display text-lg text-gold-bright/80 tabular">{s.num}</span>
              <h3 className="font-display text-[1.45rem] leading-tight text-forest-ink md:text-[1.7rem]">{s.title}</h3>
              <p className="mt-1 text-sm text-forest-soft">{s.status}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
