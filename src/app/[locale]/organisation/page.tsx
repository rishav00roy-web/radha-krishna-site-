import Image from "next/image";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getMedia, getOrganisation } from "@/lib/data";
import { PageIntro } from "@/components/PageIntro";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/organisation", d.organisation.title, d.organisation.intro);
}

export default async function OrganisationPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  const [org, media] = await Promise.all([getOrganisation(), getMedia()]);
  const rows: [string, string][] = [
    [d.organisation.cin, org.cin],
    [d.organisation.pan, org.pan],
    [d.organisation.csr, org.csr],
    [d.organisation.darpan, org.darpan],
  ];

  return (
    <>
      <PageIntro title={d.organisation.title} intro={d.organisation.intro} icon="hands" />
      <section className="section">
        <div className="container-x grid gap-14 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-20">
          <div>
            <div className="grid aspect-square w-full max-w-[280px] place-items-center overflow-hidden rounded border border-line bg-marble-2">
              {media.logo ? (
                <Image src={media.logo} alt={`${org.name} logo`} width={280} height={280} className="h-full w-full object-contain p-6" />
              ) : (
                <div className="p-6 text-center">
                  <p className="font-display text-5xl text-gold">{org.short_name}</p>
                  <p className="mt-3 text-sm text-ink-soft">{d.common.placeholder}</p>
                </div>
              )}
            </div>
            <h2 className="display-md mt-8">{org.name} ({org.short_name})</h2>
            <p className="mt-2 text-ink-soft">{d.organisation.legalForm}</p>
          </div>

          <div className="grid gap-12">
            <div>
              <h2 className="text-2xl">{d.organisation.registrations}</h2>
              <dl className="mt-4 divide-y divide-[var(--line)] border-y border-line">
                {rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-4 py-3.5">
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className="tabular">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="grid gap-10 sm:grid-cols-2">
              <div>
                <h2 className="text-2xl">{d.organisation.office}</h2>
                <address className="mt-3 not-italic text-ink-soft">{org.address}</address>
              </div>
              <div>
                <h2 className="text-2xl">{d.organisation.contact}</h2>
                <a href={`tel:+91${org.phone}`} className="tabular mt-3 inline-block text-lg text-gold underline">{org.phone}</a>
                {org.email ? <a href={`mailto:${org.email}`} className="block text-gold underline">{org.email}</a> : null}
              </div>
            </div>
            <div className="rounded bg-marble-2 p-7">
              <h2 className="text-2xl">{d.organisation.leadership}</h2>
              <p className="mt-3 font-display text-3xl">{org.leader_name}</p>
              <p className="text-ink-soft">{org.leader_title}, {org.name}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
