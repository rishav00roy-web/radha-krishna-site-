import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getGallery } from "@/lib/data";
import { PageIntro } from "@/components/PageIntro";
import { Placeholder } from "@/components/Placeholder";
import { Icon } from "@/components/Icon";
import type { GalleryCategory, IconKey } from "@/lib/types";
import Image from "next/image";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/environment", d.environment.title, d.environment.intro);
}

const meta: Record<string, { icon: IconKey; cat: GalleryCategory | null }> = {
  gaushala: { icon: "cow", cat: "gaushala" },
  trees: { icon: "tree", cat: null },
  bamboo: { icon: "bamboo", cat: "bamboo" },
  medicinal: { icon: "herb", cat: "medicinal" },
  fruit: { icon: "fruit", cat: "fruit" },
  water: { icon: "water", cat: "sarovar" },
};

export default async function EnvironmentPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  const gallery = await getGallery();
  const photoFor = (cat: GalleryCategory | null) =>
    cat ? gallery.find((g) => g.category === cat && !g.is_placeholder && g.media_type === "image" && g.url) : undefined;

  return (
    <>
      <PageIntro title={d.environment.title} intro={d.environment.intro} icon="cow" />
      <section className="section">
        <div className="container-x grid gap-16 md:gap-24">
          {d.environment.sections.map((s, i) => {
            const m = meta[s.key];
            const photo = photoFor(m.cat);
            return (
              <article key={s.key} id={s.key} data-reveal className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
                <div className={`aspect-[4/3] overflow-hidden rounded ${i % 2 ? "md:order-2" : ""}`}>
                  {photo?.url ? (
                    <div className="relative h-full w-full">
                      <Image src={photo.url} alt={s.title} fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
                    </div>
                  ) : (
                    <Placeholder icon={m.icon} label={s.title} note={d.common.placeholder} />
                  )}
                </div>
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
