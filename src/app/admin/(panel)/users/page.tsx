import { createSessionClient } from "@/lib/supabase/server";
import { requireRole, roleLabel } from "@/lib/auth";
import { setUserRole } from "../../actions";
import type { Role } from "@/lib/types";

const roles: Role[] = ["viewer", "editor", "admin", "super_admin"];

export default async function Users() {
  const me = await requireRole("super_admin");
  const db = await createSessionClient();
  const { data } = await db.from("profiles").select("id, email, full_name, role, created_at").order("created_at");
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl">Users and roles</h1>
      <p className="mt-2 max-w-[70ch] text-ink-soft">
        Invite people from the Supabase dashboard (Authentication → Users → Invite). They appear here as viewers; choose their role below.
        Editors manage events, announcements, gallery, master plan and updates. Admins also manage progress, organisation details, site media and enquiries.
      </p>
      <ul className="mt-8 divide-y divide-[var(--line)] rounded border border-line bg-marble">
        {(data ?? []).map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p>{u.full_name || u.email}</p>
              <p className="text-sm text-ink-soft">{u.email}</p>
            </div>
            {u.id === me.id ? (
              <p className="text-ink-soft">{roleLabel[u.role as Role]} (you)</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {roles.map((r) => (
                  <form key={r} action={setUserRole.bind(null, u.id, r)}>
                    <button type="submit" aria-pressed={u.role === r} className="rounded-full border border-line px-3 py-1 text-sm transition-colors duration-150 hover:border-gold aria-pressed:border-gold aria-pressed:bg-gold aria-pressed:text-[#fffaf0]">
                      {roleLabel[r]}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
