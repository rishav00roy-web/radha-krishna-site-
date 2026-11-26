"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { href, type RouteKey } from "@/lib/routes";
import "./lotus-menu.css";

// Read down the first column, then the second: the temple first, then the project and the foundation.
const links: RouteKey[] = [
  "home", "temple", "architecture", "activities", "environment",
  "masterPlan", "journey", "gallery", "location", "organisation",
];

// The highlighted link: people who give land for the temple become its founding members.
const FOUNDING_ROUTE: RouteKey = "foundingMember";

/**
 * The whole site navigation: one lotus button at the bottom centre.
 * Tapping it pops a rounded panel up out of the lotus while the petals open.
 * On Home it waits until visitors have scrolled past the hero; a small language
 * switch sits in the top corner during the hero instead.
 */
export function LotusMenu({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname() ?? `/${locale}`;
  const isHome = pathname === `/${locale}`;
  const [open, setOpen] = useState(false);
  const [pastHero, setPastHero] = useState(!isHome);
  const [langOpen, setLangOpen] = useState(false);
  const lotusBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Show the lotus once the hero has mostly scrolled away (inner pages: always).
  useEffect(() => {
    if (!isHome) {
      setPastHero(true);
      return;
    }
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const onScroll = () => {
      const limit = hero ? hero.offsetHeight * 0.75 : window.innerHeight * 0.75;
      setPastHero(window.scrollY > limit);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

  useEffect(() => {
    setOpen(false);
    setLangOpen(false);
  }, [pathname]);

  // Scrolling back into the hero closes the panel with the lotus.
  useEffect(() => {
    if (!pastHero) setOpen(false);
  }, [pastHero]);

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) lotusBtn.current?.focus();
  }, []);

  // Esc closes; Tab stays inside the panel and the lotus while it is open.
  useEffect(() => {
    if (!open) return;
    const first = panel.current?.querySelector<HTMLElement>("a, button");
    first?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key !== "Tab" || !panel.current || !lotusBtn.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>("a, button"), lotusBtn.current];
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i === items.length - 1 ? 0 : i + 1);
      e.preventDefault();
      items[next].focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // The small corner language menu closes on Esc or a tap elsewhere.
  useEffect(() => {
    if (!langOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLangOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-lang-corner]")) setLangOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [langOpen]);

  const swap = (l: Locale) => pathname.replace(/^\/(en|as|hi)(?=\/|$)/, `/${l}`);
  const isActive = (k: RouteKey) => {
    const target = href(locale, k);
    return k === "home" ? pathname === target : pathname.startsWith(target);
  };

  return (
    <>
      <a href="#main" className="sr-only z-[60] rounded bg-marble px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {dict.nav.skip}
      </a>

      {/* Language switch in the corner, only while the Home hero is on screen. */}
      {isHome ? (
        <div data-lang-corner className="lm-corner" data-hidden={pastHero ? "" : undefined}>
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            aria-expanded={langOpen}
            aria-haspopup="true"
            aria-label={`${dict.nav.language}: ${localeNames[locale]}`}
            tabIndex={pastHero ? -1 : undefined}
            className="lm-corner-btn"
          >
            <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
            </svg>
            <span>{localeNames[locale]}</span>
          </button>
          {langOpen ? (
            <ul className="lm-corner-list">
              {locales.map((l) => (
                <li key={l}>
                  <Link href={swap(l)} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined}>
                    {localeNames[l]}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {/* A clear layer behind the panel: tapping anywhere outside closes it. */}
      <div className="lm-scrim" data-open={open ? "" : undefined} onClick={() => close(false)} aria-hidden />

      <div className="lm-dock" data-shown={pastHero ? "" : undefined} data-open={open ? "" : undefined}>
        <div
          ref={panel}
          id="lotus-menu"
          role="dialog"
          aria-modal="true"
          aria-label={dict.nav.menu}
          className="lm-panel"
          inert={!open}
        >
          <svg aria-hidden viewBox="0 0 48 20" className="lm-crest">
            <path d="M24 17c-2.6-2.2-3.7-5.4-3-9.6 1.9.7 3 2.2 3 4 0-1.8 1.1-3.3 3-4 .7 4.2-.4 7.4-3 9.6z" />
            <path d="M24 17c-5 0-8.6-2.4-10-6.6 3-.3 6 .8 7.8 3.2M24 17c5 0 8.6-2.4 10-6.6-3-.3-6 .8-7.8 3.2" />
            <path d="M2 18h14M32 18h14" strokeOpacity="0.5" />
          </svg>

          <Link href={href(locale, FOUNDING_ROUTE)} className="lm-founding">
            <span>{dict.nav.founding}</span>
            <svg aria-hidden viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
            </svg>
          </Link>

          <nav aria-label="Site">
            <ul className="lm-links">
              {links.map((k) => (
                <li key={k}>
                  <Link href={href(locale, k)} aria-current={isActive(k) ? "page" : undefined}>
                    {dict.nav[k]}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="lm-actions">
              <Link href={href(locale, "donate")} aria-current={isActive("donate") ? "page" : undefined}>{dict.nav.donate}</Link>
              <Link href={href(locale, "contact")} aria-current={isActive("contact") ? "page" : undefined}>{dict.nav.contact}</Link>
            </div>
          </nav>

          <div className="lm-langs" role="group" aria-label={dict.nav.language}>
            {locales.map((l) => (
              <Link key={l} href={swap(l)} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined}>
                {localeNames[l]}
              </Link>
            ))}
          </div>
        </div>

        <button
          ref={lotusBtn}
          type="button"
          className="lm-lotus"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="lotus-menu"
          aria-label={open ? dict.nav.close : dict.nav.menu}
          tabIndex={pastHero ? undefined : -1}
          aria-hidden={pastHero ? undefined : true}
        >
          <svg aria-hidden viewBox="0 0 64 48" className="lm-flower">
            <defs>
              <linearGradient id="lm-petal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fbe3e8" />
                <stop offset="0.55" stopColor="#ee9fb1" />
                <stop offset="1" stopColor="#c95f7a" />
              </linearGradient>
              <linearGradient id="lm-petal-back" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f6c6d2" />
                <stop offset="1" stopColor="#b14f6b" />
              </linearGradient>
            </defs>
            {/* Outer petals swing out most, inner ones a little, the centre one lifts. */}
            <path className="lm-p lm-p-ol" d="M32 42C22 41 10 36 4 26c9-2 20 3 28 16z" fill="url(#lm-petal-back)" />
            <path className="lm-p lm-p-or" d="M32 42c10-1 22-6 28-16-9-2-20 3-28 16z" fill="url(#lm-petal-back)" />
            <path className="lm-p lm-p-il" d="M32 42C24 38 16 28 16 15c9 4 15 14 16 27z" fill="url(#lm-petal)" />
            <path className="lm-p lm-p-ir" d="M32 42c8-4 16-14 16-27-9 4-15 14-16 27z" fill="url(#lm-petal)" />
            <path className="lm-p lm-p-c" d="M32 42c-6-6-8-15-8-22 0-6 3-12 8-16 5 4 8 10 8 16 0 7-2 16-8 22z" fill="url(#lm-petal)" />
            <path d="M19 43.5c4 1.6 8.3 2.5 13 2.5s9-.9 13-2.5" fill="none" stroke="#5e8a4f" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </>
  );
}
