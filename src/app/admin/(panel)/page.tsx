import Link from "next/link";
import { createSessionClient } from "@/lib/supabase/server";
import { can, requireRole, roleLabel } from "@/lib/auth";
import { resources } from "@/lib/admin/resources";
import type { Role } from "@/lib/types";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireRole("viewer");
  const { denied } = await searchParams;
  const db = await createSessionClient();

  const counts = await Promise.all(
    Object.entries(resources).map(async ([k, r]) => {
      const { count } = await db.from(r.table).select("id", { count: "exact", head: true });
      return { key: k, label: r.label, count: count ?? 0, min: r.minRole as Role };
    }),
  );
  const newEnquiries = can(user, "admin")
    ? (await db.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new")).count ?? 0
    : null;

  return (
    <div className="max-w-5xl">
      <h1 className="text-4xl">Welcome{user.name ? `, ${user.name}` : ""}</h1>
      <p className="mt-1 text-ink-soft">Signed in as {roleLabel[user.role]}.</p>
      {denied ? <p role="alert" className="mt-4 rounded-sm border border-[#b3261e] p-3 text-[#b3261e]">Your role does not have access to that section.</p> : null}

      {newEnquiries !== null ? (
        <Link href="/admin/enquiries" className="mt-8 flex items-center justify-between rounded border border-gold bg-marble p-6 no-underline transition-colors duration-150 hover:bg-gold-pale">
          <span className="text-xl">New enquiries</span>
          <span className="tabular font-display text-4xl text-gold">{newEnquiries}</span>
        </Link>
      ) : null}

      <ul className="mt-8 grid gap-px overflow-hidden rounded border border-line bg-[var(--line)] sm:grid-cols-2">
        {counts.map((c) => (
          <li key={c.key} className="bg-marble">
            {can(user, c.min) ? (
              <Link href={`/admin/${c.key}`} className="flex items-center justify-between p-5 no-underline transition-colors duration-150 hover:bg-marble-2">
                <span>{c.label}</span>
                <span className="tabular text-ink-soft">{c.count}</span>
              </Link>
            ) : (
              <div className="flex items-center justify-between p-5 text-ink-soft">
                <span>{c.label}</span>
                <span className="tabular">{c.count}</span>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded border border-line bg-marble p-6">
        <h2 className="text-2xl">Publishing rules</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-soft">
          <li>Keep every facility marked proposed until construction is complete and verified.</li>
          <li>Mark a progress stage as started or complete only with verification on record.</li>
          <li>Add map coordinates, directions and landmarks only once verified.</li>
          <li>Never publish approvals, land ownership or achievements that have not happened.</li>
        </ul>
      </div>
    </div>
  );
}
