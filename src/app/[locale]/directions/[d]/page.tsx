import type { Metadata } from "next";
import { getDictionary } from "@/i18n";
import { facilities } from "@/lib/content";
import { notFound } from "next/navigation";
import { Directions } from "@/components/directions/Directions";

const ids = ["a", "b", "c"] as const;
export function generateStaticParams() {
  return ids.map((d) => ({ d }));
}

export const metadata: Metadata = { title: "Redesign directions", robots: { index: false, follow: false } };

// Temporary page: three redesign directions side by side, for Rishav to pick from. English only.
export default async function DirectionsPage({ params }: { params: Promise<{ d: string }> }) {
  const { d: id } = await params;
  if (!ids.includes(id as (typeof ids)[number])) notFound();
  const d = getDictionary("en");
  const f = facilities.map((x) => ({ code: x.code, name: x.name.en, summary: x.summary.en }));
  return (
    <Directions
      id={id as "a" | "b" | "c"}
      copy={{
        name: d.meta.siteName,
        tagline: d.meta.tagline,
        subhead: d.home.subhead,
        brand: d.meta.brandMessage,
        aboutTitle: d.home.aboutTitle,
        aboutBody: d.home.aboutBody,
        visionTitle: d.home.visionTitle,
        visionBody: d.home.visionBody,
        heroArt: d.home.heroArt,
        templeArt: d.home.templeArt,
        quote: d.home.quote,
        quoteSa: d.home.quoteSanskrit,
        quoteSource: d.home.quoteSource,
        festivalName: d.home.festivalName,
        festivalBody: d.home.festivalBody,
        donateIntro: d.donate.intro,
        donateHow: d.donate.howEmail,
        talk: d.donate.talkBody,
      }}
      facilities={f}
    />
  );
}
