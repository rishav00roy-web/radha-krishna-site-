import Link from "next/link";
import type { Metadata } from "next";
import { isLocale, t, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getFacilities, getMilestones } from "@/lib/data";
import { photos } from "@/lib/content";
import { href } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { TempleIllustration } from "@/components/TempleIllustration";
import { Petals } from "@/components/Petals";
import { Icon } from "@/components/Icon";
import { PhotoFigure } from "@/components/PhotoFigure";
import { StatusTag } from "@/components/ProposedTag";
import type { IconKey } from "@/lib/types";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "", `${d.meta.siteName} | ${d.meta.tagline}`, d.meta.description);
}

const centreIcons: IconKey[] = ["diya", "hands", "book", "kalash", "gathering", "meditate"];

export default async function Home({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const d = getDictionary(locale);
  const facilities = getFacilities();
  const milestones = getMilestones();

  return (
    <>
      {/* Hero: the temple is the identity */}
      <section data-hero className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-forest text-forest-ink">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-0 h-[54svh] lg:inset-y-0 lg:left-auto lg:h-auto lg:w-[70%]">
            <TempleIllustration className="h-full w-full" title={d.common.conceptArt} />
          </div>
          {/* Scrims keep the text readable: a bottom wash on small screens, a left fade on wide ones. */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(13_36_28/0.5)_0%,rgb(13_36_28/0)_18%,rgb(13_36_28/0)_34%,var(--forest)_54svh,var(--forest)_100%)] lg:bg-[linear-gradient(90deg,var(--forest)_0%,var(--forest)_30%,rgb(23_48_31/0.6)_42%,rgb(23_48_31/0)_58%),linear-gradient(0deg,rgb(13_36_28/0.85)_0%,rgb(13_36_28/0)_30%)]" />
        </div>
        <Petals />

        <div className="container-x relative pb-10 pt-[46svh] md:pb-14 lg:pt-32">
          <p data-hero-line className="font-display text-xl text-gold-pale md:text-2xl">{d.meta.tagline}</p>
          <h1 data-hero-line className="display-xl mt-3 max-w-[14ch]">{d.home.headline.replace("-", "\u2011")}</h1>
          <p data-hero-line className="lede mt-5 max-w-[34ch] !text-forest-ink">{d.home.subhead}</p>

          <div data-hero-line className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href={href(locale, "temple")} className="btn btn-primary">
              {d.home.ctaExplore}
            </Link>
            <Link href="#vision" className="btn btn-quiet">{d.home.ctaVision}</Link>
            <Link href={href(locale, "masterPlan")} className="btn btn-quiet">{d.home.ctaPlan}</Link>
            <Link href={href(locale, "activities")} className="btn btn-quiet">{d.home.ctaActivities}</Link>
          </div>

          <dl data-hero-line className="mt-12 grid gap-6 border-t border-[rgb(243_236_220/0.2)] pt-6 text-[0.95rem] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <div>
              <dt className="text-forest-soft">{d.common.location}</dt>
              <dd>{d.common.locationValue}</dd>
            </div>
            <div>
              <dt className="text-forest-soft">{d.common.implementedBy}</dt>
              <dd>{d.common.orgName}</dd>
            </div>
            <dd className="self-end text-sm text-forest-soft">{d.common.conceptArt}</dd>
          </dl>
        </div>
      </section>

      {/* Vision */}
      <section id="vision" className="section scroll-mt-20">
        <div className="container-x grid items-center gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-20">
          <div data-reveal>
            <h2 className="display-lg">{d.home.visionTitle}</h2>
            <p className="lede measure mt-6">{d.home.visionBody}</p>
            <p className="mt-6 font-display text-2xl text-gold">{d.meta.brandMessage}</p>
          </div>
          <PhotoFigure
            data-reveal
            photo={photos.radhaKrishnaStatues}
            locale={locale}
            credit={d.common.photoCredit}
            aspect="aspect-[4/5]"
            sizes="(min-width: 768px) 45vw, 100vw"
          />
        </div>
      </section>

      {/* What the temple is for */}
      <section className="section bg-marble-2 !pt-0 md:!pt-0">
        <div className="container-x pt-16 md:pt-24">
          <div className="ornament-rule mb-12" aria-hidden>
            <Icon name="lotus" size={36} />
          </div>
          <h2 data-reveal className="display-lg max-w-[20ch]">{d.home.pillarsTitle}</h2>
          <ul className="mt-12 grid gap-x-16 md:grid-cols-2">
            {d.temple.centres.map((c, i) => (
              <li key={c.title} data-reveal className="flex gap-5 border-t border-line py-7">
                <Icon name={centreIcons[i]} size={44} className="shrink-0 text-gold" />
                <div>
                  <h3 className="text-2xl">{c.title}</h3>
                  <p className="mt-1 text-ink-soft">{c.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href={href(locale, "temple")} className="mt-10 inline-block text-gold underline hover:text-ink">
            {d.common.learnMore}: {d.nav.temple}
          </Link>
        </div>
      </section>

      {/* Campus */}
      <section className="section on-dark">
        <div className="container-x">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
            <h2 data-reveal className="display-lg max-w-[16ch]">{d.home.campusTitle}</h2>
            <p data-reveal className="lede measure">{d.home.campusBody}</p>
          </div>
          <ol className="mt-14 grid gap-px overflow-hidden rounded bg-[rgb(243_236_220/0.12)] sm:grid-cols-2 lg:grid-cols-4">
            {facilities.map((f, i) => (
              <li key={f.id} className={`bg-forest p-7 ${f.code === "A" ? "sm:col-span-2 lg:row-span-2 lg:p-10" : ""} ${i === facilities.length - 1 && facilities.length % 2 === 0 ? "sm:col-span-2" : ""}`}>
                <Link href={`${href(locale, "masterPlan")}#${f.slug}`} className="group block no-underline">
                  <div className="flex items-start justify-between gap-4">
                    <Icon name={f.icon} size={f.code === "A" ? 72 : 44} className="text-gold-bright" />
                    <StatusTag status={f.status} dict={d} />
                  </div>
                  <h3 className={`mt-6 ${f.code === "A" ? "display-md" : "text-2xl"} transition-colors duration-200 group-hover:text-gold-bright`}>
                    {t(f.name, locale)}
                  </h3>
                  <p className="mt-2 text-forest-soft">{t(f.summary, locale)}</p>
                </Link>
              </li>
            ))}
          </ol>
          <Link href={href(locale, "masterPlan")} className="btn btn-quiet mt-12">
            {d.home.ctaPlan}
          </Link>
        </div>
      </section>

      {/* Journey */}
      <section className="section">
        <div className="container-x">
          <h2 data-reveal className="display-lg">{d.home.journeyTitle}</h2>
          <p data-reveal className="lede measure mt-5">{d.home.journeyBody}</p>
          <ol className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            {milestones.map((m) => (
              <li key={m.id} className="border-t-2 border-marble-3 pt-4 data-[done=true]:border-gold" data-done={m.verified && m.status === "completed"}>
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
      <section className="bg-marble-2">
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
