export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { BrandMark } from "@/components/BrandMark";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm rounded border border-line bg-marble p-8 shadow-[0_20px_50px_-30px_rgb(42_33_24/0.4)]">
        <BrandMark size={44} className="text-gold" />
        <h1 className="mt-4 text-3xl">Admin sign in</h1>
        <p className="mt-1 text-ink-soft">Shri Shri Radha-Krishna Prem Mandir</p>
        {isSupabaseConfigured ? (
          <LoginForm />
        ) : (
          <p className="mt-6 rounded-sm border border-dashed border-marble-3 p-4 text-ink-soft">
            Supabase is not connected yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see README) to enable admin sign-in.
          </p>
        )}
      </div>
    </main>
  );
}
