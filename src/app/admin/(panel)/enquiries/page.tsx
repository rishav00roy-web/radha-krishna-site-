import { createSessionClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { setEnquiryStatus } from "../../actions";

type Enquiry = { id: string; name: string; email: string; mobile: string; subject: string; message: string; status: "new" | "in_progress" | "closed"; locale: string; created_at: string };
const statuses = ["new", "in_progress", "closed"] as const;

export default async function Enquiries({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole("admin");
  const { status } = await searchParams;
  const db = await createSessionClient();
  let q = db.from("enquiries").select("*").order("created_at", { ascending: false }).limit(200);
  if (status && (statuses as readonly string[]).includes(status)) q = q.eq("status", status);
  const { data } = await q;
  const rows = (data ?? []) as Enquiry[];
  const fmt = (iso: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(iso));

  return (
    <div className="max-w-5xl">
      <h1 className="text-4xl">Enquiries</h1>
      <p className="mt-2 text-ink-soft">Messages sent through the contact form. Personal details: handle with care.</p>
      <nav aria-label="Filter" className="mt-6 flex flex-wrap gap-2">
        {[undefined, ...statuses].map((s) => (
          <a key={s ?? "all"} href={s ? `?status=${s}` : "?"} aria-current={status === s || (!status && !s) ? "true" : undefined} className="rounded-full border border-line px-4 py-1.5 no-underline aria-[current=true]:border-gold aria-[current=true]:bg-gold aria-[current=true]:text-[#fffaf0]">
            {s ? s.replace("_", " ") : "all"}
          </a>
        ))}
      </nav>
      <ul className="mt-8 grid gap-4">
        {rows.length === 0 ? <li className="rounded border border-dashed border-marble-3 p-8 text-center text-ink-soft">No enquiries.</li> : null}
        {rows.map((e) => (
          <li key={e.id} className="rounded border border-line bg-marble p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xl">{e.subject}</p>
                <p className="text-ink-soft">
                  {e.name} · <a className="text-gold underline" href={`mailto:${e.email}`}>{e.email}</a> · <a className="tabular text-gold underline" href={`tel:${e.mobile}`}>{e.mobile}</a>
                </p>
              </div>
              <p className="tabular text-sm text-ink-soft">{fmt(e.created_at)} · {e.locale}</p>
            </div>
            <p className="mt-4 whitespace-pre-line">{e.message}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {statuses.map((s) => (
                <form key={s} action={setEnquiryStatus.bind(null, e.id, s)}>
                  <button type="submit" aria-pressed={e.status === s} className="rounded-full border border-line px-3 py-1 text-sm transition-colors duration-150 hover:border-gold aria-pressed:border-gold aria-pressed:bg-gold aria-pressed:text-[#fffaf0]">
                    {s.replace("_", " ")}
                  </button>
                </form>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
