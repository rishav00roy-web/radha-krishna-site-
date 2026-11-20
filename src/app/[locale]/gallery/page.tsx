import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getGallery } from "@/lib/data";
import { galleryStrings, toGalleryView } from "@/lib/view";
import { PageIntro } from "@/components/PageIntro";
import { Gallery } from "@/components/Gallery";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/gallery", d.gallery.title, d.gallery.intro);
}

export default async function GalleryPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  const items = await getGallery();
  return (
    <>
      <PageIntro title={d.gallery.title} intro={d.gallery.intro} icon="feather" />
      <section className="section">
        <div className="container-x">
          <Gallery items={toGalleryView(items, locale)} categories={d.gallery.categories} strings={galleryStrings(d)} />
        </div>
      </section>
    </>
  );
}
