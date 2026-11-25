import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getOrganisation } from "@/lib/data";
import { PageIntro } from "@/components/PageIntro";
import { ContactForm } from "@/components/ContactForm";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/contact", d.contact.title, d.contact.intro);
}

export default async function ContactPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  const org = getOrganisation();
  const c = d.contact;
  return (
    <>
      <PageIntro title={c.title} intro={c.intro} icon="conch" />
      <section className="section">
        <div className="container-x grid gap-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
          <ContactForm
            to={org.email}
            whatsapp={org.whatsapp}
            strings={{
              name: c.name, email: c.email, mobile: c.mobile, subject: c.subject, message: c.message,
              sendEmail: c.sendEmail, sendWhatsApp: c.sendWhatsApp, howEmail: c.howEmail, howWhatsApp: c.howWhatsApp,
              required: c.required, invalidMobile: c.invalidMobile,
            }}
          />
          <aside className="on-dark rounded p-8 md:p-10 lg:self-start">
            <h2 className="display-md">{c.detailsTitle}</h2>
            <p className="mt-6 text-forest-soft">{d.common.orgName}</p>
            <address className="mt-1 not-italic">{org.address}</address>
            <p className="mt-6 text-forest-soft">{c.phone}</p>
            <a href={`tel:+91${org.phone}`} className="tabular block font-display text-3xl text-gold-bright no-underline hover:underline">{org.phone}</a>
            {org.email ? (
              <>
                <p className="mt-6 text-forest-soft">{c.email}</p>
                <a href={`mailto:${org.email}`} className="block w-fit text-gold-bright underline">{org.email}</a>
              </>
            ) : null}
            <a href={`tel:+91${org.phone}`} className="btn btn-primary mt-8">{c.call}</a>
          </aside>
        </div>
      </section>
    </>
  );
}
