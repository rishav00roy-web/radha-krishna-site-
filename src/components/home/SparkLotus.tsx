"use client";

import { useEffect, useRef, useState } from "react";

/** The ornament's lotus (viewBox 48), shared by the crisp SVG and the spark targets. */
const LOTUS = [
  "M24 36c-3.5-3-5-7.5-4-13.5 2.5 1 4 3 4 5.5 0-2.5 1.5-4.5 4-5.5 1 6-.5 10.5-4 13.5z",
  "M24 36c-6.5 0-11.5-3.5-13.5-9.5 4-.5 8 1 10.5 4.5",
  "M24 36c6.5 0 11.5-3.5 13.5-9.5-4-.5-8 1-10.5 4.5",
  "M24 36c-9 1-15.5-1-19-6 4.5-2 9-1.5 12.5 1M24 36c9 1 15.5-1 19-6-4.5-2-9-1.5-12.5 1",
  "M10 41c4.5-2 9.5-3 14-3s9.5 1 14 3",
];

const W = 360;
const H = 200;
const SIZE = 112; // lotus size in CSS px

/** Small seeded generator, so the scatter is the same on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/**
 * Golden sparks fly in on gentle arcs and settle into the lotus, then the crisp line art takes
 * over and the canvas stops. Plays once, when the verse comes into view. A faint dashed ghost of
 * the lotus waits there first, so the eye knows where the sparks are going.
 * Reduced motion: the finished lotus, no canvas.
 */
export function SparkLotus({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    const box = wrap.current;
    if (!canvas || !box) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setDone(true);
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // Targets: points on a grid that fall inside the lotus strokes, so the finished mark is crisp.
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const o = off.getContext("2d");
    if (!o) {
      setDone(true);
      return;
    }
    const k = SIZE / 48;
    o.translate((W - SIZE) / 2, (H - SIZE) / 2);
    o.scale(k, k);
    o.lineWidth = 1.6;
    o.lineCap = "round";
    o.lineJoin = "round";
    o.strokeStyle = "#000";
    LOTUS.forEach((d) => o.stroke(new Path2D(d)));
    const data = o.getImageData(0, 0, W, H).data;
    const rand = rng(108);
    const pts: { x: number; y: number }[] = [];
    for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) if (data[(y * W + x) * 4 + 3] > 110) pts.push({ x, y });
    const keep = Math.min(pts.length, window.innerWidth < 768 ? 130 : 190);
    const step = pts.length / keep;

    type Spark = { sx: number; sy: number; cx: number; cy: number; tx: number; ty: number; delay: number; r: number };
    const sparks: Spark[] = [];
    for (let i = 0; i < keep; i++) {
      const t = pts[Math.floor(i * step)];
      const left = rand() < 0.5;
      const sx = left ? rand() * W * 0.28 : W - rand() * W * 0.28;
      const sy = rand() * H;
      // Control point bowed off the straight line, so each spark arcs instead of sliding.
      const bow = (rand() - 0.5) * 120;
      sparks.push({
        sx, sy,
        cx: (sx + t.x) / 2 + bow * 0.4, cy: (sy + t.y) / 2 - Math.abs(bow),
        tx: t.x, ty: t.y,
        // Outer sparks leave first, each a little later than the last, with a touch of chance.
        delay: (Math.abs(sx - W / 2) < W * 0.36 ? 0.25 : 0) + rand() * 0.75,
        r: 0.8 + rand() * 0.9,
      });
    }
    const color = getComputedStyle(canvas).color;
    const FLIGHT = 0.95;
    const END = 0.25 + 0.75 + FLIGHT;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const at = (s: Spark, t: number) => {
      const u = ease(Math.min(1, Math.max(0, t)));
      const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
      return [a * s.sx + b * s.cx + c * s.tx, a * s.sy + b * s.cy + c * s.ty];
    };

    let raf = 0;
    let start = 0;
    const frame = (now: number) => {
      if (!start) start = now;
      const time = (now - start) / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      for (const s of sparks) {
        const t = (time - s.delay) / FLIGHT;
        if (t <= 0) {
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          ctx.arc(s.sx, s.sy, s.r, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        const [x, y] = at(s, t);
        if (t < 1) {
          // A short trail shows direction without any blur.
          const [px, py] = at(s, t - 0.06);
          ctx.globalAlpha = 0.45;
          ctx.lineWidth = s.r;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.globalAlpha = t < 1 ? 1 : 0.9;
        ctx.beginPath();
        ctx.arc(x, y, t < 1 ? s.r + 0.4 : s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (time < END) raf = requestAnimationFrame(frame);
      else setDone(true);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        raf = requestAnimationFrame(frame);
      },
      { threshold: 0.7 },
    );
    io.observe(box);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrap} aria-hidden className={`relative mx-auto flex h-[200px] w-full max-w-[360px] items-center justify-center text-gold-bright ${className}`}>
      <canvas
        ref={ref}
        width={W}
        height={H}
        className={`absolute left-1/2 top-0 h-[200px] w-[360px] -translate-x-1/2 transition-opacity duration-700 ${done ? "opacity-0" : "opacity-100"}`}
      />
      <svg
        viewBox="0 0 48 48"
        width={SIZE}
        height={SIZE}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={done ? undefined : "1 2"}
        className={`relative drop-shadow-[0_0_10px_rgb(255_206_128/0.45)] transition-opacity duration-700 ${done ? "opacity-100" : "opacity-20"}`}
      >
        {LOTUS.map((d) => <path key={d} d={d} />)}
      </svg>
    </div>
  );
}
