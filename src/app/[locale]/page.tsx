import Link from "next/link";
import type { Metadata } from "next";
import { isLocale, t, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getEvents, getFacilities, getMilestones } from "@/lib/data";
import { formatDate } from "@/lib/view";
import { href } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { Petals } from "@/components/Petals";
import { Icon } from "@/components/Icon";
import { BrandMark } from "@/components/BrandMark";
import { Mist, Ornament, Rays } from "@/components/home/art";
import { Embers } from "@/components/Embers";
import { RiverLamps } from "@/components/home/RiverLamps";
import { SparkLotus } from "@/components/home/SparkLotus";
import { MaskWords } from "@/components/MaskWords";
import { Birds, Flame, Moon, Ridges, Stars } from "@/components/painting/scenery";
import { GoldenPath } from "@/components/painting/GoldenPath";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "", `${d.meta.siteName} | ${d.meta.tagline}`, d.meta.description);
}

const HERO_ART_WIDTHS = [828, 1280, 1920, 2272];
const HERO_ART_SRCSET = (ext: string) => HERO_ART_WIDTHS.map((w) => `/art/hero/radha-krishna-${w}.${ext} ${w}w`).join(", ");
// Phones show it cover-cropped in a tall band, so it renders about two screen-widths wide.
const HERO_ART_SIZES = "(min-width: 1024px) 60vw, 200vw";

// Until the founding membership page exists, "Become a founding member" opens the contact page,
// so people can ask the foundation about it. Donate stays its own, second action.
const FOUNDING_ROUTE = "contact" as const;

// The four programmes that best show daily devotional life (indices into dictionary activities.programmes).
const ACTIVITY_PICKS = [0, 5, 1, 7];

/** A quiet text link with a sliding arrow, the one link style used through the painting. */
function ArrowLink({ to, children, tone = "light" }: { to: string; children: React.ReactNode; tone?: "light" | "dark" }) {
  return (
    <Link
      href={to}
      className={`group inline-flex items-center gap-3 border-b pb-1 font-display text-xl no-underline ${tone === "dark" ? "border-gold-bright/70 text-forest-ink" : "border-gold text-ink"}`}
    >
      {children}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">⟶</span>
    </Link>
  );
}

/**
 * Home is one continuous painting. Each chapter's background starts exactly where the one above it
 * ends (night, ivory dawn, warm day, forest, moonlit evening, blue hour, night path, midnight), and
 * the scenery layers (ridges, mist, trees, moon, art) overlap the seams, so there are no section edges.
 */
export default async function Home({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const d = getDictionary(locale);
  const h = d.home;
  const milestones = getMilestones();
  const facilities = getFacilities();
  const next = getEvents().find((e) => new Date(e.ends_at ?? e.starts_at).getTime() >= Date.now());

  return (
    <div className="painting overflow-x-clip">
      {/* ── 01 The divine beginning: night, Radha-Krishna, rays, embers ── */}
      <section data-hero data-parallax className="relative isolate overflow-hidden bg-night text-forest-ink">
        <div className="relative min-h-[100svh]">
          {/* Temple identity, integrated into the artwork. Navigation is the lotus at the bottom. */}
          <Link href={href(locale, "home")} aria-label={d.meta.siteName} className="absolute left-4 top-4 z-40 flex items-center gap-3 text-forest-ink no-underline md:left-8 md:top-6">
            <BrandMark size={46} className="text-[#e2c486]" />
            <span className="hidden max-w-[11rem] font-display text-[1.05rem] leading-tight [text-shadow:0_1px_10px_rgb(0_0_0/0.5)] sm:block">{d.meta.siteName}</span>
          </Link>

          {/* Painted artwork. Upper right on wide screens (the painting is wide, so it fades out below), top band on phones. */}
          <div data-speed="0.18" data-depth="0.6" className="absolute inset-x-0 top-0 h-[68svh] lg:left-auto lg:right-0 lg:h-auto lg:w-[min(60vw,calc(100svh*1.48))] lg:aspect-[2272/1536]">
            <picture className="block h-full w-full">
              <source type="image/avif" srcSet={HERO_ART_SRCSET("avif")} sizes={HERO_ART_SIZES} />
              <source type="image/webp" srcSet={HERO_ART_SRCSET("webp")} sizes={HERO_ART_SIZES} />
              <img
                src="/art/hero/radha-krishna-1280.jpg"
                alt={h.heroArt}
                width={2272}
                height={1536}
                fetchPriority="high"
                decoding="async"
                data-hero-art
                className="h-full w-full object-cover object-[47%_20%] lg:object-center"
                style={{ maskImage: "linear-gradient(90deg, transparent 0%, #000 12%), linear-gradient(0deg, transparent 0%, #000 38%)", maskComposite: "intersect", WebkitMaskComposite: "source-in" }}
              />
            </picture>
          </div>
          <Rays className="pointer-events-none absolute inset-0 h-full w-full opacity-80" />
          <Embers className="absolute inset-0 z-10 h-full w-full" density={0.5} />

          <div data-speed="-0.35" data-hero-copy className="container-x relative z-30 flex min-h-[100svh] flex-col justify-end pb-[9svh] pt-[44svh] lg:justify-center lg:pb-[18svh] lg:pt-28">
            <div className="max-w-[30rem] text-center lg:ml-[4%]">
              <Ornament className="mb-3 lg:mb-6" />
              <h1 data-hero-title className="display-xl text-balance [text-shadow:0_2px_18px_rgb(0_0_0/0.45)]"><MaskWords text={h.headline.replace("-", "‑")} /></h1>
              <p data-hero-line className="mx-auto mt-5 max-w-[26ch] pb-1 font-display text-2xl italic leading-snug text-gold-pale">{d.meta.tagline}</p>
              <nav data-hero-line aria-label={h.headline} className="mt-6 flex flex-wrap justify-center gap-2 lg:mt-8 lg:gap-2.5">
                <Link href={href(locale, "temple")} className="btn btn-primary !min-h-[44px] !px-4 !py-2 text-[0.9rem] lg:!px-5 lg:text-[0.95rem]">{h.ctaExplore}</Link>
                <Link href={href(locale, "masterPlan")} className="btn btn-quiet !min-h-[44px] bg-[rgb(16_27_41/0.45)] !px-4 !py-2 text-[0.9rem] backdrop-blur-sm lg:!px-5 lg:text-[0.95rem]">{h.ctaPlan}</Link>
              </nav>
            </div>
          </div>

          {/* A thread of light that slides down: the only scroll hint. */}
          <span aria-hidden className="scroll-thread absolute bottom-[4svh] left-1/2 z-30 hidden h-12 w-px -translate-x-1/2 overflow-hidden bg-[rgb(242_229_208/0.18)] lg:block">
            <span className="block h-1/2 w-full bg-[linear-gradient(180deg,transparent,#cfae72)]" />
          </span>
        </div>
        {/* Mist melts the night into the ivory dawn below. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[26svh]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgb(242_229_208/0.55)_55%,var(--mist)_100%)]" />
          <Mist className="absolute inset-x-0 bottom-0 h-full w-full" color="#f2e5d0" />
        </div>
      </section>

      {/* ── 02 About the temple: ivory dawn mist, far hills, birds, the temple emerging ── */}
      <section id="vision" data-parallax className="relative isolate z-10 -mt-[20svh] scroll-mt-20 bg-[linear-gradient(180deg,transparent_0%,var(--mist)_20svh,#efdfc4_70%,#ead6b6_100%)] text-ink">
        {/* Far ridges sit behind the temple and run under the text, so the land carries on across the page. */}
        <div data-speed="0.12" className="absolute inset-x-0 bottom-[8%] -z-10 h-[46%]">
          <Ridges
            className="h-full"
            layers={[
              { seed: 7, base: 210, amp: 70, freq: 0.7, fill: "#cdc5b6", opacity: 0.55 },
              { seed: 19, base: 260, amp: 55, freq: 0.9, fill: "#b9b3a4", opacity: 0.5 },
              { seed: 31, base: 320, amp: 40, freq: 1.2, fill: "#a6a491", opacity: 0.45 },
            ]}
          />
        </div>
        <div data-speed="-0.25" className="absolute right-[8%] top-[44%] w-[36vw] md:right-[34%] md:top-[9%] md:w-[min(22vw,280px)]">
          <Birds className="bird-drift w-full" />
        </div>

        <div className="container-x relative grid items-end gap-8 pt-[8svh] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10 md:pt-[10svh]">
          <div className="pb-2 md:pb-48">
            <p data-reveal className="font-display text-xl italic text-gold">{h.aboutLabel}</p>
            <h2 data-reveal className="display-lg mt-3"><MaskWords text={h.aboutTitle} /></h2>
            <p data-reveal className="lede measure mt-6 !text-ink-soft">{h.aboutBody}</p>
            <div data-reveal className="mt-8"><ArrowLink to={href(locale, "temple")}>{d.common.learnMore}</ArrowLink></div>
          </div>
          <figure className="relative -mr-[var(--gutter,1rem)] translate-y-10 md:-mr-10 md:translate-y-24">
            <div data-speed="0.08" className="relative ml-auto w-full max-w-[640px]">
              <span aria-hidden className="sun-glow absolute left-1/2 top-[18%] h-[70%] w-[80%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_228_178/0.8),rgb(242_210_160/0.25)_55%,transparent)]" />
              {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
              <img
                src="/art/temple-concept.jpg"
                alt={h.templeArt}
                width={984}
                height={1040}
                loading="lazy"
                className="relative h-auto w-full"
                style={{
                  maskImage: "linear-gradient(90deg, transparent 0%, #000 34%, #000 74%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 26%, #000 70%, transparent 100%)",
                  maskComposite: "intersect",
                  WebkitMaskComposite: "source-in",
                }}
              />
            </div>
            <figcaption className="absolute right-2 top-2 rounded-full bg-[rgb(242_229_208/0.85)] px-3 py-1 text-xs text-ink-soft">{d.common.conceptArt}</figcaption>
          </figure>
        </div>
        {/* Morning mist rolls over the temple's base and into the day. */}
        <div data-speed="-0.12" className="pointer-events-none relative z-[5] -mt-24 h-48 md:-mt-40 md:h-64">
          <Mist className="h-full w-full" color="#ead6b6" />
        </div>
      </section>

      {/* ── 03 Spiritual activities: warm day, a lit clay diya and a peacock feather in the foreground ── */}
      <section data-parallax className="relative isolate bg-[linear-gradient(180deg,#ead6b6_0%,#e6cfa9_55%,#dcc196_100%)] text-ink">
        <div className="container-x relative grid gap-10 pb-10 pt-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16 lg:pb-16">
          {/* Still life: the feather rests behind the lamp; the lamp's flame is the warmest point of the day. */}
          <div aria-hidden className="relative mx-auto aspect-[5/4] w-full max-w-[360px] lg:max-w-[460px]">
            <div data-speed="0.1" className="absolute left-[2%] top-[4%] w-[78%] rotate-[-14deg] opacity-90">
              {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
              <img src="/art/peacock-feather.webp" alt="" width={800} height={685} loading="lazy" className="h-auto w-full" />
            </div>
            <div data-speed="-0.15" className="absolute bottom-[6%] right-[10%] w-[44%]">
              <span className="absolute inset-x-[8%] bottom-[2%] h-[18%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(91_70_50/0.35),transparent)]" />
              {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
              <img src="/art/diya-float.webp" alt="" width={600} height={600} loading="lazy" className="relative h-auto w-full" />
              <Flame className="left-[80%] top-[8%] h-[18%] w-[9%]" />
            </div>
          </div>

          <div>
            <h2 data-reveal className="display-lg"><MaskWords text={d.activities.title} /></h2>
            <p data-reveal className="lede measure mt-5 !text-ink-soft">{d.activities.intro}</p>
            <dl className="mt-9 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {ACTIVITY_PICKS.map((i) => d.activities.programmes[i]).filter(Boolean).map((p) => (
                <div key={p.title} className="border-l border-gold/40 pl-4">
                  <dt className="font-display text-[1.35rem] leading-tight text-ink">{p.title}</dt>
                  <dd className="mt-1 text-[0.98rem] leading-relaxed text-ink-soft">{p.body}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-9"><ArrowLink to={href(locale, "activities")}>{h.viewActivities}</ArrowLink></div>
          </div>
        </div>
        {/* The land rises toward the eye: far hills, then forest, then the dark tree line that the evening grows out of. */}
        <div className="relative -mb-px">
          <Ridges
            height={300}
            className="h-[150px] md:h-[240px]"
            layers={[
              { seed: 41, base: 150, amp: 40, freq: 0.8, fill: "#a7a387", opacity: 0.55 },
              { kind: "trees", seed: 52, base: 200, amp: 46, freq: 40, fill: "#4f5d4a", opacity: 0.7 },
              { kind: "trees", seed: 63, base: 240, amp: 54, freq: 30, fill: "#2a3a30" },
              { kind: "trees", seed: 74, base: 275, amp: 40, freq: 24, fill: "#18251f" },
            ]}
          />
        </div>
      </section>

      {/* ── 04 Krishna Janmashtami: through the trees into a moonlit evening, a hanging diya, the river of lamps ── */}
      <section data-parallax className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#18251f_0%,#1a2833_14%,#1b2738_45%,#17222f_80%,#16212f_100%)] text-forest-ink">
        <Stars className="absolute inset-x-0 top-0 h-[60%] w-full opacity-80" count={60} seed={9} />
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[16%] h-[40%] bg-[radial-gradient(60%_50%_at_30%_100%,rgb(197_139_67/0.16),transparent_70%)]" />
        <div data-speed="0.3" className="absolute right-[8%] top-[10%] h-20 w-20 md:right-[14%] md:top-[14%] md:h-28 md:w-28">
          <Moon className="absolute inset-0" />
        </div>
        <Embers className="absolute inset-0 h-full w-full" density={0.4} />
        <Petals />

        <div className="container-x relative grid items-center gap-6 pb-6 pt-24 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] md:gap-12 md:pb-10 md:pt-32">
          <div data-speed="-0.2" aria-hidden className="relative mx-auto w-[min(48vw,230px)] md:-mt-24 md:w-[280px]">
            <div className="diya-swing relative">
              <span className="flame-glow absolute left-1/2 top-[57%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_196_110/0.5),rgb(197_139_67/0.12)_45%,transparent_70%)]" />
              {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
              <img src="/art/hanging-diya.webp" alt="" width={640} height={770} loading="lazy" className="relative h-auto w-full" style={{ maskImage: "linear-gradient(180deg, transparent 0%, #000 18%)" }} />
            </div>
          </div>
          <div className="text-center md:text-left">
            <p data-reveal className="font-display text-xl italic text-gold-bright">{next ? h.upcomingLabel : h.festivalsLabel}</p>
            <h2 data-reveal className="display-lg mt-3"><MaskWords text={next ? t(next.title, locale) : h.festivalName} /></h2>
            {next ? (
              <p data-reveal className="mt-4 flex items-center justify-center gap-3 text-lg md:justify-start">
                <Icon name="kalash" size={22} className="text-gold-bright" />
                <time dateTime={next.starts_at} className="tabular">{formatDate(next.starts_at, locale)}</time>
              </p>
            ) : null}
            <p data-reveal className="lede measure mx-auto mt-5 !text-forest-soft md:mx-0">{next ? t(next.description, locale) : h.festivalBody}</p>
            {!next ? <p data-reveal className="mt-3 text-sm text-forest-soft">{h.festivalNote}</p> : null}
          </div>
        </div>
        <RiverLamps className="relative h-52 w-full md:h-72" />
      </section>

      {/* ── 05 Campus master plan: blue hour over the land, each proposed area a lamp on the panorama ── */}
      <section data-parallax className="relative isolate bg-[linear-gradient(180deg,#16212f_0%,#14212e_55%,#111c28_100%)] text-forest-ink">
        <div className="container-x relative pt-16 md:pt-24">
          <div className="max-w-2xl">
            <h2 data-reveal className="display-lg"><MaskWords text={h.campusTitle} /></h2>
            <p data-reveal className="lede measure mt-5 !text-forest-soft">{h.campusBody}</p>
          </div>
        </div>

        {/* The panorama. Lamps sit where each area is on the schematic plan: further back = higher and smaller. */}
        <div className="relative mt-10 bg-[linear-gradient(180deg,transparent_0%,#1f3044_38%,#2a3d52_52%,#14212e_70%)] md:mt-6" data-no-reveal>
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-[20%] h-[50%] bg-[radial-gradient(50%_60%_at_18%_80%,rgb(197_139_67/0.14),transparent_70%)]" />
          <div data-speed="0.1">
            <Ridges
              height={420}
              className="h-[260px] md:h-[400px]"
              layers={[
                { seed: 81, base: 160, amp: 40, freq: 0.6, fill: "#34475d", opacity: 0.8 },
                { seed: 92, base: 205, amp: 30, freq: 0.8, fill: "#263850" },
                { kind: "trees", seed: 13, base: 235, amp: 22, freq: 22, fill: "#1a2a39" },
                { seed: 24, base: 270, amp: 14, freq: 0.5, fill: "#14212e" },
              ]}
            />
          </div>
          <ul aria-label={d.masterPlan.facilitiesTitle} className="absolute inset-0">
            {facilities.map((f) => {
              const depth = f.pos_y / 100; // 0 = far, 1 = near
              const top = 62 + depth * 30;
              const size = 0.7 + depth * 0.6;
              return (
                <li key={f.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${8 + f.pos_x * 0.84}%`, top: `${top}%` }}>
                  <span className="pano-lamp" style={{ scale: String(size) }} aria-hidden />
                  <span className="sr-only">{t(f.name, locale)}, {d.common.proposed}</span>
                  <span aria-hidden className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 font-display text-sm text-gold-pale/80">{f.code}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="container-x relative pb-16 md:pb-20">
          <ol className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4" data-no-reveal>
            {facilities.map((f) => (
              <li key={f.id} className="flex items-baseline gap-3">
                <span className="font-display text-xl text-gold-bright tabular">{f.code}</span>
                <span className="text-[0.98rem] leading-snug text-forest-ink/90">{t(f.name, locale)}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <span className="proposed-tag !border-gold-bright/70 !text-gold-bright">{d.common.proposed}</span>
            <p className="max-w-[60ch] text-sm text-forest-soft">{d.masterPlan.disclaimer}</p>
          </div>
          <div className="mt-8"><ArrowLink to={href(locale, "masterPlan")} tone="dark">{h.ctaPlan}</ArrowLink></div>
        </div>
      </section>

      {/* ── 06 Project journey: a golden path winding down through the night ── */}
      <section data-parallax className="relative isolate bg-[linear-gradient(180deg,#111c28_0%,#111d2b_50%,#101b29_100%)] text-forest-ink" data-no-reveal>
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_30%_at_80%_30%,rgb(24_37_31/0.8),transparent_70%),radial-gradient(40%_30%_at_15%_70%,rgb(24_37_31/0.7),transparent_70%)]" />
        <div className="container-x relative pb-20 pt-16 md:pb-28 md:pt-20">
          <div className="max-w-2xl md:mx-auto md:text-center">
            <h2 data-reveal className="display-lg"><MaskWords text={h.journeyTitle} /></h2>
            <p data-reveal className="lede measure mt-5 !text-forest-soft md:mx-auto">{h.journeyBody}</p>
          </div>
          <div className="mx-auto mt-12 max-w-4xl md:mt-16">
            <GoldenPath
              steps={milestones.map((m) => {
                const status = m.verified ? m.status : "planned";
                const label = status === "completed" ? d.journey.statusCompleted : status === "in_progress" ? d.journey.statusInProgress : d.journey.statusPlanned;
                return { num: String(m.step).padStart(2, "0"), title: t(m.title, locale), status: label, done: status === "completed" };
              })}
            />
          </div>
          <div className="mt-12 md:text-center"><ArrowLink to={href(locale, "journey")} tone="dark">{d.nav.journey}</ArrowLink></div>
        </div>
      </section>

      {/* ── 07 Closing: midnight, a great peacock feather, the verse, and the invitation ── */}
      <section data-parallax className="relative isolate overflow-hidden bg-night text-forest-ink">
        <Stars className="absolute inset-0 h-full w-full opacity-70" count={90} seed={23} />
        <div data-speed="-0.3" aria-hidden className="pointer-events-none absolute -left-16 bottom-0 w-[min(78vw,420px)] opacity-80 lg:-left-8 lg:bottom-10 lg:w-[min(40vw,560px)] lg:opacity-90">
          {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
          <img src="/art/peacock-feather.webp" alt="" width={800} height={685} loading="lazy" className="h-auto w-full" />
        </div>
        <Petals />
        <Embers className="absolute inset-0 h-full w-full" density={0.35} />

        <figure className="container-x relative pt-20 text-center md:pt-28" data-no-reveal>
          <p data-reveal lang="sa" className="font-sanskrit text-xl text-gold-pale/80">{h.quoteSanskrit}</p>
          <blockquote data-reveal className="mx-auto mt-5 max-w-[30ch] pb-1 font-display text-3xl italic leading-snug md:text-[2.6rem]">
            &ldquo;{h.quote}&rdquo;
          </blockquote>
          <figcaption data-reveal className="mt-5 text-forest-soft">{h.quoteSource}</figcaption>
          <SparkLotus className="mt-4" />
        </figure>

        <div className="container-x relative pb-[min(70vw,18rem)] pt-6 lg:pb-32">
          <div className="mx-auto max-w-xl text-center lg:ml-auto lg:mr-[6%] lg:max-w-md lg:text-left">
            <h2 data-reveal className="display-md">{h.visitTitle}</h2>
            <p data-reveal className="mt-3 text-forest-soft">{h.visitBody}</p>
            <div data-reveal className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href={href(locale, FOUNDING_ROUTE)} className="btn btn-primary">{d.nav.founding}</Link>
              <Link href={href(locale, "donate")} className="btn btn-quiet">{d.nav.donate}</Link>
            </div>
            <p data-reveal className="mt-7 text-sm text-forest-soft">
              {d.common.initiativeOf} {d.common.orgName}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
