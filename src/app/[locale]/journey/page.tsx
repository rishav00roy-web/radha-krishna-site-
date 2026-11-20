import Link from "next/link";
import type { Metadata } from "next";
import { isLocale, t, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getMilestones, getUpdates } from "@/lib/data";
import { formatDate } from "@/lib/view";
import { PageIntro } from "@/components/PageIntro";

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

      <section className="section">
        <div className="container-x [&>*]:max-w-4xl">
          <ol className="relative border-l border-marble-3 pl-8 md:pl-12">
            {milestones.map((m) => {
              // Unverified progress is never shown: it falls back to "Planned".
              const status = m.verified ? m.status : "planned";
              const label = status === "completed" ? d.journey.statusCompleted : status === "in_progress" ? d.journey.statusInProgress : d.journey.statusPlanned;
              return (
                <li key={m.id} data-reveal className="relative pb-12 last:pb-0">
                  <span
                    aria-hidden
                    className={`absolute -left-[calc(2rem+9px)] top-1.5 h-[18px] w-[18px] rounded-full border-2 md:-left-[calc(3rem+9px)] ${
                      status === "completed" ? "border-gold bg-gold" : status === "in_progress" ? "border-gold bg-marble" : "border-marble-3 bg-marble"
                    }`}
                  />
                  <p className="tabular text-sm text-ink-soft">{m.step}</p>
                  <h2 className="display-md mt-1">{t(m.title, locale)}</h2>
                  <p className="mt-2 text-ink-soft">{t(m.description, locale)}</p>
                  <p className={`mt-3 inline-flex rounded-full border px-3 py-0.5 text-sm ${status === "planned" ? "border-marble-3 text-ink-soft" : "border-gold text-gold"}`}>
                    {label}
                    {m.verified && m.verified_on ? ` · ${d.journey.verifiedOn} ${formatDate(m.verified_on, locale)}` : ""}
                  </p>
                </li>
              );
            })}
          </ol>
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
