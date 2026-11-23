import type { IconKey } from "@/lib/types";
import { Icon } from "./Icon";
import { Petals } from "./Petals";
import { Embers } from "./Embers";
import { Mist, Rays } from "./home/art";

/**
 * Shared opening band for inner pages, in the homepage's night palette:
 * soft rays, rising embers, drifting petals, and mist melting into the page.
 */
export function PageIntro({
  title,
  intro,
  icon,
  children,
}: {
  title: string;
  intro: string;
  icon?: IconKey;
  children?: React.ReactNode;
}) {
  return (
    <section data-parallax className="on-dark relative isolate overflow-hidden pb-24 pt-[calc(72px+4.5rem)] md:pb-28">
      <Rays className="pointer-events-none absolute inset-0 h-full w-full opacity-50" />
      <svg data-speed="0.25" aria-hidden viewBox="0 0 600 600" className="pointer-events-none absolute -right-24 top-6 h-[520px] w-[520px] text-gold-bright opacity-[0.08]">
        {[0, 30, 60, 90, 120, 150].map((r) => (
          <ellipse key={r} cx="300" cy="300" rx="280" ry="90" transform={`rotate(${r} 300 300)`} fill="none" stroke="currentColor" />
        ))}
        <circle cx="300" cy="300" r="60" fill="none" stroke="currentColor" />
      </svg>
      <Embers className="absolute inset-0 h-full w-full" density={0.7} />
      <Petals />
      <div data-speed="-0.2" className="container-x relative z-10">
        {icon ? <span data-intro-line className="block"><Icon name={icon} size={52} className="mb-6 text-gold-bright" /></span> : null}
        <h1 data-intro-line className="display-lg max-w-[18ch]">{title}</h1>
        <p data-intro-line className="lede measure mt-6">{intro}</p>
        {children}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-24 md:h-28">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgb(251_248_242/0.35)_60%,var(--marble)_100%)]" />
        <Mist className="absolute inset-0 h-full w-full" color="#fbf8f2" />
      </div>
    </section>
  );
}
