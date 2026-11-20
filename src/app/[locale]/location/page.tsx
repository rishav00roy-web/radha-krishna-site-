import type { Metadata } from "next";
import { isLocale, t, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getLocation } from "@/lib/data";
import { PageIntro } from "@/components/PageIntro";
import { Birds } from "@/components/home/art";
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
          <div className="relative aspect-[4/3] overflow-hidden rounded border border-line bg-[linear-gradient(180deg,#f4e6d2_0%,var(--marble-2)_100%)]">
            {hasCoords ? (
              <iframe
                title={d.location.title}
                className="h-full w-full"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${loc.lat},${loc.lng}`}
              />
            ) : (
              <div className="relative flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                {/* A quiet illustrated landscape: river, fields and a distant tree line. Not a map. */}
                <svg aria-hidden viewBox="0 0 800 600" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
                  <path d="M0 420 C160 390 300 400 420 415 S660 395 800 405 V600 H0Z" fill="#e6d6bd" />
                  <path d="M0 470 C200 440 360 455 520 470 S700 455 800 460 V600 H0Z" fill="#dcc9a9" />
                  <path d="M-20 600 C120 540 260 520 380 500 S620 470 820 440" stroke="#b9cfc9" strokeWidth="26" fill="none" strokeLinecap="round" opacity="0.8" />
                  <path d="M0 405 Q40 370 80 400 Q120 360 170 398 Q220 372 260 402 Q300 380 330 404 L330 420 L0 420Z" fill="#c9b893" opacity="0.7" />
                  <path d="M520 400 Q560 366 600 398 Q650 360 700 396 Q740 372 800 394 L800 420 L520 420Z" fill="#c9b893" opacity="0.7" />
                </svg>
                <Birds />
                <span className="relative grid h-20 w-20 place-items-center rounded-full border border-gold bg-[rgb(251_248_242/0.8)]">
                  <Icon name="temple" size={44} className="text-gold" />
                </span>
                <p className="relative max-w-[34ch] rounded bg-[rgb(251_248_242/0.8)] px-4 py-2 text-lg text-ink-soft">{d.location.mapPending}</p>
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
