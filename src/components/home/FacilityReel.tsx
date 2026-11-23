import Link from "next/link";
import { t, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import type { Facility } from "@/lib/types";
import { href } from "@/lib/routes";
import { StatusTag } from "@/components/ProposedTag";
import { Embers } from "@/components/Embers";

/** Painted concept art per facility (public/art/facilities). Artwork, never photos of the site. */
const art: Record<string, string> = {
  "main-temple": "/art/facilities/main-temple.jpg",
  gaushala: "/art/facilities/gaushala.jpg",
  "amrit-sarovar": "/art/facilities/amrit-sarovar.jpg",
  "bamboo-garden": "/art/facilities/bamboo-garden.jpg",
  "medicinal-garden": "/art/facilities/medicinal-garden.jpg",
  "fruit-forest": "/art/facilities/fruit-forest.jpg",
  "meditation-centre": "/art/facilities/meditation-centre.jpg",
  "cultural-space": "/art/facilities/cultural-space.jpg",
};

/**
 * The eight proposed facilities as a reel of painted scenes. On desktop the section pins and the
 * reel slides sideways as you scroll (Motion handles [data-hscroll]); on phones it is a swipe row.
 */
export function FacilityReel({ facilities, locale, d }: { facilities: Facility[]; locale: Locale; d: Dictionary }) {
  return (
    <section data-hscroll data-no-reveal className="on-dark relative isolate overflow-hidden bg-[linear-gradient(180deg,#22262c_0%,#141b24_30%,#10161d_100%)] text-forest-ink">
      <Embers className="absolute inset-0 h-full w-full opacity-70" density={0.5} />
      <div className="flex min-h-[100svh] flex-col justify-center py-16 md:py-20">
        <div className="container-x grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
          <h2 data-reveal className="display-lg max-w-[16ch]">{d.home.campusTitle}</h2>
          <p data-reveal className="lede measure !text-forest-soft">{d.home.campusBody}</p>
        </div>
        <ol
          data-hscroll-track
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter,1.25rem)] pb-4 [scrollbar-width:none] md:mt-14 md:gap-7 md:overflow-visible md:px-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] md:pb-0"
        >
          {facilities.map((f) => (
            <li key={f.id} className="w-[82vw] max-w-[440px] shrink-0 snap-center md:w-[min(34vw,460px)]">
              <Link href={`${href(locale, "masterPlan")}#${f.slug}`} className="group block text-forest-ink no-underline">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-night shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
                  <img
                    src={art[f.slug]}
                    alt=""
                    width={614}
                    height={768}
                    loading="lazy"
                    decoding="async"
                    data-reel-art
                    className="h-full w-full scale-[1.12] object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.18]"
                  />
                  <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_14_19/0.35)_0%,transparent_30%,transparent_45%,rgb(10_14_19/0.92)_100%)]" />
                  <span className="absolute left-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-gold-bright/60 bg-night/40 font-display text-xl text-gold-bright backdrop-blur-sm">{f.code}</span>
                  <span className="absolute right-5 top-5"><StatusTag status={f.status} dict={d} /></span>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-[1.9rem] leading-tight transition-colors duration-300 group-hover:text-gold-pale">{t(f.name, locale)}</h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-forest-soft">{t(f.summary, locale)}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          <li aria-hidden className="w-px shrink-0 md:w-[8vw]" />
        </ol>
        <div className="container-x mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-forest-soft">{d.common.conceptArt}</p>
          <Link href={href(locale, "masterPlan")} className="btn btn-quiet">{d.home.ctaPlan}</Link>
        </div>
      </div>
    </section>
  );
}
