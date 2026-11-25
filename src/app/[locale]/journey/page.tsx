import Link from "next/link";
import type { Metadata } from "next";
import { isLocale, t, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getMilestones, getUpdates } from "@/lib/data";
import { formatDate } from "@/lib/view";
import { PageIntro } from "@/components/PageIntro";
import { ProcessRail } from "@/components/anm";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/journey", d.journey.title, d.journey.intro);
}

export default async function JourneyPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  const milestones = getMilestones();
  const updates = getUpdates();

  return (
    <>
      <PageIntro title={d.journey.title} intro={d.journey.intro} icon="conch" />

      {/* Stages along a gold line that draws itself as you scroll; each stage brightens as the bead reaches it.
          Unverified progress is never shown: it falls back to "Planned". */}
      <section className="section !pt-6" data-no-reveal>
        <div className="container-x [&>*]:max-w-4xl">
          <ProcessRail
            vertical
            sticky={false}
            scrub={0}
            beadSize={12}
            steps={milestones.map((m) => {
              const status = m.verified ? m.status : "planned";
              const label = status === "completed" ? d.journey.statusCompleted : status === "in_progress" ? d.journey.statusInProgress : d.journey.statusPlanned;
              const verified = m.verified && m.verified_on ? ` · ${d.journey.verifiedOn} ${formatDate(m.verified_on, locale)}` : "";
              return { num: String(m.step).padStart(2, "0"), title: t(m.title, locale), text: `${t(m.description, locale)} ${label}${verified}.` };
            })}
          />
        </div>
      </section>

      <section id="updates" className="section bg-marble-2">
        <div className="container-x">
          <h2 data-reveal className="display-lg">{d.journey.updatesTitle}</h2>
          {updates.length === 0 ? (
            <p className="mt-6 text-ink-soft">{d.journey.noUpdates}</p>
          ) : (
            <ul className="mt-10 grid gap-x-10 md:grid-cols-2">
              {updates.map((u) => (
                <li key={u.id} className="border-t border-line py-7">
                  <p className="tabular text-sm text-ink-soft">{formatDate(u.published_at, locale)}</p>
                  <h3 className="mt-1 text-2xl">
                    <Link href={`/${locale}/journey/updates/${u.slug}`} className="no-underline hover:text-gold">{t(u.title, locale)}</Link>
                  </h3>
                  <p className="mt-2 text-ink-soft">{t(u.excerpt, locale)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
