import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import type { Organisation } from "@/lib/types";
import { href, type RouteKey } from "@/lib/routes";
import { BrandMark } from "./BrandMark";

const links: RouteKey[] = ["temple", "architecture", "masterPlan", "activities", "environment", "journey", "gallery", "location", "organisation", "contact", "donate"];

export function Footer({ locale, dict, org }: { locale: Locale; dict: Dictionary; org: Organisation }) {
  return (
    <footer className="on-dark">
      <div className="container-x py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="flex items-start gap-4">
            <BrandMark size={44} className="shrink-0 text-gold-bright" />
            <div>
              <p className="font-display text-2xl leading-tight">{dict.meta.siteName}</p>
              <p className="mt-2 text-sm text-forest-soft">{dict.common.initiativeOf} {dict.common.orgName}</p>
            </div>
          </div>

          <div className="grid content-start gap-4 text-[0.95rem]">
            <address className="not-italic text-forest-soft">{org.address}</address>
            <div>
              <a href={`tel:+91${org.phone}`} className="tabular text-lg hover:text-gold-bright">{org.phone}</a>
              {org.email ? <a href={`mailto:${org.email}`} className="block hover:text-gold-bright">{org.email}</a> : null}
            </div>
          </div>

          <nav aria-label={dict.footer.explore} className="grid grid-cols-2 content-start gap-x-6 gap-y-2 text-[0.95rem]">
            {links.map((k) => (
              <Link key={k} href={href(locale, k)} className="no-underline hover:text-gold-bright">{dict.nav[k]}</Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 border-t border-[rgb(243_236_220/0.16)] pt-6 text-xs leading-relaxed text-forest-soft">
          <dl className="flex flex-wrap gap-x-5 gap-y-1">
            <div className="flex gap-1.5"><dt>CIN</dt><dd className="tabular">{org.cin}</dd></div>
            <div className="flex gap-1.5"><dt>PAN</dt><dd className="tabular">{org.pan}</dd></div>
            <div className="flex gap-1.5"><dt>{dict.organisation.csr}</dt><dd className="tabular">{org.csr}</dd></div>
            <div className="flex gap-1.5"><dt>{dict.organisation.darpan}</dt><dd className="tabular">{org.darpan}</dd></div>
          </dl>
          <p className="mt-3">© {new Date().getFullYear()} {org.name}. {dict.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
