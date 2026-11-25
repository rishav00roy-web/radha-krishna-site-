import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { photos, type PhotoKey } from "@/lib/content";
import { PageIntro } from "@/components/PageIntro";
import { PhotoFigure } from "@/components/PhotoFigure";
import { Icon } from "@/components/Icon";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/environment", d.environment.title, d.environment.intro);
}

const sectionPhoto: Record<string, PhotoKey> = {
  gaushala: "cow",
  trees: "tree",
  bamboo: "bambooPath",
  medicinal: "tulsi",
  fruit: "mangoes",
  water: "lotusPond",
};

export default async function EnvironmentPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);

  return (
    <>
      <PageIntro art="lotus" title={d.environment.title} intro={d.environment.intro} icon="cow" />
      <section className="section">
        <div className="container-x grid gap-16 md:gap-24">
          {d.environment.sections.map((s, i) => {
            return (
              <article key={s.key} id={s.key} data-reveal className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
                <PhotoFigure
                  photo={photos[sectionPhoto[s.key]]}
                  locale={locale}
                  credit={d.common.photoCredit}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className={i % 2 ? "md:order-2" : ""}
                />
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="display-md">{s.title}</h2>
                    <span className="proposed-tag">{d.common.proposed}</span>
                  </div>
                  <p className="measure mt-4 text-lg text-ink-soft">{s.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="on-dark section">
        <div className="container-x [&>*]:max-w-4xl">
          <Icon name="tree" size={56} className="text-gold-bright" />
          <h2 data-reveal className="display-lg mt-6">{d.environment.visionTitle}</h2>
          <p data-reveal className="lede mt-6 max-w-[60ch]">{d.environment.visionBody}</p>
        </div>
      </section>
    </>
  );
}
