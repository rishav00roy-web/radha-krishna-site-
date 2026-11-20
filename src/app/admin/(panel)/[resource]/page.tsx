import Link from "next/link";
import { notFound } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { isResource, resources } from "@/lib/admin/resources";
import type { Role } from "@/lib/types";

export default async function ResourceList({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<{ deleted?: string }> }) {
  const { resource } = await params;
  const { deleted } = await searchParams;
  if (!isResource(resource)) notFound();
  const res = resources[resource];
  await requireRole(res.minRole as Role);
  const db = await createSessionClient();
  const { data: rows, error } = await db.from(res.table).select("*").order(res.order.column, { ascending: res.order.ascending }).limit(500);

  const cell = (row: Record<string, unknown>, col: (typeof res.columns)[number]) => {
    const v = row[col.name];
    if (col.kind === "localized") return (v as { en?: string })?.en ?? "";
    if (col.kind === "boolean") return v ? "Yes" : "No";
    if (col.kind === "date" && v) return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(String(v)));
    return String(v ?? "").replace(/_/g, " ");
  };

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">{res.label}</h1>
          {res.help ? <p className="mt-2 max-w-[70ch] text-ink-soft">{res.help}</p> : null}
        </div>
        <Link href={`/admin/${resource}/new`} className="btn btn-primary">Add {res.singular}</Link>
      </div>
      {deleted ? <p role="status" className="mt-4 text-[#2e6b3f]">Deleted.</p> : null}
      {error ? <p role="alert" className="mt-4 text-[#b3261e]">Could not load: {error.message}</p> : null}

      <div className="mt-8 overflow-x-auto rounded border border-line bg-marble">
        <table className="w-full text-left text-[0.95rem]">
          <thead className="border-b border-line text-ink-soft">
            <tr>
              {res.columns.map((c) => <th key={c.name} scope="col" className="px-4 py-3 font-normal">{c.label}</th>)}
              <th scope="col" className="px-4 py-3"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody className="tabular">
            {(rows ?? []).length === 0 ? (
              <tr><td colSpan={res.columns.length + 1} className="px-4 py-10 text-center text-ink-soft">Nothing here yet. Use “Add {res.singular}” to create the first one.</td></tr>
            ) : (
              (rows ?? []).map((row) => (
                <tr key={row.id} className="border-b border-line last:border-0 hover:bg-marble-2">
                  {res.columns.map((c) => <td key={c.name} className="max-w-[360px] truncate px-4 py-3">{cell(row, c)}</td>)}
                  <td className="px-4 py-3 text-right"><Link href={`/admin/${resource}/${row.id}`} className="text-gold underline">Edit</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
