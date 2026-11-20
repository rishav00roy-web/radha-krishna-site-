/** Floating lotus petals. Pure CSS, hidden for reduced motion. */
const petals = [
  { left: "8%", delay: "0s", dur: "15s", drift: "60px", scale: 1 },
  { left: "22%", delay: "4s", dur: "18s", drift: "-40px", scale: 0.8 },
  { left: "37%", delay: "9s", dur: "16s", drift: "50px", scale: 0.9 },
  { left: "58%", delay: "2s", dur: "19s", drift: "-60px", scale: 0.7 },
  { left: "71%", delay: "7s", dur: "17s", drift: "40px", scale: 1.1 },
  { left: "86%", delay: "11s", dur: "20s", drift: "-30px", scale: 0.85 },
  { left: "47%", delay: "13s", dur: "21s", drift: "30px", scale: 0.75 },
];

export function Petals() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.dur,
            ["--drift" as string]: p.drift,
            scale: String(p.scale),
          }}
        />
      ))}
    </div>
  );
}
