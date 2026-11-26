import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getGallery } from "@/lib/data";
import { galleryStrings, toGalleryView } from "@/lib/view";
import { PageIntro } from "@/components/PageIntro";
import { Gallery } from "@/components/Gallery";
import { Icon } from "@/components/Icon";
import type { IconKey } from "@/lib/types";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/architecture", d.architecture.title, d.architecture.intro);
}

const icons: IconKey[] = ["temple", "kalash", "diya", "gathering", "drum", "lotus", "feather", "hands", "meditate", "tree"];

export default async function ArchitecturePage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  const items = (getGallery()).filter((g) => g.category === "architecture");

  return (
    <>
      <PageIntro art="temple" title={d.architecture.title} intro={d.architecture.intro} icon="temple" />

      <section className="section">
        <div className="container-x">
          <ol className="grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {d.architecture.features.map((f, i) => (
              <li key={f.title} data-reveal className={`border-t border-line py-8 ${i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}`}>
                <Icon name={icons[i]} size={i === 0 ? 64 : 40} className="text-gold" />
                <h2 className={`mt-4 ${i === 0 ? "display-md" : "text-2xl"}`}>{f.title}</h2>
                <p className="mt-2 text-ink-soft">{f.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-marble-2">
        <div className="container-x">
          <h2 data-reveal className="display-lg mb-10">{d.architecture.galleryTitle}</h2>
          <Gallery items={toGalleryView(items, locale)} categories={d.gallery.categories} strings={galleryStrings(d)} showFilters={false} />
        </div>
      </section>
    </>
  );
}
