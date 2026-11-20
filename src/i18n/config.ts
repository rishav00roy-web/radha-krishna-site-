export const locales = ["en", "as", "hi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  as: "অসমীয়া",
  hi: "हिन्दी",
};

export const htmlLang: Record<Locale, string> = { en: "en-IN", as: "as-IN", hi: "hi-IN" };

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** A string stored in all three site languages. */
export type Localized = { en: string; as: string; hi: string };

/** Pick the right language, falling back to English when a translation is missing. */
export function t(value: Partial<Localized> | null | undefined, locale: Locale): string {
  if (!value) return "";
  return (value[locale] && value[locale]!.trim()) || value.en || "";
}
