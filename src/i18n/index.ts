import "server-only";
import type { Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { as } from "./dictionaries/as";
import { hi } from "./dictionaries/hi";

const dictionaries: Record<Locale, Dictionary> = { en, as, hi };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}
export type { Dictionary };
