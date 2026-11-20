import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import type { Organisation } from "@/lib/types";
import { href, type RouteKey } from "@/lib/routes";
import { BrandMark } from "./BrandMark";

const links: RouteKey[] = ["temple", "architecture", "masterPlan", "activities", "environment", "journey", "gallery", "location", "organisation", "contact"];

export function Footer({ locale, dict, org }: { locale: Locale; dict: Dictionary; org: Organisation }) {
  return (
    <footer className="on-dark">
      <div className="container-x py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <BrandMark size={52} className="text-gold-bright" />
            <p className="mt-5 font-display text-3xl leading-tight">{dict.meta.siteName}</p>
            <p className="mt-2 font-display text-xl text-gold-bright">{dict.meta.tagline}</p>
            <p className="mt-8 text-forest-soft">{dict.common.initiativeOf}</p>
            <p className="text-lg">{dict.common.orgName}</p>
          </div>

          <dl className="grid content-start gap-3 text-[0.95rem]">
            <div><dt className="text-forest-soft">CIN</dt><dd className="tabular">{org.cin}</dd></div>
            <div><dt className="text-forest-soft">PAN</dt><dd className="tabular">{org.pan}</dd></div>
            <div><dt className="text-forest-soft">{dict.organisation.csr}</dt><dd className="tabular">{org.csr}</dd></div>
            <div><dt className="text-forest-soft">{dict.organisation.darpan}</dt><dd className="tabular">{org.darpan}</dd></div>
          </dl>

          <div className="grid content-start gap-5 text-[0.95rem]">
            <div>
              <p className="text-forest-soft">{dict.organisation.office}</p>
              <address className="not-italic">{org.address}</address>
            </div>
            <div>
              <p className="text-forest-soft">{dict.organisation.contact}</p>
              <a href={`tel:+91${org.phone}`} className="tabular text-lg hover:text-gold-bright">{org.phone}</a>
              {org.email ? <a href={`mailto:${org.email}`} className="block hover:text-gold-bright">{org.email}</a> : null}
            </div>
          </div>
        </div>

        <nav aria-label={dict.footer.explore} className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-[rgb(243_236_220/0.16)] pt-8 text-[0.95rem]">
          {links.map((k) => (
            <Link key={k} href={href(locale, k)} className="no-underline hover:text-gold-bright">{dict.nav[k]}</Link>
          ))}
        </nav>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-forest-soft">
          <p>© {new Date().getFullYear()} {org.name}. {dict.footer.rights}</p>
          <Link href="/admin" className="no-underline hover:text-gold-bright">{dict.footer.admin}</Link>
        </div>
      </div>
    </footer>
  );
}
