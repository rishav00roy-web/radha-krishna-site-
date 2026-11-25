import Link from "next/link";
import { notFound } from "next/navigation";
import { components, statusLabel } from "@/showcase/meta";
import Demo from "@/showcase/Demo";

export function generateStaticParams() {
  return components.map((c) => ({ name: c.slug }));
}

export default async function ShowcaseItem({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const i = components.findIndex((c) => c.slug === name);
  if (i < 0) notFound();
  const c = components[i];
  const next = components[(i + 1) % components.length];
  return (
    <>
      {/* A small bar that stays out of the demo's way. */}
      <div className="sticky top-0 z-[100] flex items-center gap-3 border-b border-line bg-marble/95 px-4 py-2 text-sm backdrop-blur">
        <Link href="/showcase" className="text-ink no-underline hover:text-gold">← All</Link>
        <span className="font-display text-lg">{c.name}</span>
        <span className="hidden text-ink-soft sm:inline">· {(statusLabel as Record<string,string>)[c.status]}</span>
        <Link href={`/showcase/${next.slug}`} className="ml-auto text-ink no-underline hover:text-gold">Next: {next.name} →</Link>
      </div>
      <Demo slug={c.slug} />
    </>
  );
}
