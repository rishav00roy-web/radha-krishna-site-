import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import type { Organisation } from "@/lib/types";
import { href, type RouteKey } from "@/lib/routes";
import { BrandMark } from "./BrandMark";
import { Embers } from "./Embers";
import { TouchSurface } from "./painting/TouchSurface";

// Until the founding membership page exists, the call opens the contact page (same as Home).
const FOUNDING_ROUTE: RouteKey = "contact";

const links: RouteKey[] = ["temple", "architecture", "masterPlan", "activities", "environment", "journey", "gallery", "location", "organisation", "contact", "donate"];

export function Footer({ locale, dict, org }: { locale: Locale; dict: Dictionary; org: Organisation }) {
  return (
    <footer className="on-dark relative isolate overflow-x-clip bg-[linear-gradient(180deg,#101b29_0%,#0a1424_40%,#08101c_100%)]">
      <div aria-hidden className="footer-ridge" />
      {/* A second hero: every page closes at the temple ghat by night (Rishav's art), with the invitation. */}
      <div className="relative">
        <picture>
          <source media="(max-width: 767px)" srcSet="/art/footer/ghat-tall-720.webp 720w, /art/footer/ghat-tall-1080.webp 1080w" sizes="100vw" />
          <img
            src="/art/footer/ghat-wide-1600.webp"
            srcSet="/art/footer/ghat-wide-1600.webp 1600w, /art/footer/ghat-wide-2400.webp 2400w"
            sizes="100vw"
            alt=""
            aria-hidden
            width={1600}
            height={679}
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[60%_0%] md:object-[85%_50%]"
            style={{ maskImage: "linear-gradient(180deg, transparent 0%, #000 12%, #000 82%, transparent 100%)" }}
          />
        </picture>
        <TouchSurface />
        <Embers className="absolute inset-0 h-full w-full" density={0.25} />

        <div className="container-x relative z-10 flex min-h-[96svh] flex-col justify-end pb-14 pt-[56svh] md:min-h-[86svh] lg:justify-center lg:pb-24 lg:pt-24">
          <div className="max-w-[32rem] text-center md:text-left lg:ml-[2%]">
            <BrandMark size={58} className="mx-auto text-[#e2c486] md:mx-0" />
            <p className="mt-4 font-display text-lg italic text-gold-pale">{dict.meta.siteName}</p>
            <h2 data-reveal className="display-xl mt-3 text-balance [text-shadow:0_2px_18px_rgb(0_0_0/0.5)]">{dict.home.visitTitle}</h2>
            <p data-reveal className="mt-5 max-w-[34ch] text-lg text-forest-soft max-md:mx-auto">{dict.home.visitBody}</p>
            <div data-reveal className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link href={href(locale, FOUNDING_ROUTE)} className="btn btn-primary">{dict.nav.founding}</Link>
              <Link href={href(locale, "donate")} className="btn btn-quiet bg-[rgb(16_27_41/0.45)] backdrop-blur-sm">{dict.nav.donate}</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x relative z-10 border-t border-[rgb(243_236_220/0.14)] pb-28 pt-12 md:pt-14">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="flex items-start gap-4">
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
