import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { en } from "@/i18n/dictionaries/en";
import { pageMetadata } from "@/lib/seo";
import { getOrganisation } from "@/lib/data";
import { donationSheetUrl } from "@/lib/content";
import { whatsappHref } from "@/lib/compose";
import { PageIntro } from "@/components/PageIntro";
import { DonateForm } from "@/components/DonateForm";
import { CopyField } from "@/components/CopyField";
import { Icon } from "@/components/Icon";
import { Accordion } from "@/components/anm/Accordion";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/donate", d.donate.title, d.donate.intro);
}

export default async function DonatePage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  const org = getOrganisation();
  const g = d.donate;
  return (
    <>
      <PageIntro art="clayDiya" title={g.title} intro={g.intro} icon="kalash" />
      {/* Three ways to give: the bank account as a gold-framed plaque, cash beside it, in-kind support below. */}
      <section className="section" aria-labelledby="ways">
        <div className="container-x">
          <h2 id="ways" data-reveal className="display-lg text-center">{g.waysTitle}</h2>
          <div className="ornament-rule mx-auto mt-6 max-w-xs" aria-hidden><Icon name="lotus" size={30} /></div>
          <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-10">
            <article data-reveal className="on-dark plaque relative rounded p-7 sm:p-10">
              <div className="flex items-center gap-4">
                <Icon name="kalash" size={40} className="shrink-0 text-gold-bright" />
                <h3 className="display-md">{g.bankTitle}</h3>
              </div>
              <p className="mt-4 text-forest-soft">{g.bankBody}</p>
              <dl className="mt-6">
                <CopyField label={g.accountName} value={org.bank.account_name} copy={g.copy} copied={g.copied} />
                <CopyField label={g.accountNo} value={org.bank.account} copy={g.copy} copied={g.copied} mono />
                <CopyField label={g.ifsc} value={org.bank.ifsc} copy={g.copy} copied={g.copied} mono />
                <div className="grid gap-x-6 border-t border-[rgb(243_236_220/0.14)] pt-3.5 sm:grid-cols-2">
                  <div className="py-1"><dt className="text-sm text-forest-soft">{g.bankName}</dt><dd className="mt-0.5 text-lg">{org.bank.bank}</dd></div>
                  <div className="py-1"><dt className="text-sm text-forest-soft">{g.branch}</dt><dd className="mt-0.5 text-lg">{org.bank.branch}</dd></div>
                </div>
              </dl>
              <p className="mt-6 border-t border-[rgb(212_169_73/0.3)] pt-5 text-gold-pale">
                {g.bankAfter} <a href="#tell" className="text-gold-bright underline underline-offset-4 hover:text-gold-pale">{g.formTitle} ↓</a>
              </p>
            </article>

            <article data-reveal className="relative flex flex-col rounded border border-gold/40 bg-marble-2 p-7 sm:p-10">
              <div className="flex items-center gap-4">
                <Icon name="hands" size={40} className="shrink-0 text-gold" />
                <h3 className="display-md">{g.cashTitle}</h3>
              </div>
              <p className="mt-4 text-ink-soft">{g.cashBody}</p>
              <p className="mt-6 text-sm text-ink-soft">{g.cashWhere}</p>
              <address className="mt-1 not-italic text-lg">{org.address}</address>
              <p className="mt-5 text-sm text-ink-soft">{d.common.orgName}</p>
              <a href={`tel:+91${org.phone}`} className="tabular font-display text-3xl text-gold no-underline hover:underline">{org.phone}</a>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={`tel:+91${org.phone}`} className="btn btn-primary">{d.contact.call}</a>
              </div>
              <p className="mt-auto pt-8 text-sm text-ink-soft">{g.cashNote}</p>
            </article>

            <article data-reveal className="relative flex flex-col gap-6 rounded border border-gold/40 bg-marble-2 p-7 sm:p-10 lg:col-span-2 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              <div className="max-w-[62ch]">
                <div className="flex items-center gap-4">
                  <Icon name="tree" size={40} className="shrink-0 text-gold" />
                  <h3 className="display-md">{g.inkindTitle}</h3>
                </div>
                <p className="mt-4 text-ink-soft">{g.inkindBody}</p>
              </div>
              <div className="flex flex-wrap gap-3 lg:shrink-0">
                <a href={`tel:+91${org.phone}`} className="btn btn-primary">{d.contact.call}</a>
                <a href={whatsappHref(org.whatsapp, g.inkindMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">{g.inkindWhatsApp}</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Tell the foundation about the gift, with the common questions beside it. */}
      <section id="tell" className="section scroll-mt-20 bg-marble-2">
        <div className="container-x grid gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <h2 data-reveal className="display-md">{g.formTitle}</h2>
            <p data-reveal className="measure mt-3 text-ink-soft">{g.formBody}</p>
            <div className="mt-8">
              <DonateForm kind="money" g={g} en={en.donate} locale={locale} to={org.email} whatsapp={org.whatsapp} sheetUrl={donationSheetUrl} />
            </div>
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start" data-no-reveal>
            <h2 className="display-md">{g.faqTitle}</h2>
            <Accordion items={g.faq} className="mt-6" />
            <div className="mt-10 rounded border border-line bg-marble p-6">
              <h3 className="text-2xl">{g.talkTitle}</h3>
              <p className="mt-2 text-ink-soft">{g.talkBody}</p>
              <a href={`tel:+91${org.phone}`} className="tabular mt-3 inline-block font-display text-2xl text-gold no-underline hover:underline">{org.phone}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
