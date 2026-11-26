import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getGallery } from "@/lib/data";
import { galleryStrings, toGalleryView } from "@/lib/view";
import { PageIntro } from "@/components/PageIntro";
import { Gallery } from "@/components/Gallery";
import { CurtainSlider } from "@/components/anm";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/gallery", d.gallery.title, d.gallery.intro);
}

const FEATURED = [
  { src: "/art/hero/radha-krishna-1920.webp", alt: (d: Dictionary) => d.home.heroArt },
  { src: "/art/temple-concept.jpg", alt: (d: Dictionary) => d.home.templeArt },
  { src: "/art/hanging-diya.jpg", alt: (d: Dictionary) => d.gallery.featured[2].title },
  { src: "/art/peacock-feather.jpg", alt: (d: Dictionary) => d.gallery.featured[3].title },
];

export default async function GalleryPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  const items = getGallery();
  return (
    <>
      <PageIntro art="radhaKrishna" title={d.gallery.title} intro={d.gallery.intro} icon="feather" />
      {/* The temple's own artwork in a curtain slider (arrows, drag or keyboard), ahead of the stock photos. */}
      <section className="section !pb-0" data-no-reveal>
        <div className="container-x">
          <h2 className="display-md mb-6">{d.gallery.featuredTitle}</h2>
          <div className="overflow-hidden rounded-sm">
            <CurtainSlider
              images={FEATURED.map((f, i) => ({ src: f.src, alt: f.alt(d), title: d.gallery.featured[i].title, label: d.gallery.featured[i].label }))}
            />
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container-x">
          <Gallery items={toGalleryView(items, locale)} categories={d.gallery.categories} strings={galleryStrings(d)} />
        </div>
      </section>
    </>
  );
}
