import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, t, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getUpdate } from "@/lib/data";
import { formatDate } from "@/lib/view";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const u = getUpdate(slug);
  if (!u) return {};
  return pageMetadata(locale, `/journey/updates/${slug}`, t(u.title, locale), t(u.excerpt, locale));
}

export default async function UpdatePage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const d = getDictionary(locale);
  const u = getUpdate(slug);
  if (!u) notFound();
  return (
    <article className="pb-24 pt-20 md:pt-24">
      <div className="container-x max-w-3xl">
        <Link href={`/${locale}/journey#updates`} className="text-gold underline">{d.common.back}</Link>
        <p className="tabular mt-8 text-sm text-ink-soft">{formatDate(u.published_at, locale)}</p>
        <h1 className="display-lg mt-2">{t(u.title, locale)}</h1>
        <p className="lede mt-5">{t(u.excerpt, locale)}</p>
        <div className="mt-10 whitespace-pre-line text-lg leading-relaxed">{t(u.body, locale)}</div>
      </div>
    </article>
  );
}
