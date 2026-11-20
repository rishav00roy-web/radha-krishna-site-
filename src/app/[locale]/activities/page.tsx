import type { Metadata } from "next";
import { isLocale, t, type Locale, htmlLang } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getAnnouncements, getEvents } from "@/lib/data";
import { formatDate } from "@/lib/view";
import { PageIntro } from "@/components/PageIntro";
import { EventsCalendar } from "@/components/EventsCalendar";
import { Icon } from "@/components/Icon";
import type { IconKey } from "@/lib/types";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/activities", d.activities.title, d.activities.intro);
}

const icons: IconKey[] = ["diya", "book", "book", "flute", "feather", "drum", "gathering", "meditate", "conch"];

export default async function ActivitiesPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  const [events, announcements] = await Promise.all([getEvents(), getAnnouncements()]);

  return (
    <>
      <PageIntro title={d.activities.title} intro={d.activities.intro} icon="diya" />

      <section className="section">
        <div className="container-x">
          <h2 data-reveal className="display-lg">{d.activities.programmesTitle}</h2>
          <ul className="mt-12 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {d.activities.programmes.map((p, i) => (
              <li key={p.title} data-reveal className="flex gap-4 border-t border-line py-7">
                <Icon name={icons[i]} size={40} className="shrink-0 text-gold" />
                <div>
                  <h3 className="text-2xl">{p.title}</h3>
                  <p className="mt-1 text-ink-soft">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="calendar" className="section bg-marble-2">
        <div className="container-x">
          <h2 data-reveal className="display-lg mb-10">{d.activities.calendarTitle}</h2>
          <EventsCalendar
            langTag={htmlLang[locale]}
            events={events.map((e) => ({ id: e.id, starts_at: e.starts_at, ends_at: e.ends_at, venue: e.venue, title: t(e.title, locale), description: t(e.description, locale) }))}
            strings={{ noEvents: d.activities.noEvents, upcoming: d.activities.upcoming, prevMonth: d.activities.prevMonth, nextMonth: d.activities.nextMonth, today: d.activities.today }}
          />
        </div>
      </section>

      <section id="announcements" className="section">
        <div className="container-x [&>*]:max-w-4xl">
          <h2 data-reveal className="display-lg">{d.activities.announcementsTitle}</h2>
          {announcements.length === 0 ? (
            <p className="mt-6 text-ink-soft">{d.common.noneYet}</p>
          ) : (
            <ul className="mt-10">
              {announcements.map((a) => (
                <li key={a.id} className="border-t border-line py-7">
                  <p className="tabular text-sm text-ink-soft">
                    {formatDate(a.published_at, locale)}
                  </p>
                  <h3 className="mt-1 text-2xl">{t(a.title, locale)}</h3>
                  <p className="measure mt-2 whitespace-pre-line text-ink-soft">{t(a.body, locale)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
