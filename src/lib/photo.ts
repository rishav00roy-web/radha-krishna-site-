import type { Photo } from "./types";

/** Unsplash serves resized images through URL params, so no image optimiser is needed. */
export const photoSrc = (p: Photo, w: number) =>
  `https://images.unsplash.com/${p.id}?auto=format&fit=crop&w=${w}&q=80`;

export const photoSrcSet = (p: Photo, widths = [480, 800, 1200, 1600]) =>
  widths.map((w) => `${photoSrc(p, w)} ${w}w`).join(", ");

const utm = "utm_source=prem_mandir_website&utm_medium=referral";
export const photographerUrl = (p: Photo) => `https://unsplash.com/@${p.credit.username}?${utm}`;
export const unsplashUrl = `https://unsplash.com/?${utm}`;

/** The photo fields a JourneyTimeline stage takes: sized sources, localized alt text and the credit links. */
export const stagePhoto = (p: Photo, alt: string) => ({
  src: photoSrc(p, 800),
  srcSet: photoSrcSet(p, [480, 800, 1100]),
  alt,
  credit: p.credit.name,
  creditHref: photographerUrl(p),
  siteHref: unsplashUrl,
});
