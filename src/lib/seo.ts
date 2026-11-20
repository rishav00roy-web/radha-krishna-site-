import type { Metadata } from "next";
import { locales, type Locale, htmlLang } from "@/i18n/config";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Per-page metadata with canonical + hreflang alternates for all three languages. */
export function pageMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const languages = Object.fromEntries(locales.map((l) => [htmlLang[l], `${siteUrl}/${l}${path}`]));
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/${locale}${path}`, languages: { ...languages, "x-default": `${siteUrl}/en${path}` } },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}${path}`,
      locale: htmlLang[locale].replace("-", "_"),
      type: "website",
    },
  };
}
