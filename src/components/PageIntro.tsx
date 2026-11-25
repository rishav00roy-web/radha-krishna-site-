import type { IconKey } from "@/lib/types";
import { Icon } from "./Icon";
import { Embers } from "./Embers";
import { Mist, Rays } from "./home/art";
import { MaskWords } from "./MaskWords";

/**
 * Shared opening band for inner pages, in the homepage's night palette:
 * soft rays, a few rising embers, and mist melting into the page. Kept quiet on purpose.
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
    <section data-parallax className="on-dark relative isolate overflow-hidden pb-24 pt-24 md:pt-28 md:pb-28">
      <Rays className="pointer-events-none absolute inset-0 h-full w-full opacity-50" />
      <Embers className="absolute inset-0 h-full w-full" density={0.45} />
      <div data-speed="-0.2" className="container-x relative z-10">
        {icon ? <span data-intro-line className="block"><Icon name={icon} size={52} className="mb-6 text-gold-bright" /></span> : null}
        <h1 data-intro-title className="display-lg max-w-[18ch]"><MaskWords text={title} /></h1>
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
