"use client";

import { useEffect, useRef } from "react";
import { LOTUS_PATHS } from "../BrandMark";

/**
 * Touchable surface: the wall behind the page is carved (moonlit stone on night sections, ivory plaster
 * on light ones). Move the cursor (or drag a finger) and relief
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

type Tone = "dark" | "light";

// Emboss passes per tone: [dx, dy, colour, blur]. Dark = moonlit stone, light = ivory plaster.
const PASSES: Record<Tone, [number, number, string, number][]> = {
  dark: [
    [2.4, 3, "rgba(2,6,12,0.9)", 1.8], // cast shadow
    [-1.4, -1.6, "rgba(246,222,170,0.62)", 1], // moonlit edge
    [0, 0, "rgba(74,94,122,0.96)", 1], // raised face
  ],
  light: [
    [2.2, 2.8, "rgba(112,82,44,0.42)", 2], // soft shadow
    [-1.4, -1.6, "rgba(255,253,247,0.95)", 1], // lit edge
    [0, 0, "rgba(246,236,218,1)", 1], // plaster face
  ],
};

/**
 * Rishav's carved relief patterns (Gemini), turned into transparent light/shadow layers so they sit on any
 * section colour. Tiled at TILE_SIZE css px (smaller on phones). Loaded on first touch; the drawn shapes
 * are the fallback if a tile fails to load.
 */
const RELIEF_TILES: Record<Tone, string | null> = { dark: "/art/relief/relief-dark.webp", light: "/art/relief/relief-light.webp" };
const TILE_SIZE = 560;

function paintTile(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number, dpr: number, scale: number) {
  const size = Math.round(TILE_SIZE * scale * dpr);
  for (let y = 0; y < H; y += size) for (let x = 0; x < W; x += size) ctx.drawImage(img, x, y, size, size);
}

function paintPattern(ctx: CanvasRenderingContext2D, W: number, H: number, dpr: number, cell: number, tone: Tone) {
  const glyphs = makeGlyphs();
  const r = rng(Math.round(W * 7 + H));
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const passes = PASSES[tone];
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

export function TouchSurface({ className = "", tone = "dark" }: { className?: string; tone?: Tone }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    // The relief is soft, so 1x is enough on every screen; the reveal mask is soft too and runs at 1/4.
    const dpr = 1;
    const MS = 0.25;
    const LIFE = 1800; // ms a touched spot takes to sink back
    const TAU = 300; // fade time constant (ms); time based, so slow phones fade as fast as fast laptops
    const cell = coarse ? 130 : 175;
    const radius = coarse ? 72 : 92; // a small, soft pool of light around the cursor or finger
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tileSrc = RELIEF_TILES[tone];
    let tileImg: HTMLImageElement | null = null;
    let tileState: "idle" | "loading" | "ready" | "failed" = tileSrc ? "idle" : "failed";
    const loadTile = () => {
      if (tileState !== "idle" || !tileSrc) return;
      tileState = "loading";
      tileImg = new Image();
      tileImg.decoding = "async";
      tileImg.onload = () => { tileState = "ready"; };
      tileImg.onerror = () => { tileState = "failed"; };
      tileImg.src = tileSrc;
    };
    let pattern: HTMLCanvasElement | null = null;
    let mask: HTMLCanvasElement | null = null;
    let mctx: CanvasRenderingContext2D | null = null;
    let W = 0, H = 0;
    let raf = 0;
    let lastInput = 0;
    let lastFrame = 0;
    let prev: [number, number, number, number] | null = null; // last frame's dirty rectangle
    let last: { x: number; y: number } | null = null;
    const queue: { x: number; y: number }[] = [];
    const recent: { x: number; y: number; t: number }[] = []; // drives the dirty rectangle

    const size = () => {
      const r = host.getBoundingClientRect();
      W = Math.round(r.width);
      H = Math.round(Math.min(r.height, 2400));
      canvas.width = W;
      canvas.height = H;
      canvas.style.height = `${H}px`;
      pattern = null;
    };
    const build = () => {
      if (!W || !H) return false;
      pattern = document.createElement("canvas");
      pattern.width = W;
      pattern.height = H;
      const pctx = pattern.getContext("2d");
      if (!pctx) return false;
      if (tileState === "ready" && tileImg) paintTile(pctx, tileImg, W, H, dpr, coarse ? 0.75 : 1);
      else paintPattern(pctx, W, H, dpr, cell, tone);
      mask = document.createElement("canvas");
      mask.width = Math.ceil(W * MS);
      mask.height = Math.ceil(H * MS);
      mctx = mask.getContext("2d");
      return true;
    };

    // One soft brush, drawn once and stamped with drawImage (cheaper than a gradient per stamp).
    const brush = document.createElement("canvas");
    const br = Math.ceil(radius * MS);
    brush.width = brush.height = br * 2;
    const bctx = brush.getContext("2d");
    if (bctx) {
      const g = bctx.createRadialGradient(br, br, 0, br, br, br);
      g.addColorStop(0, "rgba(0,0,0,0.42)");
      g.addColorStop(0.5, "rgba(0,0,0,0.16)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      bctx.fillStyle = g;
      bctx.fillRect(0, 0, br * 2, br * 2);
    }
    const stamp = (x: number, y: number) => {
      if (mctx) mctx.drawImage(brush, x * MS - br, y * MS - br);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!pattern || !mask || !mctx) return;
      const dt = lastFrame ? Math.min(100, now - lastFrame) : 16;
      lastFrame = now;
      while (queue.length) {
        const p = queue.shift()!;
        recent.push({ x: p.x, y: p.y, t: now });
      }
      while (recent.length && now - recent[0].t > LIFE) recent.shift();
      // Only the area touched in the last few seconds is redrawn.
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const p of recent) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
      if (!recent.length) {
        ctx.clearRect(0, 0, W, H);
        mctx.clearRect(0, 0, mask.width, mask.height);
        prev = null;
        lastFrame = 0;
        return;
      }
      x0 = Math.max(0, Math.floor(x0 - radius - 4)); y0 = Math.max(0, Math.floor(y0 - radius - 4));
      x1 = Math.min(W, Math.ceil(x1 + radius + 4)); y1 = Math.min(H, Math.ceil(y1 + radius + 4));
      const bw = x1 - x0, bh = y1 - y0;
      if (bw <= 0 || bh <= 0) { if (now - lastInput < LIFE) raf = requestAnimationFrame(frame); return; }
      const mx = Math.floor(x0 * MS), my = Math.floor(y0 * MS), mw = Math.ceil(bw * MS) + 1, mh = Math.ceil(bh * MS) + 1;
      // Whatever the rectangle just let go of is wiped at once, so no strip of pattern is left behind.
      if (prev) {
        const [px, py, pw, ph] = prev;
        if (px < x0 || py < y0 || px + pw > x1 || py + ph > y1) {
          for (const [c, k] of [[ctx, 1], [mctx, MS]] as const) {
            c.save();
            c.beginPath();
            c.rect(px * k - 1, py * k - 1, pw * k + 2, ph * k + 2);
            c.rect(x0 * k, y0 * k, bw * k, bh * k);
            c.clip("evenodd");
            c.clearRect(px * k - 1, py * k - 1, pw * k + 2, ph * k + 2);
            c.restore();
          }
        }
      }
      prev = [x0, y0, bw, bh];
      mctx.globalCompositeOperation = "destination-out";
      mctx.fillStyle = `rgba(0,0,0,${Math.max(0.08, 1 - Math.exp(-dt / TAU)).toFixed(3)})`;
      mctx.fillRect(mx, my, mw, mh);
      mctx.globalCompositeOperation = "source-over";
      for (const p of recent) if (p.t === now) stamp(p.x, p.y);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, y0, bw, bh);
      ctx.clip();
      ctx.clearRect(x0, y0, bw, bh);
      ctx.drawImage(pattern, x0, y0, bw, bh, x0, y0, bw, bh);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(mask, mx, my, mw, mh, mx / MS, my / MS, mw / MS, mh / MS);
      ctx.restore();
      if (now - lastInput < LIFE) raf = requestAnimationFrame(frame);
      else {
        ctx.clearRect(0, 0, W, H);
        mctx.clearRect(0, 0, mask.width, mask.height);
        recent.length = 0;
        prev = null;
        lastFrame = 0;
      }
    };

    const input = (clientX: number, clientY: number) => {
      const r = host.getBoundingClientRect();
      const x = clientX - r.left, y = clientY - r.top;
      if (x < -radius || y < -radius || x > r.width + radius || y > Math.min(r.height, 2400) + radius) return;
      if (!pattern) {
        // Wait (briefly) for the painted tile on first touch; fall back to drawn shapes if it fails.
        loadTile();
        if (tileState === "loading" || !build()) return;
      }
      if (last) {
        const dist = Math.hypot(x - last.x, y - last.y);
        const steps = Math.min(8, Math.floor(dist / (coarse ? 40 : 28)));
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
  }, [tone]);

  // Kept low so the carving stays a whisper under the words.
  return <canvas ref={ref} aria-hidden style={{ opacity: tone === "light" ? 0.5 : 0.55 }} className={`pointer-events-none absolute inset-x-0 top-0 w-full ${className}`} />;
}
