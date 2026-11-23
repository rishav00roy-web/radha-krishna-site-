import Link from "next/link";
import type { Metadata } from "next";
import { isLocale, t, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getEvents, getMilestones } from "@/lib/data";
import { formatDate } from "@/lib/view";
import { href } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { Petals } from "@/components/Petals";
import { Icon } from "@/components/Icon";
import { Hill, Leaves, Mist, Ornament, Rays } from "@/components/home/art";
import { Embers } from "@/components/Embers";
import { RiverLamps } from "@/components/home/RiverLamps";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "", `${d.meta.siteName} | ${d.meta.tagline}`, d.meta.description);
}

export default async function Home({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const d = getDictionary(locale);
  const milestones = getMilestones();

  const next = getEvents().find((e) => new Date(e.ends_at ?? e.starts_at).getTime() >= Date.now());
  const h = d.home;

  return (
    <>
      {/* 1. Night hero: Radha-Krishna artwork, light rays, foreground leaves, mist */}
      <section data-hero data-parallax className="relative isolate overflow-hidden bg-night text-forest-ink">
        <div className="relative min-h-[100svh]">
          {/* Painted artwork. Right-aligned on wide screens, top band on phones. */}
          <div data-speed="0.18" data-depth="0.6" className="absolute inset-x-0 top-0 h-[68svh] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[min(100%,calc(100svh*1.18))]">
            {/* eslint-disable-next-line @next/next/no-img-element -- local art, no optimiser needed */}
            <img
              src="/art/hero-radha-krishna.jpg"
              alt={h.heroArt}
              width={1704}
              height={1440}
              fetchPriority="high"
              data-hero-art
              className="h-full w-full object-cover object-[72%_18%] lg:object-[100%_0%]"
              style={{ maskImage: "linear-gradient(90deg, transparent 0%, #000 22%), linear-gradient(0deg, transparent 0%, #000 30%)", maskComposite: "intersect", WebkitMaskComposite: "source-in" }}
            />
          </div>
          <Rays className="pointer-events-none absolute inset-0 h-full w-full opacity-80" />
          <Embers className="absolute inset-0 z-10 h-full w-full" density={0.5} />
          <div data-speed="-0.25" data-depth="-1.4" className="pointer-events-none absolute -left-10 -top-6 w-[62vw] max-w-[620px] lg:w-[42vw]">
            <Leaves blur className="h-auto w-full opacity-90" />
          </div>
          <Petals />

          {/* Copy */}
          <div data-speed="-0.35" data-hero-copy className="container-x relative z-30 flex min-h-[100svh] flex-col justify-end pb-[24svh] pt-[50svh] lg:justify-center lg:pb-[22svh] lg:pt-28">
            <div className="max-w-[30rem] text-center lg:ml-[4%]">
              <Ornament className="mb-6" />
              <h1 data-hero-line className="display-xl text-balance drop-shadow-[0_2px_18px_rgb(0_0_0/0.45)]">{h.headline.replace("-", "\u2011")}</h1>
              <p data-hero-line className="mx-auto mt-5 max-w-[26ch] font-display text-2xl italic leading-snug text-gold-pale">{d.meta.tagline}</p>
              <p data-hero-line className="mx-auto mt-3 max-w-[34ch] text-forest-soft">{h.subhead}</p>
              <nav data-hero-line aria-label={h.headline} className="mt-8 flex flex-wrap justify-center gap-2.5">
                <Link href={href(locale, "temple")} className="btn btn-primary !min-h-[44px] !px-5 !py-2 text-[0.95rem]">{h.ctaExplore}</Link>
                <Link href="#vision" className="btn btn-quiet !min-h-[44px] !px-5 !py-2 text-[0.95rem]">{h.ctaVision}</Link>
                <Link href={href(locale, "masterPlan")} className="btn btn-quiet !min-h-[44px] !px-5 !py-2 text-[0.95rem]">{h.ctaPlan}</Link>
                <Link href={href(locale, "activities")} className="btn btn-quiet !min-h-[44px] !px-5 !py-2 text-[0.95rem]">{h.ctaActivities}</Link>
              </nav>
              <a data-hero-line href="#vision" className="mx-auto mt-8 flex w-max flex-col items-center gap-3 text-sm text-forest-soft no-underline hover:text-gold-pale">
                <span aria-hidden className="h-10 w-px bg-[linear-gradient(transparent,currentColor)]" />
                {h.scroll}
                <span aria-hidden className="grid h-8 w-5 justify-center rounded-full border border-current pt-1.5">
                  <span className="scroll-wheel block h-1.5 w-0.5 rounded-full bg-current" />
                </span>
              </a>
            </div>
          </div>
        </div>
        {/* Mist melts the night into the cream section below. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[26svh]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgb(241_220_196/0.55)_55%,var(--mist)_100%)]" />
          <Mist className="absolute inset-x-0 bottom-0 h-full w-full" />
        </div>
        <p className="absolute bottom-[22svh] left-4 right-4 z-30 text-right text-[0.7rem] leading-snug text-forest-soft/80 md:text-xs">{h.heroArt}</p>
      </section>

      {/* 2. About the temple: concept temple among trees */}
      {/* Pulled up under the hero's mist, so the night melts straight into this scene with no seam. */}
      <section id="vision" data-parallax className="relative isolate z-10 -mt-[20svh] scroll-mt-20 overflow-hidden bg-[linear-gradient(180deg,transparent_0%,var(--mist)_20svh,#ead2b6_100%)] pb-0">
        <div className="container-x relative grid items-end gap-10 pt-[6svh] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:pt-[7svh]">
          <div className="pb-10 md:pb-48">
            <p data-reveal className="flex items-center gap-3 font-display text-xl text-gold">
              <span aria-hidden className="h-px w-10 bg-gold" />
              {h.aboutLabel}
            </p>
            <h2 data-reveal className="display-lg mt-4">{h.aboutTitle}</h2>
            <p data-reveal className="lede measure mt-6 !text-ink-soft">{h.aboutBody}</p>
            <p data-reveal className="mt-4 font-display text-2xl text-gold">{d.meta.brandMessage}</p>
            <Link data-reveal href={href(locale, "temple")} className="group mt-8 inline-flex items-center gap-3 border-b border-gold pb-1 font-display text-xl text-ink no-underline">
              {d.common.learnMore}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">⟶</span>
            </Link>
          </div>
          <figure className="relative -mr-[var(--gutter,1rem)] translate-y-10 md:-mr-10 md:translate-y-24">
            <div data-speed="0.08" className="relative ml-auto w-full max-w-[640px]">
              <span aria-hidden className="sun-glow absolute left-1/2 top-[18%] h-[70%] w-[80%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_226_170/0.75),rgb(255_210_150/0.25)_55%,transparent)]" />
              {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
              <img
                src="/art/temple-concept.jpg"
                alt={h.templeArt}
                width={984}
                height={1040}
                loading="lazy"
                className="relative h-auto w-full"
                style={{
                  maskImage: "linear-gradient(90deg, transparent 0%, #000 34%, #000 74%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 26%)",
                  maskComposite: "intersect",
                  WebkitMaskComposite: "source-in",
                }}
              />
              {/* Trees darken into the hill below. */}
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-[linear-gradient(180deg,transparent,#141b24)]" style={{ maskImage: "linear-gradient(90deg, transparent 0%, #000 22%, #000 80%, transparent 100%)" }} />
            </div>
            <figcaption className="absolute right-2 top-2 rounded-full bg-[rgb(241_220_196/0.8)] px-3 py-1 text-xs text-ink-soft">{d.common.conceptArt}</figcaption>
          </figure>
        </div>
        <div data-speed="-0.12" className="pointer-events-none absolute inset-x-0 bottom-[110px] z-[5] h-40 opacity-70 [mask-image:linear-gradient(180deg,#000_55%,transparent)]">
          <Mist className="h-full w-full" color="#efd9bf" />
        </div>
        <Hill className="relative z-10 -mt-20 block h-[130px] w-full md:-mt-36 md:h-[200px]" />
      </section>

      {/* 3. Festivals: hanging diya */}
      <section data-parallax className="relative isolate overflow-hidden bg-[#141b24] text-forest-ink">
        <Embers className="absolute inset-0 h-full w-full" density={0.6} />
        <div className="container-x relative grid items-center gap-6 pb-10 pt-2 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:gap-10 md:pb-20">
          <div>
            <p data-reveal className="flex items-center gap-3 font-display text-xl text-gold-bright">
              <span aria-hidden className="h-px w-10 bg-gold-bright" />
              {next ? h.upcomingLabel : h.festivalsLabel}
            </p>
            <h2 data-reveal className="display-lg mt-4">{next ? t(next.title, locale) : h.festivalName}</h2>
            {next ? (
              <p data-reveal className="mt-4 flex items-center gap-3 text-lg">
                <Icon name="kalash" size={22} className="text-gold-bright" />
                <time dateTime={next.starts_at} className="tabular">{formatDate(next.starts_at, locale)}</time>
              </p>
            ) : null}
            <p data-reveal className="lede measure mt-5 !text-forest-soft">{next ? t(next.description, locale) : h.festivalBody}</p>
            {!next ? <p data-reveal className="mt-3 text-sm text-forest-soft">{h.festivalNote}</p> : null}
            <Link data-reveal href={href(locale, "activities")} className="group mt-8 inline-flex items-center gap-3 border-b border-gold-bright pb-1 font-display text-xl text-forest-ink no-underline">
              {h.viewActivities}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">⟶</span>
            </Link>
          </div>
          <div data-speed="-0.2" aria-hidden className="relative order-first mx-auto w-[min(56vw,260px)] md:order-none md:-mt-16 md:w-[300px]">
            <div className="diya-swing relative">
              <span className="flame-glow absolute left-[21%] top-[48%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_196_110/0.55),rgb(255_170_80/0.12)_45%,transparent_70%)]" />
              {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
              <img
                src="/art/hanging-diya.jpg"
                alt=""
                width={480}
                height={580}
                loading="lazy"
                className="relative h-auto w-full"
                style={{ maskImage: "radial-gradient(closest-side at 52% 52%, #000 55%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 22%)", maskComposite: "intersect", WebkitMaskComposite: "source-in" }}
              />
            </div>
          </div>
        </div>
        {/* A live river of floating diyas and lotus. */}
        <RiverLamps className="relative h-56 w-full md:h-72" />
      </section>

      {/* 4. Closing verse: peacock feather */}
      <section data-parallax className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#0b1016_0%,#22262c_100%)] text-forest-ink">
        <div data-speed="-0.3" aria-hidden className="pointer-events-none absolute bottom-16 -left-10 w-[min(70vw,520px)] opacity-90 md:-left-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
          <img
            src="/art/peacock-feather.jpg"
            alt=""
            width={640}
            height={552}
            loading="lazy"
            className="h-auto w-full"
            style={{ maskImage: "radial-gradient(closest-side at 45% 52%, #000 50%, transparent 100%)" }}
          />
        </div>
        <Petals />
        <figure className="container-x relative pb-36 pt-20 text-center md:pb-48 md:pt-28">
          <p data-reveal lang="sa" className="font-sanskrit text-xl text-gold-pale/80">{h.quoteSanskrit}</p>
          <blockquote data-reveal className="mx-auto mt-5 max-w-[30ch] font-display text-3xl italic leading-snug md:text-[2.6rem]">
            &ldquo;{h.quote}&rdquo;
          </blockquote>
          <figcaption data-reveal className="mt-5 text-forest-soft">{h.quoteSource}</figcaption>
          <Ornament className="mt-8" />
        </figure>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 md:h-36">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgb(244_238_226/0.3)_60%,var(--marble-2)_100%)]" />
          <Mist className="absolute inset-0 h-full w-full" color="#f4eee2" />
        </div>
      </section>

      {/* Journey */}
      <section className="section bg-marble-2">
        <div className="container-x">
          <h2 data-reveal className="display-lg">{d.home.journeyTitle}</h2>
          <p data-reveal className="lede measure mt-5">{d.home.journeyBody}</p>
          <ol data-journey className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            {milestones.map((m) => (
              <li key={m.id} className="relative border-t-2 border-marble-3 pt-4 data-[done=true]:border-gold" data-done={m.verified && m.status === "completed"}>
                <span aria-hidden data-journey-line className="absolute -top-0.5 left-0 h-0.5 w-full origin-left scale-x-0 bg-gold" />
                <span aria-hidden data-journey-dot className="absolute -top-[5px] left-0 h-2 w-full"><span className="block h-2 w-2 -translate-x-1 scale-0 rounded-full bg-gold shadow-[0_0_10px_rgb(212_169_73/0.9)]" /></span>
                <p className="tabular text-sm text-ink-soft">{m.step}</p>
                <p className="mt-1 font-display text-xl leading-snug">{t(m.title, locale)}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {m.verified && m.status === "completed" ? d.journey.statusCompleted : m.verified && m.status === "in_progress" ? d.journey.statusInProgress : d.journey.statusPlanned}
                </p>
              </li>
            ))}
          </ol>
          <Link href={href(locale, "journey")} className="mt-10 inline-block text-gold underline hover:text-ink">
            {d.nav.journey}
          </Link>
        </div>
      </section>

      {/* Join */}
      <section className="bg-marble">
        <div className="container-x flex flex-col items-start gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20">
          <div data-reveal>
            <h2 className="display-md">{d.home.visitTitle}</h2>
            <p className="mt-3 max-w-[48ch] text-ink-soft">{d.home.visitBody}</p>
          </div>
          <Link href={href(locale, "contact")} className="btn btn-primary">{d.nav.contact}</Link>
        </div>
      </section>
    </>
  );
}
