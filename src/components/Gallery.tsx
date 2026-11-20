"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Placeholder } from "./Placeholder";
import { PhotoCredit } from "./PhotoFigure";
import { photoSrc, photoSrcSet } from "@/lib/photo";
import type { GalleryCategory, IconKey, Photo } from "@/lib/types";

export type GalleryViewItem = {
  id: string;
  category: GalleryCategory;
  title: string;
  caption: string;
  media_type: "image" | "video";
  url: string | null;
  photo: Photo | null;
};

export const categoryIcon: Record<GalleryCategory, IconKey> = {
  architecture: "temple", art: "flute", worship: "diya", masterplan: "kalash", sarovar: "water", gaushala: "cow",
  bamboo: "bamboo", medicinal: "herb", fruit: "fruit", updates: "book",
};

type Strings = {
  all: string; close: string; prev: string; next: string; play: string; pause: string;
  zoom: string; video: string; empty: string; placeholder: string; credit: string;
};

function youtubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m?.[1] ?? null;
}

export function Gallery({
  items,
  categories,
  strings,
  showFilters = true,
}: {
  items: GalleryViewItem[];
  categories: Record<GalleryCategory, string>;
  strings: Strings;
  showFilters?: boolean;
}) {
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const used = useMemo(() => (Object.keys(categories) as GalleryCategory[]).filter((c) => items.some((i) => i.category === c)), [categories, items]);
  const visible = useMemo(() => (filter === "all" ? items : items.filter((i) => i.category === filter)), [filter, items]);
  const current = index === null ? null : visible[index];

  const close = useCallback(() => {
    setIndex(null);
    setPlaying(false);
    setZoomed(false);
    lastFocus.current?.focus();
  }, []);
  const step = useCallback(
    (dir: 1 | -1) => {
      setZoomed(false);
      setIndex((i) => (i === null ? i : (i + dir + visible.length) % visible.length));
    },
    [visible.length],
  );

  useEffect(() => {
    if (index === null) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, step]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => step(1), 4500);
    return () => window.clearInterval(id);
  }, [playing, step]);

  return (
    <div>
      {showFilters && used.length > 1 ? (
        <div role="toolbar" aria-label="Filter" className="mb-10 flex flex-wrap gap-2">
          {(["all", ...used] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className="min-h-[40px] rounded-full border border-line px-4 text-[0.95rem] transition-colors duration-200 hover:border-gold aria-pressed:border-gold aria-pressed:bg-gold aria-pressed:text-[#fffaf0]"
            >
              {c === "all" ? strings.all : categories[c]}
            </button>
          ))}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="text-ink-soft">{strings.empty}</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4 md:gap-6">
          {visible.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={(e) => {
                  lastFocus.current = e.currentTarget;
                  setIndex(i);
                }}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded text-left"
                aria-label={`${item.title}${item.media_type === "video" ? ` (${strings.video})` : ""}`}
              >
                {item.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Unsplash serves pre-sized images
                  <img
                    src={photoSrc(item.photo, 800)}
                    srcSet={photoSrcSet(item.photo, [400, 600, 800, 1200])}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                ) : (
                  <Placeholder icon={categoryIcon[item.category]} label={item.title} note={strings.placeholder} />
                )}
                {item.media_type === "video" ? (
                  <span className="absolute left-4 top-4 rounded-full bg-forest px-3 py-1 text-sm text-forest-ink">{strings.video}</span>
                ) : null}
                <span className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgb(13_36_28/0.85),transparent)] p-4 pt-10 text-forest-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {item.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {current ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          tabIndex={-1}
          className="fixed inset-0 z-[70] flex flex-col bg-[rgb(10_22_16/0.96)] text-forest-ink outline-none"
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
            <p className="tabular text-sm text-forest-soft">
              {index! + 1} / {visible.length}
            </p>
            <div className="flex items-center gap-2">
              {current.media_type === "image" && current.photo ? (
                <button type="button" onClick={() => setZoomed((z) => !z)} aria-pressed={zoomed} className="btn btn-quiet !min-h-[40px] !py-1.5">
                  {strings.zoom}
                </button>
              ) : null}
              {visible.length > 1 ? (
                <button type="button" onClick={() => setPlaying((p) => !p)} className="btn btn-quiet !min-h-[40px] !py-1.5">
                  {playing ? strings.pause : strings.play}
                </button>
              ) : null}
              <button type="button" onClick={close} className="btn btn-quiet !min-h-[40px] !py-1.5">
                {strings.close}
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
            <figure className={`relative h-full w-full max-w-6xl ${zoomed ? "overflow-auto" : "overflow-hidden"}`}>
              {current.media_type === "video" && current.url ? (
                youtubeId(current.url) ? (
                  <iframe
                    className="absolute inset-0 m-auto aspect-video w-full max-h-full"
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId(current.url)}`}
                    title={current.title}
                    allow="accelerometer; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video className="absolute inset-0 m-auto max-h-full w-full" src={current.url} controls playsInline poster={current.photo ? photoSrc(current.photo, 1600) : undefined} />
                )
              ) : !current.photo ? (
                <div className="absolute inset-0 m-auto aspect-[4/3] max-h-full max-w-full overflow-hidden rounded">
                  <Placeholder dark icon={categoryIcon[current.category]} label={current.title} note={strings.placeholder} />
                </div>
              ) : (
                <div
                  className={`relative h-full w-full transition-transform duration-500 ease-out ${zoomed ? "scale-[1.8] cursor-zoom-out" : "cursor-zoom-in"}`}
                  onClick={() => setZoomed((z) => !z)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- Unsplash serves pre-sized images */}
                  <img
                    src={photoSrc(current.photo, 1600)}
                    srcSet={photoSrcSet(current.photo, [800, 1200, 1600, 2400])}
                    sizes="100vw"
                    alt={current.title}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </div>
              )}
            </figure>
            {visible.length > 1 ? (
              <>
                <button type="button" onClick={() => step(-1)} aria-label={strings.prev} className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[rgb(243_236_220/0.3)] transition-colors duration-200 hover:bg-[rgb(243_236_220/0.12)] md:left-6">
                  <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M15 5l-7 7 7 7" /></svg>
                </button>
                <button type="button" onClick={() => step(1)} aria-label={strings.next} className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[rgb(243_236_220/0.3)] transition-colors duration-200 hover:bg-[rgb(243_236_220/0.12)] md:right-6">
                  <svg aria-hidden viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            ) : null}
          </div>
          <div className="px-4 pb-6 pt-3 text-center md:px-8">
            <p className="font-display text-xl">{current.title}</p>
            {current.caption ? <p className="mt-1 text-forest-soft">{current.caption}</p> : null}
            <p className="mt-1 text-sm text-forest-soft">
              {categories[current.category]}
              {current.photo ? <> · <PhotoCredit photo={current.photo} template={strings.credit} dark /></> : null}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
