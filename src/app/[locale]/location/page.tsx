import type { Metadata } from "next";
import { isLocale, t, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getLocation } from "@/lib/data";
import { PageIntro } from "@/components/PageIntro";
import { Icon } from "@/components/Icon";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/location", d.location.title, d.location.intro);
}

export default async function LocationPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  const loc = getLocation();
  const hasCoords = typeof loc.lat === "number" && typeof loc.lng === "number";
  const bbox = hasCoords ? [loc.lng! - 0.02, loc.lat! - 0.012, loc.lng! + 0.02, loc.lat! + 0.012].join(",") : "";

  return (
    <>
      <PageIntro title={d.location.title} intro={d.location.intro} icon="temple" />
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="aspect-[4/3] overflow-hidden rounded border border-line bg-marble-2">
            {hasCoords ? (
              <iframe
                title={d.location.title}
                className="h-full w-full"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${loc.lat},${loc.lng}`}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <Icon name="lotus" size={56} className="text-gold" />
                <p className="max-w-[36ch] text-lg text-ink-soft">{d.location.mapPending}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-ink-soft">{d.common.location}</p>
            <p className="font-display text-3xl leading-tight">{d.common.locationValue}</p>
            {hasCoords ? (
              <a className="mt-4 inline-block text-gold underline" href={`https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=15/${loc.lat}/${loc.lng}`} target="_blank" rel="noopener noreferrer">
                {d.location.openMap}
              </a>
            ) : null}

            {loc.directions && t(loc.directions, locale) ? (
              <div className="mt-10">
                <h2 className="text-2xl">{d.location.directionsTitle}</h2>
                <p className="mt-2 whitespace-pre-line text-ink-soft">{t(loc.directions, locale)}</p>
              </div>
            ) : null}
            {loc.landmarks.length > 0 ? (
              <div className="mt-10">
                <h2 className="text-2xl">{d.location.landmarksTitle}</h2>
                <ul className="mt-2 list-disc pl-5 text-ink-soft">
                  {loc.landmarks.map((l, i) => <li key={i}>{t(l, locale)}</li>)}
                </ul>
              </div>
            ) : null}
            {!loc.directions && loc.landmarks.length === 0 ? (
              <p className="mt-10 rounded border border-dashed border-marble-3 p-5 text-ink-soft">{d.location.pendingNote}</p>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
