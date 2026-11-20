import { t, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import type { GalleryItem } from "./types";
import type { GalleryViewItem } from "@/components/Gallery";

export const toGalleryView = (items: GalleryItem[], locale: Locale): GalleryViewItem[] =>
  items.map((i) => ({
    id: i.id, category: i.category, title: t(i.title, locale), caption: t(i.caption, locale),
    media_type: i.media_type, url: i.url, photo: i.photo,
  }));

export const galleryStrings = (d: Dictionary) => ({
  all: d.gallery.all, close: d.gallery.close, prev: d.gallery.prev, next: d.gallery.next,
  play: d.gallery.play, pause: d.gallery.pause, zoom: d.gallery.zoom, video: d.gallery.video,
  empty: d.gallery.empty, placeholder: d.common.placeholder, credit: d.common.photoCredit,
});

export function formatDate(iso: string, locale: Locale, opts: Intl.DateTimeFormatOptions = { dateStyle: "long" }) {
  const tag = locale === "en" ? "en-IN" : locale === "as" ? "as-IN" : "hi-IN";
  return new Intl.DateTimeFormat(tag, { timeZone: "Asia/Kolkata", ...opts }).format(new Date(iso));
}
