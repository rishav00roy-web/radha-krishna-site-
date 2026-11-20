import Image from "next/image";
import type { Metadata } from "next";
import { isLocale, t, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getFacilities, getMedia } from "@/lib/data";
import { PageIntro } from "@/components/PageIntro";
import { MasterPlan } from "@/components/MasterPlan";
import { Placeholder } from "@/components/Placeholder";
import { StatusTag } from "@/components/ProposedTag";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/master-plan", d.masterPlan.title, d.masterPlan.intro);
}

export default async function MasterPlanPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  const [facilities, media] = await Promise.all([getFacilities(), getMedia()]);

  return (
    <>
      <PageIntro title={d.masterPlan.title} intro={d.masterPlan.intro} icon="kalash" />
      <section className="section !pt-12 md:!pt-16">
        <div className="container-x">
          <MasterPlan
            image={media.masterplan_image}
            facilities={facilities.map((f) => ({
              id: f.id, code: f.code, slug: f.slug, icon: f.icon, status: f.status, x: f.pos_x, y: f.pos_y,
              name: t(f.name, locale), summary: t(f.summary, locale), description: t(f.description, locale),
            }))}
            strings={{
              zoomIn: d.masterPlan.zoomIn, zoomOut: d.masterPlan.zoomOut, reset: d.masterPlan.reset,
              selectHint: d.masterPlan.selectHint, disclaimer: d.masterPlan.disclaimer,
              statusLabels: { proposed: d.common.proposed, under_construction: d.common.underConstruction, completed: d.common.completed },
            }}
          />
        </div>
      </section>

      <section className="section bg-marble-2">
        <div className="container-x">
          <h2 data-reveal className="display-lg">{d.masterPlan.facilitiesTitle}</h2>
          <ol className="mt-12 grid gap-12">
            {facilities.map((f, i) => (
              <li
                key={f.id}
                id={f.slug}
                data-reveal
                className="grid scroll-mt-28 items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-14"
              >
                <div className={`aspect-[3/2] overflow-hidden rounded ${i % 2 ? "md:order-2" : ""}`}>
                  {f.image_url ? (
                    <div className="relative h-full w-full">
                      <Image src={f.image_url} alt={t(f.name, locale)} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                    </div>
                  ) : (
                    <Placeholder icon={f.icon} label={t(f.name, locale)} note={d.common.placeholder} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="tabular grid h-9 w-9 place-items-center rounded-full border border-gold text-gold">{f.code}</span>
                    <StatusTag status={f.status} dict={d} />
                  </div>
                  <h3 className="display-md mt-4">{t(f.name, locale)}</h3>
                  <p className="mt-3 text-lg">{t(f.summary, locale)}</p>
                  <p className="measure mt-3 text-ink-soft">{t(f.description, locale)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
