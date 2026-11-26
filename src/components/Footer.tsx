import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import type { Organisation } from "@/lib/types";
import { href, type RouteKey } from "@/lib/routes";
import { BrandMark } from "./BrandMark";
import { Embers } from "./Embers";
import { TouchSurface } from "./painting/TouchSurface";
import { Stars } from "./painting/scenery";

// Until the founding membership page exists, the call opens the contact page (same as Home).
const FOUNDING_ROUTE: RouteKey = "contact";
const HERO_SRCSET = [828, 1280, 1920].map((w) => `/art/hero/radha-krishna-${w}.webp ${w}w`).join(", ");

const links: RouteKey[] = ["temple", "architecture", "masterPlan", "activities", "environment", "journey", "gallery", "location", "organisation", "contact", "donate"];

export function Footer({ locale, dict, org }: { locale: Locale; dict: Dictionary; org: Organisation }) {
  return (
    <footer className="on-dark relative isolate overflow-x-clip bg-[linear-gradient(180deg,#101b29_0%,#0d1622_55%,#0b131d_100%)]">
      <div aria-hidden className="footer-ridge" />
      {/* A second hero: every page closes on the night scene, Radha-Krishna in the moonlight, and the invitation. */}
      <Stars className="absolute inset-x-0 top-0 h-[70%] w-full opacity-70" count={80} seed={31} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[62svh] overflow-hidden opacity-45 lg:left-auto lg:h-[100svh] lg:w-[58%] lg:opacity-80">
        {/* eslint-disable-next-line @next/next/no-img-element -- local art */}
        <img
          src="/art/hero/radha-krishna-1280.webp"
          srcSet={HERO_SRCSET}
          sizes="(min-width: 1024px) 58vw, 100vw"
          alt=""
          width={1920}
          height={1298}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-[50%_25%] [filter:brightness(0.7)_saturate(0.85)]"
          style={{ maskImage: "radial-gradient(70% 70% at 60% 45%, #000 30%, transparent 78%), linear-gradient(180deg, transparent 0%, #000 22%)", maskComposite: "intersect", WebkitMaskComposite: "source-in" }}
        />
      </div>
      <TouchSurface />
      <Embers className="absolute inset-0 h-full w-full" density={0.3} />

      <div className="container-x relative z-10 flex min-h-[86svh] flex-col justify-end pb-16 pt-[34svh] lg:justify-center lg:pb-24 lg:pt-24">
        <div className="max-w-[32rem] text-center lg:ml-[4%]">
          <BrandMark size={58} className="mx-auto text-[#e2c486]" />
          <p className="mt-4 font-display text-lg italic text-gold-pale">{dict.meta.siteName}</p>
          <h2 data-reveal className="display-xl mt-3 text-balance [text-shadow:0_2px_18px_rgb(0_0_0/0.45)]">{dict.home.visitTitle}</h2>
          <p data-reveal className="mx-auto mt-5 max-w-[34ch] text-lg text-forest-soft">{dict.home.visitBody}</p>
          <div data-reveal className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={href(locale, FOUNDING_ROUTE)} className="btn btn-primary">{dict.nav.founding}</Link>
            <Link href={href(locale, "donate")} className="btn btn-quiet bg-[rgb(16_27_41/0.45)] backdrop-blur-sm">{dict.nav.donate}</Link>
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
