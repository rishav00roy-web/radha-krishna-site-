"use client";

import { useEffect, useRef } from "react";
import { LOTUS_PATHS } from "../BrandMark";

/**
 * Touchable surface: the night behind the page is carved. Move the cursor (or drag a finger) and relief
 * shapes, lotuses, peacock feathers, leaves and tendrils, rise out of the wall around it, then sink back.
 *
 * How: a relief pattern is painted once (lazily, on first touch) into an offscreen canvas with a
 * moonlit emboss (shadow below right, gold light above left). A second canvas holds a soft mask that
 * the pointer paints and that fades every frame; the visible canvas shows the pattern only through the
 * mask. The loop runs only while the mask is fading, so an idle page costs nothing. Phones use a
 * smaller pattern at 1x. Off with reduced motion. Purely decorative (aria-hidden, no pointer events).
 */

type Glyph = { paths: Path2D[]; w: number; h: number };

const FEATHER = [
  "M50 98C50 72 49 40 50 6",
  "M50 8C31 22 27 52 50 80C73 52 69 22 50 8Z",
  "M50 26C43 31 42 43 50 50C58 43 57 31 50 26Z",
  "M50 33C47 36 47 41 50 44C53 41 53 36 50 33Z",
  "M50 60L36 50M50 66L39 58M50 60L64 50M50 66L61 58",
];
const LEAF = ["M8 52C28 22 70 18 94 46C70 74 30 78 8 52Z", "M8 52C40 48 66 46 94 46", "M34 49L48 34M54 47L68 32M34 51L46 64M56 49L68 62"];
const TENDRIL = ["M8 92C24 70 20 48 42 36C60 26 74 36 66 48C60 56 50 50 54 44", "M30 60C22 54 18 46 22 38", "M42 36C44 24 54 14 66 12"];

function makeGlyphs(): Glyph[] {
  const g = (d: string[], w: number, h: number) => ({ paths: d.map((p) => new Path2D(p)), w, h });
  return [g(LOTUS_PATHS, 110, 60), g(FEATHER, 100, 100), g(LEAF, 100, 100), g(TENDRIL, 80, 100), g(LOTUS_PATHS, 110, 60)];
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function paintPattern(ctx: CanvasRenderingContext2D, W: number, H: number, dpr: number, cell: number) {
  const glyphs = makeGlyphs();
  const r = rng(Math.round(W * 7 + H));
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const passes: [number, number, string, number][] = [
    [2.4, 3, "rgba(2,6,12,0.9)", 1.8], // cast shadow
    [-1.4, -1.6, "rgba(246,222,170,0.62)", 1], // moonlit edge
    [0, 0, "rgba(74,94,122,0.96)", 1], // raised face
  ];
  for (let y = -cell / 2; y < H / dpr + cell; y += cell * 0.86) {
    for (let x = -cell / 2; x < W / dpr + cell; x += cell) {
      const gl = glyphs[Math.floor(r() * glyphs.length)];
      const cx = x + (r() - 0.5) * cell * 0.7 + (Math.round(y / cell) % 2 ? cell / 2 : 0);
      const cy = y + (r() - 0.5) * cell * 0.6;
      const size = cell * (0.45 + r() * 0.35);
      const s = size / Math.max(gl.w, gl.h);
      const rot = (r() - 0.5) * 1.3;
      const lw = 3.2 + r() * 2.4;
      for (const [dx, dy, col, blur] of passes) {
        const c = Math.cos(rot) * s * dpr, sn = Math.sin(rot) * s * dpr;
        const ox = (cx + dx) * dpr - (c * gl.w) / 2 + (sn * gl.h) / 2;
        const oy = (cy + dy) * dpr - (sn * gl.w) / 2 - (c * gl.h) / 2;
        ctx.setTransform(c, sn, -sn, c, ox, oy);
        ctx.filter = blur > 1 ? `blur(${blur * dpr}px)` : "none";
        ctx.strokeStyle = col;
        ctx.lineWidth = lw / s;
        for (const p of gl.paths) ctx.stroke(p);
      }
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = "none";
}

export function TouchSurface({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    const dpr = coarse ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    const cell = coarse ? 130 : 175;
    const radius = coarse ? 120 : 170;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let pattern: HTMLCanvasElement | null = null;
    let mask: HTMLCanvasElement | null = null;
    let mctx: CanvasRenderingContext2D | null = null;
    let W = 0, H = 0;
    let raf = 0;
    let lastInput = 0;
    let last: { x: number; y: number } | null = null;
    const queue: { x: number; y: number }[] = [];

    const size = () => {
      const r = host.getBoundingClientRect();
      W = Math.round(r.width * dpr);
      H = Math.round(Math.min(r.height, 2400) * dpr);
      canvas.width = W;
      canvas.height = H;
      canvas.style.height = `${H / dpr}px`;
      pattern = null;
    };
    const build = () => {
      if (!W || !H) return false;
      pattern = document.createElement("canvas");
      pattern.width = W;
      pattern.height = H;
      const pctx = pattern.getContext("2d");
      if (!pctx) return false;
      paintPattern(pctx, W, H, dpr, cell);
      mask = document.createElement("canvas");
      mask.width = W;
      mask.height = H;
      mctx = mask.getContext("2d");
      return true;
    };

    const stamp = (x: number, y: number) => {
      if (!mctx) return;
      const g = mctx.createRadialGradient(x * dpr, y * dpr, 0, x * dpr, y * dpr, radius * dpr);
      g.addColorStop(0, "rgba(0,0,0,0.5)");
      g.addColorStop(0.55, "rgba(0,0,0,0.24)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      mctx.fillStyle = g;
      mctx.fillRect((x - radius) * dpr, (y - radius) * dpr, radius * 2 * dpr, radius * 2 * dpr);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!pattern || !mask || !mctx) return;
      mctx.globalCompositeOperation = "destination-out";
      mctx.fillStyle = "rgba(0,0,0,0.035)";
      mctx.fillRect(0, 0, W, H);
      mctx.globalCompositeOperation = "source-over";
      while (queue.length) {
        const p = queue.shift()!;
        stamp(p.x, p.y);
      }
      ctx.globalCompositeOperation = "copy";
      ctx.drawImage(pattern, 0, 0);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(mask, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      if (now - lastInput < 2600) raf = requestAnimationFrame(frame);
      else {
        ctx.clearRect(0, 0, W, H);
        mctx.clearRect(0, 0, W, H);
      }
    };

    const input = (clientX: number, clientY: number) => {
      const r = host.getBoundingClientRect();
      const x = clientX - r.left, y = clientY - r.top;
      if (x < -radius || y < -radius || x > r.width + radius || y > Math.min(r.height, 2400) + radius) return;
      if (!pattern && !build()) return;
      if (last) {
        const dist = Math.hypot(x - last.x, y - last.y);
        const steps = Math.min(12, Math.floor(dist / 22));
        for (let i = 1; i <= steps; i++) queue.push({ x: last.x + ((x - last.x) * i) / (steps + 1), y: last.y + ((y - last.y) * i) / (steps + 1) });
      }
      queue.push({ x, y });
      last = { x, y };
      lastInput = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      input(e.clientX, e.clientY);
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) input(t.clientX, t.clientY);
    };
    const onLeave = () => { last = null; };

    size();
    const ro = new ResizeObserver(() => size());
    ro.observe(host);
    host.addEventListener("pointermove", onPointer, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("touchstart", onTouch, { passive: true });
    host.addEventListener("touchmove", onTouch, { passive: true });
    host.addEventListener("touchend", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("touchstart", onTouch);
      host.removeEventListener("touchmove", onTouch);
      host.removeEventListener("touchend", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 w-full ${className}`} />;
}
