"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { href, type RouteKey } from "@/lib/routes";
import { BrandMark } from "./BrandMark";

const primary: RouteKey[] = ["temple", "masterPlan", "activities", "gallery", "contact"];
const all: RouteKey[] = [
  "home", "temple", "architecture", "masterPlan", "activities", "environment",
  "journey", "gallery", "location", "organisation", "contact", "donate",
];

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname() ?? `/${locale}`;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const isHome = pathname === `/${locale}`;
  const solid = scrolled || !isHome || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setLangOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // The last two words ("Prem Mandir", "প্ৰেম মন্দিৰ", "प्रेम मंदिर") are the name; the rest sits above it.
  const words = dict.meta.siteName.split(" ");
  const nameMain = words.slice(-2).join(" ");
  const nameTop = words.slice(0, -2).join(" ");

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
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-500 ease-out ${
          solid ? "bg-marble text-ink shadow-[0_1px_0_var(--line)]" : "bg-[linear-gradient(180deg,rgb(8_10_14/0.55),transparent)] text-forest-ink"
        }`}
      >
        <div className="container-x flex h-[72px] items-center gap-1 min-[360px]:gap-2 sm:gap-4">
          {/* Two-line lockup, so the name never gets cut off: "Shri Shri Radha-Krishna" small above "Prem Mandir". */}
          <Link href={href(locale, "home")} aria-label={dict.meta.siteName} className="flex min-h-[44px] min-w-0 items-center gap-2 no-underline sm:gap-2.5">
            <BrandMark size={34} className={`hidden shrink-0 min-[360px]:block ${solid ? "text-gold" : "text-gold-bright"}`} />
            <span aria-hidden className="flex min-w-0 flex-col leading-none">
              <span className={`truncate ${locale === "en" ? "text-[0.62rem] min-[375px]:text-[0.7rem] sm:text-[0.68rem] sm:uppercase sm:tracking-[0.14em]" : "text-xs"} ${solid ? "text-ink-soft" : "text-forest-soft"}`}>{nameTop}</span>
              <span className="mt-1 truncate font-display text-xl leading-none">{nameMain}</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 xl:flex">
            {primary.map((k) => (
              <Link
                key={k}
                href={href(locale, k)}
                aria-current={isActive(k) ? "page" : undefined}
                className="whitespace-nowrap rounded-full px-3 py-2 text-[0.95rem] no-underline transition-colors duration-200 hover:text-gold aria-[current=page]:text-gold"
              >
                {dict.nav[k]}
              </Link>
            ))}
          </nav>

          <Link
            href={href(locale, "donate")}
            aria-current={isActive("donate") ? "page" : undefined}
            className="ml-auto flex h-9 shrink-0 items-center whitespace-nowrap rounded-full bg-gold px-3 text-sm font-medium text-[#fffaf0] no-underline transition-[background-color,transform] duration-200 hover:bg-[#8f6620] active:translate-y-px sm:h-10 sm:px-4 xl:ml-3"
          >
            {dict.nav.donate}
          </Link>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-expanded={langOpen}
              aria-haspopup="true"
              aria-label={`${dict.nav.language}: ${localeNames[locale]}`}
              className="flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-full px-2 text-[0.95rem] transition-colors duration-200 hover:text-gold"
            >
              <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
              </svg>
              <span className="hidden xl:inline">{localeNames[locale]}</span>
            </button>
            {langOpen ? (
              <ul className="absolute right-0 top-[calc(100%+8px)] min-w-[160px] overflow-hidden rounded-sm border border-line bg-marble py-1 text-ink shadow-[0_12px_32px_-12px_rgb(42_33_24/0.3)]">
                {locales.map((l) => (
                  <li key={l}>
                    <Link
                      href={swap(l)}
                      hrefLang={l}
                      lang={l}
                      aria-current={l === locale ? "true" : undefined}
                      className="block px-4 py-2.5 no-underline transition-colors duration-150 hover:bg-marble-2 aria-[current=true]:text-gold"
                    >
                      {localeNames[l]}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <button
            ref={menuBtn}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="-mr-2 flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-full px-2 text-[0.95rem] transition-colors duration-200 hover:text-gold"
          >
            <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
            </svg>
            <span className="sr-only xl:not-sr-only">{open ? dict.nav.close : dict.nav.menu}</span>
          </button>
        </div>
      </header>

      <div
        id="site-menu"
        hidden={!open}
        className="on-dark fixed inset-0 z-40 overflow-y-auto pt-[72px]"
      >
        <nav aria-label="Site" className="container-x grid gap-x-12 py-10 md:grid-cols-2">
          {all.map((k) => (
            <Link
              key={k}
              href={href(locale, k)}
              aria-current={isActive(k) ? "page" : undefined}
              className="group flex items-baseline justify-between border-b border-[rgb(243_236_220/0.14)] py-4 font-display text-2xl no-underline transition-colors duration-200 hover:text-gold-bright aria-[current=page]:text-gold-bright sm:text-3xl"
            >
              {dict.nav[k]}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
