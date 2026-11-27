import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { pageMetadata } from "@/lib/seo";
import { getOrganisation } from "@/lib/data";
import { href } from "@/lib/routes";
import { PageIntro } from "@/components/PageIntro";
import { Icon } from "@/components/Icon";
import { MemberForm } from "@/components/MemberForm";
import type { IconKey } from "@/lib/types";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, "/founding-members", d.members.title, d.members.intro);
}

const MODEL_ICONS: IconKey[] = ["tree", "temple", "hands"];

/** The founding-member programme from GGF's concept note. Every figure is indicative; nothing is paid here. */
export default async function FoundingMembersPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const d = getDictionary(locale);
  const org = getOrganisation();
  const m = d.members;

  return (
    <>
      <PageIntro art="temple" title={m.title} intro={m.intro} icon="lotus">
        <dl data-intro-line className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          {m.facts.map((f) => (
            <div key={f.label}>
              <dt className="text-sm text-forest-soft">{f.label}</dt>
              <dd className="mt-0.5 font-display text-xl text-gold-pale">{f.value}</dd>
            </div>
          ))}
        </dl>
        <a data-intro-line href="#register" className="btn btn-primary mt-8">{m.register}</a>
      </PageIntro>

      {/* How it works: buy about 5 bighas, give 1 katha to the temple and 1 to family homes. */}
      <section className="section" aria-labelledby="model">
        <div className="container-x">
          <h2 id="model" data-reveal className="display-lg text-center">{m.modelTitle}</h2>
          <div className="ornament-rule mx-auto mt-6 max-w-xs" aria-hidden><Icon name="lotus" size={30} /></div>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {m.model.map((s, i) => (
              <li key={s.title} data-reveal className="relative rounded border border-gold/40 bg-marble-2 p-7">
                <span aria-hidden className="tabular absolute right-6 top-5 font-display text-4xl text-gold/30">{i + 1}</span>
                <Icon name={MODEL_ICONS[i] ?? "lotus"} size={40} className="text-gold" />
                <h3 className="mt-5 text-2xl leading-snug">{s.title}</h3>
                <p className="mt-2 text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
          <p data-reveal className="measure mx-auto mt-8 text-center text-ink-soft">{m.modelNote}</p>
        </div>
      </section>

      {/* Indicative investment beside the two families each member supports. */}
      <section className="section bg-marble-2 !pt-0 md:!pt-0">
        <div className="container-x grid gap-8 pt-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10 lg:pt-20">
          <article data-reveal className="on-dark plaque rounded p-7 sm:p-10">
            <div className="flex items-center gap-4">
              <Icon name="kalash" size={40} className="shrink-0 text-gold-bright" />
              <h2 className="display-md">{m.investTitle}</h2>
            </div>
            <table className="mt-7 w-full text-left">
              <tbody>
                {m.invest.map((r) => (
                  <tr key={r.item} className="border-b border-[rgb(243_236_220/0.14)]">
                    <th scope="row" className="py-3.5 pr-4 font-normal text-forest-soft">{r.item}</th>
                    <td className="tabular whitespace-nowrap py-3.5 text-right text-lg">{r.amount}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" className="pt-5 pr-4 text-left font-display text-xl font-normal text-gold-pale">{m.investTotal}</th>
                  <td className="tabular whitespace-nowrap pt-5 text-right font-display text-3xl text-gold-bright">{m.investTotalAmount}</td>
                </tr>
              </tfoot>
            </table>
            <p className="mt-6 border-t border-[rgb(212_169_73/0.3)] pt-5 text-sm text-gold-pale">{m.investNote}</p>
          </article>

          <article data-reveal className="flex flex-col rounded border border-gold/40 bg-marble p-7 sm:p-10">
            <div className="flex items-center gap-4">
              <Icon name="hands" size={40} className="shrink-0 text-gold" />
              <h2 className="display-md">{m.familiesTitle}</h2>
            </div>
            <p className="mt-4 text-ink-soft">{m.familiesBody}</p>
            <ul className="mt-6 grid gap-3">
              {m.families.map((x) => (
                <li key={x} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* Organic farming, then the mission line. */}
      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <Icon name="herb" size={44} className="text-gold" />
            <h2 data-reveal className="display-lg mt-5">{m.farmTitle}</h2>
            <p data-reveal className="lede measure mt-5">{m.farmBody}</p>
          </div>
          <ul className="grid content-start gap-x-8 gap-y-4 sm:grid-cols-2">
            {m.farm.map((x) => (
              <li key={x} data-reveal className="border-l border-gold/40 pl-4 text-[1.05rem]">{x}</li>
            ))}
          </ul>
        </div>
        <figure className="container-x mt-16 text-center md:mt-24">
          <figcaption className="font-display text-xl italic text-gold">{m.missionLabel}</figcaption>
          <blockquote data-reveal className="mx-auto mt-4 max-w-[34ch] font-display text-3xl leading-snug md:text-[2.4rem]">{m.mission}</blockquote>
        </figure>
      </section>

      {/* What happens next, with the sign-up form. */}
      <section id="register" className="section scroll-mt-20 bg-marble-2">
        <div className="container-x grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20">
          <div>
            <h2 data-reveal className="display-md">{m.stepsTitle}</h2>
            <ol className="mt-8 grid gap-6">
              {m.steps.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                  <span aria-hidden className="tabular grid h-10 w-10 place-items-center rounded-full border border-gold font-display text-lg text-gold">{i + 1}</span>
                  <div>
                    <h3 className="text-xl leading-snug">{s.title}</h3>
                    <p className="mt-1 text-ink-soft">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 data-reveal className="display-md">{m.formTitle}</h2>
            <p className="measure mt-3 text-ink-soft">{m.formBody}</p>
            <div className="mt-8">
              <MemberForm
                locale={locale}
                to={org.email}
                whatsapp={org.whatsapp}
                strings={{
                  name: m.name, mobile: m.mobile, email: m.email, emailHint: m.emailHint, place: m.place, visit: m.visit, note: m.note,
                  required: m.required, invalidMobile: m.invalidMobile, invalidEmail: m.invalidEmail,
                  sendEmail: m.sendEmail, sendWhatsApp: m.sendWhatsApp, howEmail: m.howEmail, howWhatsApp: m.howWhatsApp,
                  ...d.forms,
                }}
              />
            </div>
            <p className="mt-8 border-t border-line pt-5 text-sm text-ink-soft">{m.honesty}</p>
          </div>
        </div>
      </section>

      {/* Donation, second. */}
      <section className="on-dark">
        <div className="container-x flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
          <div>
            <h2 className="display-md">{m.donateTitle}</h2>
            <p className="mt-3 max-w-[54ch] text-forest-soft">{m.donateBody}</p>
          </div>
          <Link href={href(locale, "donate")} className="btn btn-quiet shrink-0">{m.donateCta}</Link>
        </div>
      </section>
    </>
  );
}
