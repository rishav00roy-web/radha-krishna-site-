import Link from "next/link";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { href } from "@/lib/routes";
import { PageIntro } from "@/components/PageIntro";
import { Icon } from "@/components/Icon";
import { PhotoFigure } from "@/components/PhotoFigure";
import { photos } from "@/lib/content";
import type { IconKey } from "@/lib/types";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/temple", d.temple.title, d.temple.intro);
}

const icons: IconKey[] = ["diya", "hands", "book", "kalash", "gathering", "meditate"];

export default async function TemplePage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  return (
    <>
      <PageIntro art="temple" title={d.temple.title} intro={d.temple.intro} icon="lotus" />

      <section className="section">
        <div className="container-x grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-20">
          <PhotoFigure
            data-reveal
            photo={photos.radhaKrishnaRelief}
            locale={locale}
            credit={d.common.photoCredit}
            aspect="aspect-[4/5]"
            sizes="(min-width: 768px) 45vw, 100vw"
            className="md:sticky md:top-28 md:self-start"
          />
          <div>
            <h2 data-reveal className="display-lg">{d.temple.significanceTitle}</h2>
            {d.temple.significance.map((p) => (
              <p data-reveal key={p.slice(0, 24)} className="measure mt-6 text-lg text-ink-soft">{p}</p>
            ))}
            <div className="ornament-rule my-12" aria-hidden><Icon name="flute" size={36} /></div>
            <h2 data-reveal className="display-md">{d.temple.centresTitle}</h2>
            <ul className="mt-6">
              {d.temple.centres.map((c, i) => (
                <li key={c.title} data-reveal className="flex gap-5 border-t border-line py-6">
                  <Icon name={icons[i]} size={40} className="shrink-0 text-gold" />
                  <div>
                    <h3 className="text-2xl">{c.title}</h3>
                    <p className="mt-1 text-ink-soft">{c.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="on-dark section">
        <div className="container-x max-w-4xl text-center">
          <Icon name="hands" size={64} className="mx-auto text-gold-bright" />
          <h2 data-reveal className="display-lg mt-6">{d.temple.forTitle}</h2>
          <p data-reveal className="lede mx-auto mt-6 max-w-[56ch]">{d.temple.forBody}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href={href(locale, "architecture")} className="btn btn-primary">{d.nav.architecture}</Link>
            <Link href={href(locale, "activities")} className="btn btn-quiet">{d.nav.activities}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
