export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { can, getAdmin, roleLabel } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { resources } from "@/lib/admin/resources";
import { BrandMark } from "@/components/BrandMark";
import { signOut } from "../actions";
import type { Role } from "@/lib/types";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) redirect("/admin/login");
  const user = await getAdmin();
  if (!user) redirect("/admin/login");

  const nav: { href: string; label: string; min: Role }[] = [
    { href: "/admin", label: "Dashboard", min: "viewer" },
    ...Object.entries(resources).map(([k, r]) => ({ href: `/admin/${k}`, label: r.label, min: r.minRole as Role })),
    { href: "/admin/enquiries", label: "Enquiries", min: "admin" },
    { href: "/admin/settings", label: "Organisation and site", min: "admin" },
    { href: "/admin/users", label: "Users and roles", min: "super_admin" },
  ];

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="on-dark md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div className="flex items-center gap-3 p-5">
          <BrandMark size={34} className="text-gold-bright" />
          <span className="font-display text-lg leading-tight">Prem Mandir admin</span>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 md:grid md:overflow-visible">
          {nav.filter((n) => can(user, n.min)).map((n) => (
            <Link key={n.href} href={n.href} className="shrink-0 rounded-sm px-3 py-2 text-[0.95rem] no-underline transition-colors duration-150 hover:bg-[rgb(243_236_220/0.08)] hover:text-gold-bright">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-[rgb(243_236_220/0.14)] p-5 text-sm">
          <p className="truncate">{user.email}</p>
          <p className="text-forest-soft">{roleLabel[user.role]}</p>
          <div className="mt-3 flex gap-4">
            <Link href="/en" className="text-gold-bright underline">View site</Link>
            <form action={signOut}><button type="submit" className="text-gold-bright underline">Sign out</button></form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-8 md:px-10 md:py-10">{children}</div>
    </div>
  );
}
