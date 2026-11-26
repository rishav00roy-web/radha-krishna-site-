import Link from "next/link";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { en } from "@/i18n/dictionaries/en";
import { pageMetadata } from "@/lib/seo";
import { getOrganisation } from "@/lib/data";
import { donationSheetUrl } from "@/lib/content";
import { href } from "@/lib/routes";
import { PageIntro } from "@/components/PageIntro";
import { DonateForm } from "@/components/DonateForm";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/founding-member", d.founding.title, d.founding.intro);
}

/** People who give land for the temple become its founding members. They offer the land here. */
export default async function FoundingMemberPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  const org = getOrganisation();
  const f = d.founding;
  return (
    <>
      <PageIntro art="temple" title={f.title} intro={f.intro} icon="temple" />
      <section className="section">
        <div className="container-x grid gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <h2 data-reveal className="display-md">{f.formTitle}</h2>
            <p data-reveal className="measure mt-3 text-ink-soft">{f.formBody}</p>
            <div className="mt-8">
              <DonateForm kind="land" g={d.donate} en={en.donate} locale={locale} to={org.email} whatsapp={org.whatsapp} sheetUrl={donationSheetUrl} />
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start" data-no-reveal>
            <div className="on-dark rounded p-8 md:p-10">
              <h2 className="display-md">{f.stepsTitle}</h2>
              <ol className="mt-6 grid gap-5">
                {f.steps.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span aria-hidden className="tabular font-display text-2xl leading-none text-gold-bright">{i + 1}</span>
                    <p className="text-forest-soft">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-8 rounded border border-line bg-marble p-6">
              <h3 className="text-2xl">{f.talkTitle}</h3>
              <p className="mt-2 text-ink-soft">{f.talkBody}</p>
              <a href={`tel:+91${org.phone}`} className="tabular mt-3 inline-block font-display text-2xl text-gold no-underline hover:underline">{org.phone}</a>
            </div>
            <p className="mt-8 text-ink-soft">
              {f.moneyTitle}{" "}
              <Link href={href(locale, "donate")} className="text-gold underline underline-offset-4">{f.moneyLink}</Link>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
