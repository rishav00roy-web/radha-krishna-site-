import Link from "next/link";
import { notFound } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { isResource, resources } from "@/lib/admin/resources";
import { toIstInput } from "@/lib/admin/time";
import { RecordForm } from "@/components/admin/RecordForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteRecord, saveRecord } from "../../../actions";
import type { Role } from "@/lib/types";

export default async function EditRecord({ params, searchParams }: { params: Promise<{ resource: string; id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { resource, id } = await params;
  const { saved } = await searchParams;
  if (!isResource(resource)) notFound();
  const res = resources[resource];
  await requireRole(res.minRole as Role);

  let values: Record<string, unknown> = { published: true, status: undefined };
  if (id !== "new") {
    const db = await createSessionClient();
    const { data } = await db.from(res.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    values = { ...data };
  }
  for (const f of res.fields) if (f.type === "datetime") values[f.name] = toIstInput(values[f.name] as string | null);

  return (
    <div className="max-w-5xl">
      <Link href={`/admin/${resource}`} className="text-gold underline">← {res.label}</Link>
      <h1 className="mt-3 text-4xl">{id === "new" ? `Add ${res.singular}` : `Edit ${res.singular}`}</h1>
      {res.help ? <p className="mt-2 max-w-[70ch] text-ink-soft">{res.help}</p> : null}
      <div className="mt-8 rounded border border-line bg-marble p-6">
        <RecordForm fields={res.fields} values={values} action={saveRecord.bind(null, resource, id)} initialOk={saved ? "Saved. The public site is updated." : undefined} />
      </div>
      {id !== "new" ? (
        <form action={deleteRecord.bind(null, resource, id)} className="mt-6">
          <DeleteButton label={`Delete this ${res.singular}`} />
        </form>
      ) : null}
    </div>
  );
}
