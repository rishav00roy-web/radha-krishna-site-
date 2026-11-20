import type { IconKey } from "@/lib/types";
import { Icon } from "./Icon";

/** Shared opening band for inner pages. Left-aligned heading, one sentence of lede. */
export function PageIntro({ title, intro, icon, children }: { title: string; intro: string; icon?: IconKey; children?: React.ReactNode }) {
  return (
    <section className="on-dark relative overflow-hidden pb-16 pt-[calc(72px+4.5rem)] md:pb-24">
      <svg aria-hidden viewBox="0 0 600 600" className="pointer-events-none absolute -right-24 top-6 h-[520px] w-[520px] text-gold-bright opacity-[0.08]">
        {[0, 30, 60, 90, 120, 150].map((r) => (
          <ellipse key={r} cx="300" cy="300" rx="280" ry="90" transform={`rotate(${r} 300 300)`} fill="none" stroke="currentColor" />
        ))}
        <circle cx="300" cy="300" r="60" fill="none" stroke="currentColor" />
      </svg>
      <div className="container-x relative">
        {icon ? <Icon name={icon} size={52} className="mb-6 text-gold-bright" /> : null}
        <h1 className="display-lg max-w-[18ch]">{title}</h1>
        <p className="lede measure mt-6">{intro}</p>
        {children}
      </div>
    </section>
  );
}
