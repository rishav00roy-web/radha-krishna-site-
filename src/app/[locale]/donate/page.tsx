import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { en } from "@/i18n/dictionaries/en";
import { pageMetadata } from "@/lib/seo";
import { getOrganisation } from "@/lib/data";
import { PageIntro } from "@/components/PageIntro";
import { DonateForm } from "@/components/DonateForm";

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
      <PageIntro title={g.title} intro={g.intro} icon="kalash" />
      <section className="section">
        <div className="container-x grid gap-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
          <DonateForm
            to={org.email}
            whatsapp={org.whatsapp}
            purposes={g.purposes.map((label, i) => ({ label, value: en.donate.purposes[i] }))}
            strings={{
              name: g.name, mobile: g.mobile, amount: g.amount, other: g.other, otherLabel: g.otherLabel, purpose: g.purpose,
              note: g.note, sendEmail: g.sendEmail, sendWhatsApp: g.sendWhatsApp, howEmail: g.howEmail, howWhatsApp: g.howWhatsApp,
              required: g.required, invalidMobile: g.invalidMobile, invalidAmount: g.invalidAmount,
            }}
          />
          <aside className="on-dark rounded p-8 md:p-10 lg:self-start">
            <h2 className="display-md">{g.talkTitle}</h2>
            <p className="mt-4 text-forest-soft">{g.talkBody}</p>
            <p className="mt-6 text-forest-soft">{d.common.orgName}</p>
            <a href={`tel:+91${org.phone}`} className="tabular block font-display text-3xl text-gold-bright no-underline hover:underline">{org.phone}</a>
            <a href={`tel:+91${org.phone}`} className="btn btn-primary mt-8">{d.contact.call}</a>
          </aside>
        </div>
      </section>
    </>
  );
}
