"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Embers } from "@/components/Embers";
import { Petals } from "@/components/Petals";
import { Mist } from "@/components/home/art";
import StackingCardsJs from "./StackingCards";
import "./directions.css";

type Copy = Record<
  | "name" | "tagline" | "subhead" | "brand" | "aboutTitle" | "aboutBody" | "visionTitle" | "visionBody"
  | "heroArt" | "templeArt" | "quote" | "quoteSa" | "quoteSource" | "festivalName" | "festivalBody"
  | "donateIntro" | "donateHow" | "talk",
  string
>;
type Facility = { code: string; name: string; summary: string };
type Id = "a" | "b" | "c";
const StackingCards = StackingCardsJs as unknown as React.ComponentType<{ cards: { src: string; alt: string; label: string }[]; ariaLabel?: string; stepHeight?: number }>;

const HERO = "/art/hero/radha-krishna-1920.webp";
const HERO_SM = "/art/hero/radha-krishna-1280.webp";

const LABELS: Record<Id, string> = { a: "A · Art-led painted scroll", b: "B · Calm editorial temple", c: "C · Bold modern devotional" };

/** Three working redesign mockups, one per route, with a switcher pinned to the bottom of the screen. */
export function Directions({ id, copy, facilities }: { id: Id; copy: Copy; facilities: Facility[] }) {
  const root = useRef<HTMLDivElement>(null);

  // Direction-specific motion, on top of the site's own Lenis + parallax (Motion.tsx).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let revert = () => {};
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-d-rise]").forEach((el) =>
          gsap.from(el, { y: 36, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
        );
        gsap.from("[data-d-hero] [data-d-in]", { y: 40, opacity: 0, duration: 1.4, ease: "expo.out", stagger: 0.12, delay: 0.15 });

        if (id === "a") {
          // The painting slowly pushes in as the hero scrolls away.
          gsap.to("[data-a-art]", { scale: 1.12, ease: "none", scrollTrigger: { trigger: "[data-d-hero]", start: "top top", end: "bottom top", scrub: true } });
          gsap.to("[data-a-copy]", { opacity: 0, y: -60, ease: "none", scrollTrigger: { trigger: "[data-d-hero]", start: "30% top", end: "80% top", scrub: true } });
        }
        if (id === "c") {
          // Huge type slides sideways against the scroll; facility strip scrolls horizontally while pinned.
          gsap.to("[data-c-marquee]", { xPercent: -30, ease: "none", scrollTrigger: { trigger: "[data-c-marquee]", start: "top bottom", end: "bottom top", scrub: true } });
          const track = document.querySelector<HTMLElement>("[data-c-track]");
          const wrap = document.querySelector<HTMLElement>("[data-c-pin]");
          if (track && wrap && window.innerWidth >= 768) {
            gsap.to(track, {
              x: () => -(track.scrollWidth - window.innerWidth + 48),
              ease: "none",
              scrollTrigger: { trigger: wrap, start: "top top", end: () => "+=" + (track.scrollWidth - window.innerWidth), pin: true, scrub: true, invalidateOnRefresh: true },
            });
          }
          gsap.fromTo("[data-c-art]", { clipPath: "inset(12% 18% 12% 18% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: "[data-c-art]", start: "top 85%", end: "top 15%", scrub: true } });
        }
      }, root);
      revert = () => ctx.revert();
    })();
    return () => {
      cancelled = true;
      revert();
    };
  }, [id]);

  return (
    <div ref={root} data-no-reveal className={`dir dir-${id}`}>
      {/* The real site header/footer are hidden here: each direction brings its own. */}
      <style>{`body > header, body > footer, body > a[href="#main"] { display: none !important; }`}</style>
      {id === "a" ? <DirA copy={copy} /> : id === "b" ? <DirB copy={copy} facilities={facilities} /> : <DirC copy={copy} facilities={facilities} />}
      <Switcher id={id} />
    </div>
  );
}

function Switcher({ id }: { id: Id }) {
  return (
    <nav aria-label="Redesign directions" className="dir-switch">
      <span className="dir-switch-label">Mockup</span>
      {(["a", "b", "c"] as Id[]).map((k) => (
        <Link key={k} href={`/en/directions/${k}`} aria-current={k === id ? "page" : undefined} className="dir-switch-btn">
          <span className="sm:hidden">{k.toUpperCase()}</span>
          <span className="hidden sm:inline">{LABELS[k]}</span>
        </Link>
      ))}
    </nav>
  );
}

/* ───────────── A · Art-led painted scroll ───────────── */
function DirA({ copy }: { copy: Copy }) {
  const cards = [
    { src: HERO, alt: copy.heroArt, label: "Radha and Krishna" },
    { src: "/art/temple-concept.jpg", alt: copy.templeArt, label: "The proposed temple" },
    { src: "/art/hanging-diya.jpg", alt: "A hanging brass diya", label: "Festivals of light" },
    { src: "/art/peacock-feather.jpg", alt: "A peacock feather", label: "Bhakti" },
  ];
  return (
    <>
      <header className="a-nav">
        <span className="a-brand">{copy.name}</span>
        <span className="a-links"><a>Temple</a><a>Master plan</a><a>Activities</a><a className="a-donate">Donate</a></span>
      </header>
      <section data-d-hero data-hero data-parallax className="a-hero">
        <div className="a-art-wrap" data-speed="0.15">
          {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
          <img data-a-art src={HERO} srcSet={`${HERO_SM} 1280w, ${HERO} 1920w`} sizes="100vw" alt={copy.heroArt} className="a-art" fetchPriority="high" />
        </div>
        <div className="a-veil" />
        <Embers className="absolute inset-0 z-10 h-full w-full" density={0.6} />
        <Petals />
        <div data-a-copy className="a-copy">
          <p data-d-in className="a-kicker">{copy.tagline}</p>
          <h1 data-d-in className="a-title">{copy.name}</h1>
          <p data-d-in className="a-sub">{copy.subhead}</p>
        </div>
        <div className="a-mist"><Mist className="h-full w-full" color="#f1dcc4" /></div>
      </section>

      <section data-parallax className="a-abode">
        <div className="a-abode-grid">
          <div>
            <h2 data-d-rise className="a-h2">{copy.aboutTitle}</h2>
            <p data-d-rise className="a-body">{copy.aboutBody}</p>
            <p data-d-rise className="a-brandline">{copy.brand}</p>
          </div>
          <figure data-speed="0.1" className="a-temple">
            {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
            <img src="/art/temple-concept.jpg" alt={copy.templeArt} loading="lazy" />
            <figcaption>Concept art · Proposed</figcaption>
          </figure>
        </div>
      </section>

      <section className="a-stack">
        <h2 data-d-rise className="a-h2 a-center">A painted journey</h2>
        <p data-d-rise className="a-body a-center">Stacking cards from the tested pack: each artwork slides over the last as you scroll.</p>
        <StackingCards cards={cards} ariaLabel="Artwork" stepHeight={60} />
      </section>

      <section data-parallax className="a-verse">
        <div data-speed="-0.25" className="a-feather">
          {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
          <img src="/art/peacock-feather.jpg" alt="" loading="lazy" />
        </div>
        <p data-d-rise lang="sa" className="a-sa">{copy.quoteSa}</p>
        <blockquote data-d-rise className="a-quote">“{copy.quote}”</blockquote>
        <p data-d-rise className="a-src">{copy.quoteSource}</p>
      </section>
    </>
  );
}

/* ───────────── B · Calm editorial temple ───────────── */
function DirB({ copy, facilities }: { copy: Copy; facilities: Facility[] }) {
  const faq = [
    { q: "Is the temple built yet?", a: "Not yet. The temple and every facility on its campus are proposed. Progress is published only after it has been verified." },
    { q: "How does giving work?", a: copy.donateIntro },
    { q: "Is any payment taken on this website?", a: copy.donateHow },
    { q: "Can I talk to someone?", a: copy.talk },
  ];
  return (
    <>
      <header className="b-nav">
        <span className="b-brand">{copy.name}</span>
        <span className="b-links"><a>Temple</a><a>Master plan</a><a>Activities</a><a>Gallery</a><a className="b-donate">Donate</a></span>
      </header>
      <section data-d-hero className="b-hero">
        <div className="b-hero-copy">
          <p data-d-in className="b-kicker">Jorhat, Assam · Proposed</p>
          <h1 data-d-in className="b-title">{copy.name}</h1>
          <p data-d-in className="b-sub">{copy.tagline}</p>
          <p data-d-in className="b-body">{copy.aboutBody}</p>
        </div>
        <figure data-d-in className="b-frame">
          {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
          <img src={HERO_SM} alt={copy.heroArt} fetchPriority="high" />
          <figcaption>Artwork, not a photograph of the temple&apos;s deities.</figcaption>
        </figure>
      </section>

      <section className="b-section">
        <div className="b-rule" aria-hidden><span /></div>
        <h2 data-d-rise className="b-h2">{copy.visionTitle}</h2>
        <p data-d-rise className="b-lede">{copy.visionBody}</p>
        <ol className="b-grid">
          {facilities.slice(0, 6).map((f) => (
            <li key={f.code} data-d-rise>
              <span className="b-code">{f.code}</span>
              <h3>{f.name}</h3>
              <p>{f.summary}</p>
              <span className="b-tag">Proposed</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="b-section b-faq-wrap">
        <h2 data-d-rise className="b-h2">Questions</h2>
        <p data-d-rise className="b-note">Accordion from the tested pack, with screen-reader labels added.</p>
        <Faq items={faq} />
      </section>

      <section className="b-quote">
        <p lang="sa" className="b-sa">{copy.quoteSa}</p>
        <blockquote data-d-rise>“{copy.quote}”</blockquote>
        <p className="b-src">{copy.quoteSource}</p>
      </section>
    </>
  );
}

/** Accordion: height animates with GSAP; native buttons with aria-expanded; open instantly with reduced motion. */
function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number>(-1);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const toggle = async (i: number) => {
    const next = open === i ? -1 : i;
    const { gsap } = await import("gsap");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panels.current.forEach((p, k) => {
      if (!p) return;
      const show = k === next;
      gsap.to(p, { height: show ? "auto" : 0, duration: reduce ? 0 : 0.7, ease: "expo.inOut", overwrite: true });
    });
    setOpen(next);
  };
  return (
    <div className="b-faq">
      {items.map((it, i) => (
        <div key={i} className="b-faq-item">
          <h3>
            <button type="button" aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => toggle(i)} className="b-faq-btn">
              <span>{it.q}</span>
              <svg aria-hidden viewBox="0 0 16 16" className={open === i ? "is-open" : ""}><path d="M8 1V15" /><path d="M1 8H15" /></svg>
            </button>
          </h3>
          <div id={`faq-${i}`} role="region" ref={(el) => { panels.current[i] = el; }} className="b-faq-panel" style={{ height: 0 }} hidden={false}>
            <p>{it.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────── C · Bold modern devotional ───────────── */
function DirC({ copy, facilities }: { copy: Copy; facilities: Facility[] }) {
  return (
    <>
      <header className="c-nav">
        <span className="c-brand">Prem Mandir</span>
        <span className="c-links"><a>Temple</a><a>Plan</a><a>Activities</a><a className="c-donate">Donate</a></span>
      </header>
      <section data-d-hero className="c-hero">
        {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
        <img src={HERO} srcSet={`${HERO_SM} 1280w, ${HERO} 1920w`} sizes="100vw" alt={copy.heroArt} className="c-hero-img" fetchPriority="high" />
        <div className="c-hero-shade" />
        <div className="c-hero-copy">
          <h1 data-d-in className="c-title">Divine love,<br /><em>eternal peace.</em></h1>
          <div data-d-in className="c-hero-row">
            <p>{copy.name}. A proposed temple campus in Jorhat, Assam.</p>
            <span className="c-cta">Explore the temple →</span>
          </div>
        </div>
      </section>

      <section className="c-marquee-wrap" aria-hidden>
        <p data-c-marquee className="c-marquee">Prem · Seva · Bhakti · Kirtan · Satsang · Prem · Seva · Bhakti</p>
      </section>

      <section className="c-split">
        <figure data-c-art className="c-split-art">
          {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
          <img src="/art/temple-concept.jpg" alt={copy.templeArt} loading="lazy" />
        </figure>
        <div className="c-split-copy">
          <span className="c-pill">Concept art · Proposed</span>
          <h2 data-d-rise>{copy.aboutTitle}</h2>
          <p data-d-rise>{copy.visionBody}</p>
        </div>
      </section>

      <section data-c-pin className="c-pin">
        <h2 className="c-pin-title">The proposed campus</h2>
        <div data-c-track className="c-track">
          {facilities.map((f) => (
            <article key={f.code} className="c-card">
              <span className="c-card-code">{f.code}</span>
              <h3>{f.name}</h3>
              <p>{f.summary}</p>
              <span className="c-pill">Proposed</span>
            </article>
          ))}
        </div>
      </section>

      <section className="c-fest">
        {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
        <img src="/art/hanging-diya.jpg" alt="" loading="lazy" className="c-fest-img" />
        <div>
          <h2 data-d-rise>{copy.festivalName}</h2>
          <p data-d-rise>{copy.festivalBody}</p>
        </div>
      </section>
    </>
  );
}
