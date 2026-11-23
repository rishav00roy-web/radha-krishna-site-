"use client";

import { useEffect, useRef } from "react";

/**
 * Live golden motes drifting upward, like sparks from aarti lamps. One small canvas per scene:
 * capped pixel ratio, fewer motes on phones, paused while off screen or when the tab is hidden,
 * and not drawn at all for reduced motion. Purely decorative (aria-hidden).
 */
export function Embers({
  className = "",
  density = 1,
  color = "255, 206, 128",
  rise = 1,
}: {
  className?: string;
  /** Multiplier on the base mote count (about one mote per 14,000 px² on desktop). */
  density?: number;
  /** RGB triplet for the glow. */
  color?: string;
  /** Multiplier on upward speed. */
  rise?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const phone = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2);
    type Mote = { x: number; y: number; r: number; vy: number; sway: number; phase: number; life: number; tw: number };
    let motes: Mote[] = [];
    let w = 0;
    let h = 0;

    const spawn = (anywhere: boolean): Mote => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * (phone ? 1.6 : 2.2),
      vy: (0.12 + Math.random() * 0.38) * rise,
      sway: 6 + Math.random() * 18,
      phase: Math.random() * Math.PI * 2,
      life: Math.random(),
      tw: 0.6 + Math.random() * 1.8,
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(((w * h) / (phone ? 22000 : 14000)) * density);
      motes = Array.from({ length: Math.min(count, phone ? 36 : 70) }, () => spawn(true));
    };

    // Pre-render one soft glow sprite; drawing images is much cheaper than gradients per mote.
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const s = sprite.getContext("2d")!;
    const g = s.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, `rgba(255, 246, 220, 1)`);
    g.addColorStop(0.18, `rgba(${color}, 0.9)`);
    g.addColorStop(0.5, `rgba(${color}, 0.22)`);
    g.addColorStop(1, `rgba(${color}, 0)`);
    s.fillStyle = g;
    s.fillRect(0, 0, 64, 64);

    let raf = 0;
    let visible = false;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const t = now / 1000;
      for (const m of motes) {
        m.y -= m.vy * dt;
        m.life += 0.0016 * dt;
        if (m.y < -20 || m.life > 1.4) Object.assign(m, spawn(false), { life: 0 });
        const x = m.x + Math.sin(t * 0.5 + m.phase) * m.sway;
        // Fade in at the bottom, out near the top, and twinkle.
        const edge = Math.min(1, (h - m.y) / (h * 0.2), m.y / (h * 0.35));
        const a = Math.max(0, edge) * (0.55 + 0.45 * Math.sin(t * m.tw + m.phase));
        const size = m.r * 9;
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, x - size / 2, m.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    const ro = new ResizeObserver(resize);
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
  }, [density, color, rise]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none ${className}`} />;
}
