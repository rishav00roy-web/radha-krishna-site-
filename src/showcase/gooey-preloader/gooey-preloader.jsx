// Demo images are from Arqe (arqe.ai). They are placeholders: swap them for your own before going live. Using them in your own product needs your own Arqe plan.
'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CustomEase } from 'gsap/CustomEase';
import './gooey-preloader.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, CustomEase);
  CustomEase.create('annnimate', 'M0,0 C0.3,0.9 0.1,1 1,1');
  CustomEase.create('annnimateInOut', 'M0,0 C0.7,0 0.16,1 1,1');
}

const DEFAULT_PAGE_IMAGE = {
  src: '/art/hero/radha-krishna-1280.jpg',
  alt: 'Golden hills fading into morning mist',
};
const DEFAULT_HEADLINE = [
  { text: 'Routes for the', dim: false },
  { text: 'slow season.', dim: true },
];
const DEFAULT_BRAND = 'Merid';
const DEFAULT_LINKS = ['Routes', 'Journal', 'Shop'];

const SVG_NS = 'http://www.w3.org/2000/svg';

let uid = 0;

// Per blob: size and resting distance as shares of the mark disc, and an angle nudge so the ring is not even.
const SIZE = [0.34, 0.26, 0.4, 0.22, 0.3, 0.28, 0.36, 0.24];
const DIST = [2.1, 1.7, 2.4, 1.9, 2.25, 1.8, 2.0, 2.3];
const JITTER = [0.2, -0.15, 0.1, -0.25, 0.05, 0.18, -0.1, 0.22];
const SWIRL = 1.1;
// Progress moves in four steps (25, 50, 75, 100). Each one is due at this share of the minimum time and also
// waits until that share of the page images has loaded.
const STEPS = 4;
const STEP_AT = [0.12, 0.4, 0.68, 0.96];
const STEP_DUR = 0.55;
const FINISH_AT = 0.985;
const FLOW_EASE = 6;
// The counter rests on each number this long before its next step.
const STEP_HOLD = 0.1;
// Blobs below the disc start at this share of their distance, so none rise from the bottom of the screen.
const LOWER = 0.45;
const MARK_SHARE = 0.48;
// The mark fades in over the end of the load and is still finishing when the disc starts opening; the page circle opens over it, so it never fades out.
const MARK_FROM = 0.8;
// The reveal starts once the counter has landed and the mark has faded in this far.
const MARK_REVEAL = 0.95;
const OPEN_AT = 0;
const PHOTO_IN = 0.4;
const RING_GAP = 32;
const PAGE_ZOOM = 1.3;
const LINE_PARK = 115;

function toNumber(value, fallback) {
  const n = parseFloat(value);
  return isNaN(n) ? fallback : n;
}

/**
 * GooeyPreloader
 *
 * A page preloader where a few blobs swirl in and melt into one disc while
 * the counter rolls to 100. Your logo fades in on the disc, then a circle of
 * the page opens from its middle and grows until it fills the screen. It waits for the images on the page, with a minimum time so it
 * never just flashes.
 *
 * @param {string} [className=''] - Additional CSS classes for the root element
 * @param {number} [minDuration=2.0] - The shortest time the loader runs (0.8-5)
 * @param {number} [goo=14] - How far the goo reaches (6-24)
 * @param {number} [revealDuration=1.1] - How long the disc takes to open onto the page (0.5-2)
 * @param {number} [blobs=5] - How many blobs swirl in (3-8)
 * @param {{src: string, alt: string}} [pageImage] - The page image the loader reveals
 * @param {Array<{text: string, dim: boolean}>} [headline] - The headline lines that rise in after the page opens
 * @param {string} [brand='Merid'] - The wordmark in the page nav
 * @param {string[]} [links] - The page nav links
 */
const GooeyPreloader = forwardRef(function GooeyPreloader({
  className = '',
  minDuration = 2.0,
  goo = 14,
  blobs = 5,
  revealDuration = 1.1,
  pageImage = DEFAULT_PAGE_IMAGE,
  headline = DEFAULT_HEADLINE,
  brand = DEFAULT_BRAND,
  links = DEFAULT_LINKS,
}, ref) {
  const containerRef = useRef(null);
  const pageRef = useRef(null);
  const loaderRef = useRef(null);
  const svgRef = useRef(null);
  const blobGroupRef = useRef(null);
  const blobFilterRef = useRef(null);
  const markRef = useRef(null);
  const countRef = useRef(null);
  const pageImgRef = useRef(null);
  const lineRefs = useRef([]);
  const replayBtnRef = useRef(null);
  const blobBlurRef = useRef(null);
  const apiRef = useRef(null);

  useImperativeHandle(ref, () => ({
    play: (...args) => apiRef.current?.play(...args),
    demo: (...args) => apiRef.current?.demo(...args),
    kill: (...args) => apiRef.current?.kill(...args),
  }), []);

  // Keyed by the vanilla names, so the build body reads like the vanilla one.
  const config = {
    minDuration: Math.min(6, Math.max(0.8, toNumber(minDuration, 2.0))),
    gooStrength: Math.min(24, Math.max(6, toNumber(goo, 14))),
    blobCount: Math.round(Math.min(8, Math.max(3, toNumber(blobs, 5)))),
    revealDuration: Math.min(2, Math.max(0.5, toNumber(revealDuration, 1.1))),
  };

  useGSAP((context, contextSafe) => {
    // --- 1. Selectors ---
    const container = containerRef.current;
    const loader = loaderRef.current;
    const svg = svgRef.current;
    const page = pageRef.current;
    const blobGroup = blobGroupRef.current;
    const blobFilter = blobFilterRef.current;
    const mark = markRef.current;
    const count = countRef.current;
    const pageImg = pageImgRef.current;
    const lines = lineRefs.current.filter(Boolean);
    const replayBtn = replayBtnRef.current;
    if (!loader || !svg || !page || !blobGroup || !blobFilter) return null;
    const blobBlur = blobBlurRef.current;

    // --- 2. Config ---
    const { minDuration, gooStrength, blobCount, revealDuration } = config;

    // --- 4. State ---
    const id = ++uid;
    const prog = { v: 0 };
    // The goo runs on its own smooth progress; only the counter moves in steps.
    const flow = { v: 0, t: 0 };
    const goo = { blobs: 0 };
    const clip = { r: 0 };
    let w = 1;
    let h = 1;
    let disc = 120;
    let blobs = [];
    let mass = null;
    let digits = [];
    let countFrom = 0;
    let countTo = 0;
    let ringScale = 1;
    let landedAt = 0;
    let target = 0;
    let startedAt = 0;
    let running = false;
    let follow = null;
    let exitTl = null;
    let reduced = false;
    let resizeTimer = null;

    // --- 5. Helpers ---
    function smoothstep(a, b, x) {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    }

    // Images on the page, the preloader's own excluded, so a real site waits for its photos.
    function assetProgress() {
      const imgs = Array.from(document.images).filter((img) => !loader.contains(img));
      if (!imgs.length) return 1;
      return imgs.filter((img) => img.complete).length / imgs.length;
    }

    function applyBlur() {
      blobBlur.setAttribute('stdDeviation', goo.blobs.toFixed(2));
    }

    function make(tag, attrs, parent) {
      const el = document.createElementNS(SVG_NS, tag);
      Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
      parent.appendChild(el);
      return el;
    }

    function measure() {
      w = Math.max(1, container.clientWidth);
      h = Math.max(1, container.clientHeight);
      disc = Math.min(210, Math.max(120, w * 0.12));
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      container.style.setProperty('--gp-mark', Math.round(disc * MARK_SHARE) + 'px');
    }

    function applyClip() {
      page.style.setProperty('--gp-r', clip.r.toFixed(2) + 'px');
    }

    function buildBlobs() {
      blobGroup.textContent = '';
      mass = make('circle', { cx: w / 2, cy: h / 2, r: 0 }, blobGroup);
      blobs = [];
      for (let i = 0; i < blobCount; i++) {
        blobs.push({
          el: make('circle', { cx: w / 2, cy: h / 2, r: 0 }, blobGroup),
          angle: (i / blobCount) * Math.PI * 2 + JITTER[i] - Math.PI / 2,
          spin: i % 2 ? -1 : 1,
          size: SIZE[i],
          dist: DIST[i],
        });
      }
    }

    function buildCounter() {
      if (!count) return;
      count.textContent = '';
      digits = [['', '1'], '01234567890'.split(''), '01234567890'.split('')].map((cells) => {
        const col = document.createElement('span');
        col.className = 'gp_digit';
        const strip = document.createElement('span');
        strip.className = 'gp_strip';
        cells.forEach((c) => {
          const cell = document.createElement('span');
          cell.className = 'gp_cell';
          cell.textContent = c;
          strip.appendChild(cell);
        });
        col.appendChild(strip);
        count.appendChild(col);
        return strip;
      });
    }

    // The counter's travel: it starts with its first shown digit on the left margin and ends flush with the right one.
    // The hundreds column is blank until 100, so it starts parked just left of the margin.
    function measureCount() {
      if (!count || !digits.length) return;
      const width = count.offsetWidth;
      const margin = parseFloat(getComputedStyle(count).left) || 0;
      countFrom = -width / 3;
      countTo = w - margin * 2 - width;
      // The blob ring is pulled in where it would reach down into the counter's lane.
      const lane = margin + count.offsetHeight + RING_GAP;
      ringScale = Math.min(1, Math.max(0.4, (h / 2 - lane) / (Math.max(...DIST) * disc * LOWER + disc / 4)));
    }

    // When the counter's last step lands: its schedule, or the four steps with their rests back to back, whichever is later.
    function counterEnd() {
      return Math.max(minDuration * STEP_AT[STEPS - 1], minDuration * STEP_AT[0] + (STEPS - 1) * (STEP_DUR + STEP_HOLD)) + STEP_DUR;
    }

    function digitsOf(n) {
      return n >= 100 ? [1, 10, 10] : [0, Math.floor(n / 10), n % 10];
    }

    // Each step rolls every digit straight from its old number to its new one (75 -> 100 rolls the ones 5 -> 0
    // forward through the extra 0 at the bottom of the strip), while the whole counter slides one quarter along.
    function paintCounter(v) {
      if (!digits.length) return;
      const n = v * 100;
      const k = Math.min(STEPS - 1, Math.floor(n / 25));
      const t = Math.min(1, Math.max(0, (n - k * 25) / 25));
      const a = digitsOf(k * 25);
      const b = digitsOf((k + 1) * 25);
      if (b[2] < a[2]) b[2] += 10;
      [0, 1, 2].forEach((i) => {
        const pos = a[i] + (b[i] - a[i]) * t;
        digits[i].style.transform = 'translateY(' + (-pos).toFixed(3) + 'em)';
      });
      count.style.transform = 'translateX(' + (countFrom + (countTo - countFrom) * v).toFixed(2) + 'px)';
    }

    // Everything the loading phase shows is a pure function of the shown progress.
    function paint() {
      const v = flow.v;
      const s = reduced ? 1 : smoothstep(0, 0.8, v);
      const cx = w / 2;
      const cy = h / 2;
      const radius = disc / 2;
      mass.setAttribute('r', (radius * (reduced ? 1 : 0.45 + 0.55 * v)).toFixed(2));
      blobs.forEach((b) => {
        const a = b.angle + b.spin * v * SWIRL;
        const d = b.dist * disc * ringScale * (1 - s);
        b.el.setAttribute('cx', (cx + Math.cos(a) * d).toFixed(2));
        b.el.setAttribute('cy', (cy + Math.sin(a) * d * (Math.sin(a) > 0 ? LOWER : 1)).toFixed(2));
        b.el.setAttribute('r', (b.size * radius).toFixed(2));
      });
      goo.blobs = reduced ? 0 : gooStrength * smoothstep(0.25, 0.7, v);
      applyBlur();
      if (mark) gsap.set(mark, { autoAlpha: reduced ? 1 : smoothstep(MARK_FROM, 1, v) });
      paintCounter(prog.v);
      loader.setAttribute('aria-valuenow', String(Math.round(prog.v * 100)));
    }

    // --- 6. Animation routines ---
    function parkPage() {
      gsap.set(page, { opacity: reduced ? 1 : 0 });
      if (pageImg) gsap.set(pageImg, { scale: reduced ? 1 : PAGE_ZOOM, force3D: true });
      gsap.set(lines, { yPercent: reduced ? 0 : LINE_PARK, force3D: true });
    }

    // One continuous move with no hold: as the last step lands the goo settles into a clean disc, the counter
    // rolls away, a circle of the page opens from the middle of the disc, and the mark fades out where it is
    // while the circle is still small.
    function buildExit() {
      if (exitTl) exitTl.kill();
      const full = Math.hypot(w, h) / 2 + 2;
      const tl = gsap.timeline({ onComplete: done });
      tl.to(goo, { blobs: 0, duration: 0.5, ease: 'annnimate', onUpdate: applyBlur, data: { label: 'Goo settles into one disc' } }, 0);
      if (digits.length) tl.to(digits, { yPercent: '-=110', duration: 0.6, ease: 'annnimateInOut', data: { label: 'Counter rolls away' } }, 0);
      // The photo fades in inside the disc at the disc's own size, so the logo hands over to it in place, and the
      // held start of Punch keeps the circle on the disc until the photo is in before it grows to the full hero.
      tl.fromTo(page, { opacity: 0 }, { opacity: 1, duration: PHOTO_IN, ease: 'annnimate', data: { label: 'Photo fills the disc' } }, OPEN_AT);
      tl.fromTo(clip, { r: parseFloat(mass.getAttribute('r')) || disc / 2 }, { r: full, duration: revealDuration, ease: 'annnimateInOut', onUpdate: applyClip, data: { label: 'Disc grows into the hero' } }, OPEN_AT);
      if (mark) tl.to(mark, { autoAlpha: 1, duration: 0.45, ease: 'annnimate', data: { label: 'Mark finishes fading in' } }, 0);
      if (pageImg) tl.fromTo(pageImg, { scale: PAGE_ZOOM }, { scale: 1, duration: revealDuration, ease: 'annnimateInOut', force3D: true, data: { label: 'Photo settles' } }, OPEN_AT);
      tl.to(lines, { yPercent: 0, duration: 0.9, ease: 'annnimate', stagger: 0.08, force3D: true, data: { label: 'Headline rises' } }, OPEN_AT + revealDuration * 0.6);
      exitTl = tl;
    }

    function done() {
      gsap.set(page, { clearProps: 'opacity' });
      if (mark) gsap.set(mark, { autoAlpha: 0 });
      // autoAlpha, not only the class: play() leaves an inline visibility that would outrank it.
      gsap.set(loader, { autoAlpha: 0 });
      page.style.removeProperty('--gp-r');
      loader.classList.add('is-done');
      loader.setAttribute('aria-valuenow', '100');
      container.dispatchEvent(new CustomEvent('anm:preloader-done', { bubbles: true }));
    }

    function finish() {
      running = false;
      if (reduced) {
        gsap.set(page, { opacity: 1 });
        page.style.removeProperty('--gp-r');
        if (mark) gsap.to(mark, { autoAlpha: 0, duration: 0.3, ease: 'none' });
        gsap.to(loader, { autoAlpha: 0, duration: 0.3, ease: 'none', onComplete: done });
        return;
      }
      buildExit();
    }

    function tick() {
      if (!running) return;
      const now = performance.now();
      const dt = flow.t ? Math.min(0.05, (now - flow.t) / 1000) : 0;
      flow.t = now;
      // Timed to arrive with the counter's last step (less the smoothing lag), so the disc and 100 land together.
      const raw = Math.min(1, (now - startedAt) / 1000 / (counterEnd() - 1 / FLOW_EASE), assetProgress());
      flow.v = reduced ? raw : flow.v + (raw - flow.v) * (1 - Math.exp(-dt * FLOW_EASE));
      const frac = (performance.now() - startedAt) / 1000 / minDuration;
      const due = STEP_AT.filter((at) => frac >= at).length;
      const step = Math.min(due, Math.floor(assetProgress() * STEPS + 1e-6));
      const want = step / STEPS;
      const settled = !follow || !follow.isActive();
      // One step at a time, and each rests on its number for STEP_HOLD before the next one starts.
      if (want > target + 0.001 && settled && now - landedAt >= STEP_HOLD * 1000) {
        target = Math.min(want, target + 1 / STEPS);
        follow = gsap.to(prog, { v: target, duration: reduced ? 0 : STEP_DUR, ease: 'annnimateInOut', onComplete: () => { landedAt = performance.now(); } });
      }
      paint();
      if (target >= 1 && prog.v >= FINISH_AT && smoothstep(MARK_FROM, 1, flow.v) >= MARK_REVEAL) finish();
    }

    function play() {
      if (exitTl) exitTl.kill();
      exitTl = null;
      if (follow) follow.kill();
      gsap.killTweensOf([goo, clip, loader, mark, page]);
      gsap.set(loader, { autoAlpha: 1 });
      loader.classList.remove('is-done');
      goo.blobs = 0;
      clip.r = 0;
      applyClip();
      prog.v = 0;
      landedAt = 0;
      flow.v = 0;
      flow.t = 0;
      target = 0;
      buildBlobs();
      buildCounter();
      measureCount();
      parkPage();
      paint();
      startedAt = performance.now();
      running = true;
    }

    // --- 7. Event listeners ---
    // Listeners and the ticker fire after mount, outside the gsap context, so the ones that start tweens are wrapped in contextSafe.
    const handleReplay = contextSafe(() => {
      play();
    });

    function handleResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measure();
        measureCount();
        // Only a loader that is still waiting is rebuilt for the new size; an opening circle keeps its course.
        if (running) {
          buildBlobs();
          paint();
        }
      }, 150);
    }

    function handleVisibility() {
      if (document.hidden) gsap.globalTimeline.pause();
      else gsap.globalTimeline.resume();
    }

    if (replayBtn) replayBtn.addEventListener('click', handleReplay);
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);

    // --- 8. Initial DOM state ---
    blobFilter.id = 'gp-blobs-' + id;
    blobGroup.setAttribute('filter', 'url(#gp-blobs-' + id + ')');
    measure();
    const tickSafe = contextSafe(tick);
    gsap.ticker.add(tickSafe);
    if (document.fonts) document.fonts.ready.then(() => { if (running) measureCount(); });

    // --- 9. Reduced motion ---
    // Reduced motion keeps the counter and the mark, and the loader simply fades once the page is ready.
    const mm = gsap.matchMedia();
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
      reduced = !!ctx.conditions.reduce;
    });
    // A preloader runs as the page loads: the load is its input (an entrance system, like a Kit cover).
    play();

    // --- 10. Public API ---
    function demo() {
      play();
      return null;
    }

    function kill() {
      running = false;
      gsap.ticker.remove(tickSafe);
      if (exitTl) exitTl.kill();
      if (follow) follow.kill();
      gsap.killTweensOf([goo, clip]);
      page.style.removeProperty('--gp-r');
      clearTimeout(resizeTimer);
      if (replayBtn) replayBtn.removeEventListener('click', handleReplay);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      mm.revert();
    }

    const api = { play: contextSafe(play), demo: contextSafe(demo), kill };
    apiRef.current = api;

    return () => {
      apiRef.current = null;
      api.kill();
    };
  }, {
    dependencies: [minDuration, goo, blobs, revealDuration, headline.length],
    revertOnUpdate: true,
  });

  return (
    <section
      ref={containerRef}
      className={'gp_wrap' + (className ? ' ' + className : '')}
      data-anm-gooey-preloader
    >
      <div ref={pageRef} className="gp_page" data-anm-gp-page>
        <img
          ref={pageImgRef}
          className="gp_page_img"
          data-anm-gp-page-img
          src={pageImage.src}
          width="1920"
          height="1446"
          alt={pageImage.alt}
        />
        <header className="gp_nav">
          <span className="gp_brand">{brand}</span>
          <span className="gp_links">{links.map((link) => <span key={link}>{link}</span>)}</span>
        </header>
        <h1 className="gp_headline">
          {headline.map((line, i) => (
            <span key={i} className="gp_line"><span ref={(el) => { lineRefs.current[i] = el; }} className={'gp_line_inner' + (line.dim ? ' gp_line_dim' : '')} data-anm-gp-line>{line.text}</span></span>
          ))}
        </h1>
        <button ref={replayBtnRef} className="gp_replay" type="button" data-anm-gp-replay>Replay</button>
      </div>

      <div
        ref={loaderRef}
        className="gp_loader"
        data-anm-gp-loader
        role="progressbar"
        aria-label="Loading the page"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="0"
      >
        <svg ref={svgRef} className="gp_goo" data-anm-gp-svg aria-hidden="true" focusable="false">
          <defs>
            <filter
              ref={blobFilterRef}
              data-anm-gp-filter="blobs"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur ref={blobBlurRef} in="SourceGraphic" stdDeviation="0" />
              <feColorMatrix mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" />
            </filter>
          </defs>
          <g ref={blobGroupRef} className="gp_blobs" data-anm-gp-blobs />
        </svg>
        <p ref={countRef} className="gp_count" data-anm-gp-count aria-hidden="true" />
      </div>
      <svg
        ref={markRef}
        className="gp_mark"
        data-anm-gp-mark
        viewBox="0 0 106.96 108.89"
        aria-hidden="true"
        focusable="false"
      ><path d="M51.11.04c72.27-2.42,75.02,105.84,4.57,108.79C-15.99,111.83-19.5,2.41,51.11.04ZM49.53,4.77C32.75,5.39,12.77,23.49,6.89,38.58c-8.83,22.67,4.37,35.01,26.62,25.81,16.76-6.93,36.61-29.34,32.53-48.72-1.48-7.04-9.68-11.16-16.51-10.91ZM82.91,41.39c-13.91,1.75-29.26,14.91-36.26,26.6-15.46,25.83-1.1,45.71,26.92,30.88,13.37-7.08,28.18-24.35,29.35-39.9.94-12.58-8.03-19.09-20-17.59Z" /></svg>
    </section>
  );
});

export default GooeyPreloader;
