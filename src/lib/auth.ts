import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSessionClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";
import type { Role } from "./types";

export const roleRank: Record<Role, number> = { viewer: 0, editor: 1, admin: 2, super_admin: 3 };
export const roleLabel: Record<Role, string> = { viewer: "Viewer", editor: "Editor", admin: "Admin", super_admin: "Super admin" };

export type AdminUser = { id: string; email: string; name: string | null; role: Role };

export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  if (!isSupabaseConfigured) return null;
  const db = await createSessionClient();
  const { data: auth } = await db.auth.getUser();
  if (!auth.user) return null;
  const { data: profile } = await db.from("profiles").select("role, full_name").eq("id", auth.user.id).maybeSingle();
  return { id: auth.user.id, email: auth.user.email ?? "", name: profile?.full_name ?? null, role: (profile?.role as Role) ?? "viewer" };
});

export const can = (user: AdminUser | null, min: Role) => !!user && roleRank[user.role] >= roleRank[min];

/** Use at the top of every admin page and action. RLS enforces the same rules in the database. */
export async function requireRole(min: Role): Promise<AdminUser> {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  if (!can(user, min)) redirect("/admin?denied=1");
  return user;
}
