import {
  Cormorant_Garamond, Figtree, Noto_Serif_Bengali, Noto_Sans_Bengali, Noto_Serif_Devanagari, Mukta,
} from "next/font/google";
import type { Locale } from "@/i18n/config";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-display", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serifBn = Noto_Serif_Bengali({ subsets: ["bengali", "latin"], weight: ["400", "500", "600"], variable: "--font-display", display: "swap" });
const sansBn = Noto_Sans_Bengali({ subsets: ["bengali", "latin"], variable: "--font-sans", display: "swap" });
const serifDeva = Noto_Serif_Devanagari({ subsets: ["devanagari", "latin"], weight: ["400", "500", "600"], variable: "--font-display", display: "swap" });
const mukta = Mukta({ subsets: ["devanagari", "latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });

export const fontClasses: Record<Locale, string> = {
  en: `${cormorant.variable} ${figtree.variable}`,
  as: `${serifBn.variable} ${sansBn.variable}`,
  hi: `${serifDeva.variable} ${mukta.variable}`,
};
