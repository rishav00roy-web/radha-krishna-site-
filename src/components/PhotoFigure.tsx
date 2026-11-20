import { t, type Locale } from "@/i18n/config";
import type { Photo } from "@/lib/types";
import { photoSrc, photoSrcSet, photographerUrl, unsplashUrl } from "@/lib/photo";

/** `template` is the dictionary's photoCredit string, with {name} and {site} slots. */
export function PhotoCredit({ photo, template, dark = false }: { photo: Photo; template: string; dark?: boolean }) {
  const link = dark ? "text-forest-ink underline hover:text-gold-bright" : "text-ink underline hover:text-gold";
  return (
    <>
      {template.split(/(\{name\}|\{site\})/).map((part, i) =>
        part === "{name}" ? (
          <a key={i} href={photographerUrl(photo)} target="_blank" rel="noopener noreferrer" className={link}>{photo.credit.name}</a>
        ) : part === "{site}" ? (
          <a key={i} href={unsplashUrl} target="_blank" rel="noopener noreferrer" className={link}>Unsplash</a>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** An illustrative photo with its caption. The photo is never presented as this temple. */
export function PhotoFigure({
  photo,
  locale,
  credit,
  sizes = "100vw",
  aspect = "aspect-[4/3]",
  className = "",
  dark = false,
  "data-reveal": reveal,
}: {
  "data-reveal"?: boolean;
  photo: Photo;
  locale: Locale;
  credit: string;
  sizes?: string;
  aspect?: string;
  className?: string;
  dark?: boolean;
}) {
  return (
    <figure className={className} data-reveal={reveal ? "" : undefined}>
      <div className={`${aspect} overflow-hidden rounded bg-marble-2`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Unsplash serves pre-sized images */}
        <img
          src={photoSrc(photo, 1200)}
          srcSet={photoSrcSet(photo)}
          sizes={sizes}
          alt={t(photo.alt, locale)}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <figcaption className={`mt-2.5 text-sm ${dark ? "text-forest-soft" : "text-ink-soft"}`}>
        <PhotoCredit photo={photo} template={credit} dark={dark} />
      </figcaption>
    </figure>
  );
}
