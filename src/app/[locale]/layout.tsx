import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontClasses } from "../fonts";
import { htmlLang, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getOrganisation } from "@/lib/data";
import { siteUrl } from "@/lib/seo";
import { LotusMenu } from "@/components/LotusMenu";
import { Footer } from "@/components/Footer";
import { Motion } from "@/components/Motion";


export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#17301f", width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${dict.meta.siteName} | ${dict.meta.tagline}`, template: `%s | ${dict.meta.siteName}` },
    description: dict.meta.description,
    applicationName: dict.meta.siteName,
    icons: { icon: "/icon.svg" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const org = getOrganisation();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NGO",
        name: org.name,
        alternateName: org.short_name,
        telephone: `+91${org.phone}`,
        address: { "@type": "PostalAddress", streetAddress: org.address, addressRegion: "Assam", addressCountry: "IN" },
        identifier: [
          { "@type": "PropertyValue", propertyID: "CIN", value: org.cin },
          { "@type": "PropertyValue", propertyID: "NGO Darpan", value: org.darpan },
        ],
      },
      { "@type": "WebSite", name: dict.meta.siteName, url: `${siteUrl}/${locale}`, inLanguage: htmlLang[locale] },
    ],
  };

  return (
    <html lang={htmlLang[locale]} className={fontClasses[locale]}>
      <body>
        <LotusMenu locale={locale} dict={dict} />
        <main id="main">{children}</main>
        <Footer locale={locale} dict={dict} org={org} />
        <Motion />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
