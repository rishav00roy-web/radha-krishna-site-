import {
  Cormorant_Garamond, Manrope, Noto_Serif_Bengali, Noto_Sans_Bengali, Noto_Serif_Devanagari, Mukta,
} from "next/font/google";
import type { Locale } from "@/i18n/config";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-display", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serifBn = Noto_Serif_Bengali({ subsets: ["bengali", "latin"], weight: ["400", "500", "600"], variable: "--font-display", display: "swap" });
const sansBn = Noto_Sans_Bengali({ subsets: ["bengali", "latin"], variable: "--font-sans", display: "swap" });
const serifDeva = Noto_Serif_Devanagari({ subsets: ["devanagari", "latin"], weight: ["400", "500", "600"], variable: "--font-display", display: "swap" });
const mukta = Mukta({ subsets: ["devanagari", "latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });

// Sanskrit verse on the homepage, in every locale. Loaded lazily (no preload).
const sanskrit = Noto_Serif_Devanagari({ subsets: ["devanagari"], weight: ["400"], variable: "--font-sanskrit", display: "swap", preload: false });

export const fontClasses: Record<Locale, string> = {
  en: `${cormorant.variable} ${manrope.variable} ${sanskrit.variable}`,
  as: `${serifBn.variable} ${sansBn.variable} ${sanskrit.variable}`,
  hi: `${serifDeva.variable} ${mukta.variable} ${sanskrit.variable}`,
};
