import Link from "next/link";
import { components, statusLabel } from "@/showcase/meta";

const tone: Record<string, string> = {
  "in-use": "bg-[#1f4d2c] text-[#eaf6ec]",
  passed: "bg-[#e3efe2] text-[#1f4d2c]",
  fix: "bg-[#fbefd2] text-[#7a5410]",
  failed: "bg-[#f7dede] text-[#8a2323]",
  untested: "bg-marble-3 text-ink-soft",
};

export default function ShowcaseIndex() {
  return (
    <main className="container-x py-14 md:py-20">
      <p className="font-display text-xl text-gold">Prem Mandir · private</p>
      <h1 className="display-lg mt-2">Annnimate components</h1>
      <p className="lede measure mt-4">All 21 components from the starter pack, running live with the mandir&apos;s own artwork in place of the demo photos. Open one, try it on your computer and on your phone, and tell me which ones you like. The words inside each demo are still the pack&apos;s sample text.</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {components.map((c, i) => (
          <li key={c.slug}>
            <Link href={`/showcase/${c.slug}`} className="group flex h-full flex-col rounded-xl border border-line bg-marble-2 p-5 no-underline transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-18px_rgb(42_33_24/0.45)]">
              <span className="tabular text-sm text-ink-soft">{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-1 font-display text-2xl text-ink group-hover:text-gold">{c.name}</span>
              <span className="mt-2 flex-1 text-[0.95rem] text-ink-soft">{c.note}</span>
              <span className={`mt-4 w-max rounded-full px-3 py-1 text-xs font-medium ${tone[c.status]}`}>{(statusLabel as Record<string,string>)[c.status]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
