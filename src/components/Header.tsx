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
          solid ? "bg-marble text-ink shadow-[0_1px_0_var(--line)]" : "bg-transparent text-forest-ink"
        }`}
      >
        <div className="container-x flex h-[72px] items-center gap-6">
          <Link href={href(locale, "home")} className="flex min-w-0 items-center gap-3 no-underline">
            <BrandMark size={38} className={solid ? "text-gold" : "text-gold-bright"} />
            <span className="truncate font-display text-lg leading-tight sm:text-xl">{dict.meta.siteName}</span>
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
            className="ml-auto flex min-h-[40px] shrink-0 items-center whitespace-nowrap rounded-full bg-gold px-3 text-sm text-[#fffaf0] no-underline transition-colors duration-200 hover:bg-[#8f6620] sm:min-h-[44px] sm:px-4 sm:text-[0.95rem] xl:ml-2"
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
              className="flex min-h-[40px] min-w-[40px] items-center justify-center gap-2 rounded-full border border-current px-2.5 text-[0.95rem] transition-colors duration-200 hover:text-gold sm:min-h-[44px] sm:px-3"
            >
              <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
              </svg>
              <span className="hidden sm:inline">{localeNames[locale]}</span>
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
            className="flex min-h-[44px] items-center gap-2 rounded-full px-2 text-[0.95rem] transition-colors duration-200 hover:text-gold"
          >
            <svg aria-hidden viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
            <span className="hidden sm:inline">{open ? dict.nav.close : dict.nav.menu}</span>
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
