"use client";

import { useEffect, useRef } from "react";

/**
 * A live river at night: floating diyas and lotus drift across still water, their flames flicker
 * and their reflections waver in the ripples. Drawn on one canvas with a simple depth model
 * (further = higher, smaller, slower). Paused off screen; a still frame for reduced motion.
 */
export function RiverLamps({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2);

    type Float = { kind: "diya" | "lotus"; x: number; z: number; speed: number; phase: number; flick: number };
    let floats: Float[] = [];
    let w = 0;
    let h = 0;
    let seed = 11;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

    const glow = document.createElement("canvas");
    glow.width = glow.height = 128;
    const gx = glow.getContext("2d")!;
    const gg = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gg.addColorStop(0, "rgba(255, 236, 190, 0.95)");
    gg.addColorStop(0.15, "rgba(255, 190, 100, 0.6)");
    gg.addColorStop(0.45, "rgba(255, 150, 60, 0.16)");
    gg.addColorStop(1, "rgba(255, 140, 50, 0)");
    gx.fillStyle = gg;
    gx.fillRect(0, 0, 128, 128);

    // Rishav's painted sprites (public/art). Until they load, the drawn shapes below stand in.
    const sprite = (src: string) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      img.onload = () => { if (still) draw(performance.now()); };
      return img;
    };
    const lotusImg = sprite("/art/lotus-float.webp");
    const diyaImg = sprite("/art/diya-float.webp");
    const ready = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed = 11;
      const n = Math.max(6, Math.round(w / (phone ? 70 : 95)));
      floats = Array.from({ length: n }, (_, i) => ({
        kind: i % 3 === 2 ? "lotus" : "diya",
        x: rnd() * (w + 200) - 100,
        z: 0.25 + rnd() * 0.75,
        speed: 0.08 + rnd() * 0.16,
        phase: rnd() * Math.PI * 2,
        flick: 4 + rnd() * 5,
      }));
      floats.sort((a, b) => a.z - b.z);
    };

    const water = (t: number) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(20, 27, 36, 0)");
      g.addColorStop(0.25, "#16202b");
      g.addColorStop(1, "#0b1016");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // Ripples: faint horizontal strokes that breathe.
      ctx.lineWidth = 1;
      for (let i = 0; i < 26; i++) {
        const y = h * (0.22 + (i / 26) * 0.78);
        const p = i / 26;
        ctx.strokeStyle = `rgba(214, 196, 160, ${0.03 + 0.05 * p * (0.5 + 0.5 * Math.sin(t * 0.7 + i * 1.7))})`;
        ctx.beginPath();
        const seg = 40 + 60 * p;
        for (let x = -seg; x < w + seg; x += seg * 2.2) {
          const off = Math.sin(t * 0.4 + i * 3.1 + x * 0.01) * 18;
          ctx.moveTo(x + off, y);
          ctx.lineTo(x + off + seg, y);
        }
        ctx.stroke();
      }
    };

    const diya = (x: number, y: number, s: number, t: number, f: Float) => {
      const flick = 1 + 0.12 * Math.sin(t * f.flick + f.phase) + 0.06 * Math.sin(t * f.flick * 2.3);
      // Reflection: a wavering column of light under the lamp.
      ctx.globalCompositeOperation = "lighter";
      for (let k = 1; k <= 6; k++) {
        const ry = y + k * 7 * s;
        const rx = (ready(diyaImg) ? x + 12 * s : x) + Math.sin(t * 2 + k + f.phase) * 3 * s;
        ctx.globalAlpha = (0.32 / k) * flick;
        ctx.drawImage(glow, rx - 22 * s, ry - 5 * s, 44 * s, 10 * s);
      }
      ctx.globalAlpha = 0.9 * flick;
      const gx = ready(diyaImg) ? x + 12 * s : x; // over the wick
      ctx.drawImage(glow, gx - 46 * s * flick, y - 62 * s, 92 * s * flick, 92 * s * flick);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      // Clay lamp: the painted diya, else a drawn one. The flame sits on its wick.
      let fx = x;
      let fy = y;
      if (ready(diyaImg)) {
        const dw = 34 * s;
        const dh = (dw * diyaImg.naturalHeight) / diyaImg.naturalWidth;
        const left = x - dw / 2;
        const top = y - dh * 0.5;
        ctx.drawImage(diyaImg, left, top, dw, dh);
        fx = left + dw * 0.86;
        fy = top + dh * 0.22;
      } else {
        ctx.fillStyle = "#7a3f22";
        ctx.beginPath();
        ctx.ellipse(x, y, 13 * s, 5 * s, 0, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "#a65a2e";
        ctx.beginPath();
        ctx.ellipse(x, y, 13 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // Flame.
      const fh = 15 * s * flick;
      ctx.fillStyle = "#ffe7b0";
      ctx.beginPath();
      ctx.moveTo(fx - 3.2 * s, fy - 2 * s);
      ctx.quadraticCurveTo(fx - 4 * s, fy - fh * 0.55, fx + Math.sin(t * 3 + f.phase) * 1.5 * s, fy - fh);
      ctx.quadraticCurveTo(fx + 4 * s, fy - fh * 0.55, fx + 3.2 * s, fy - 2 * s);
      ctx.closePath();
      ctx.fill();
    };

    const lotus = (x: number, y: number, s: number) => {
      if (ready(lotusImg)) {
        const lw = 56 * s;
        const lh = (lw * lotusImg.naturalHeight) / lotusImg.naturalWidth;
        ctx.drawImage(lotusImg, x - lw / 2, y - lh * 0.72, lw, lh);
        return;
      }
      ctx.fillStyle = "rgba(38, 66, 52, 0.95)";
      ctx.beginPath();
      ctx.ellipse(x, y + 2 * s, 22 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      const petals: [number, number][] = [[-14, -0.9], [-7, -0.45], [0, 0], [7, 0.45], [14, 0.9]];
      for (const [dx, rot] of petals) {
        ctx.save();
        ctx.translate(x + dx * s * 0.6, y);
        ctx.rotate(rot * 0.6);
        const g = ctx.createLinearGradient(0, -18 * s, 0, 0);
        g.addColorStop(0, "#f7d6de");
        g.addColorStop(1, "#c4607a");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-7 * s, -9 * s, 0, -18 * s);
        ctx.quadraticCurveTo(7 * s, -9 * s, 0, 0);
        ctx.fill();
        ctx.restore();
      }
    };

    let raf = 0;
    let visible = false;
    let last = performance.now();
    const draw = (now: number) => {
      const t = now / 1000;
      const dt = Math.min(48, now - last) / 16.67;
      last = now;
      ctx.clearRect(0, 0, w, h);
      water(t);
      for (const f of floats) {
        const s = (phone ? 0.75 : 1) * (0.45 + f.z * 0.85);
        if (!still) f.x += f.speed * f.z * dt;
        if (f.x > w + 60) f.x = -60;
        const y = h * (0.3 + f.z * 0.55) + Math.sin(t * 0.9 + f.phase) * 2.5 * s;
        if (f.kind === "diya") diya(f.x, y, s, t, f);
        else lotus(f.x, y, s);
      }
      if (!still) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (still) return draw(performance.now());
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (still) draw(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none block ${className}`} />;
}
