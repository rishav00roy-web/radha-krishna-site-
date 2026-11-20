import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { defaultLocale, isLocale, locales } from "@/i18n/config";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

function preferredLocale(req: NextRequest) {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value;
  if (isLocale(cookie)) return cookie;
  const accept = req.headers.get("accept-language")?.toLowerCase() ?? "";
  return locales.find((l) => accept.includes(l)) ?? defaultLocale;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const res = NextResponse.next({ request: req });
    if (!isSupabaseConfigured) return res;
    // Refresh the Supabase session cookie and gate everything except the login page.
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    });
    const { data } = await supabase.auth.getUser();
    if (!data.user && pathname !== "/admin/login") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return res;
  }

  const first = pathname.split("/")[1];
  if (isLocale(first)) {
    const res = NextResponse.next();
    if (req.cookies.get("NEXT_LOCALE")?.value !== first) res.cookies.set("NEXT_LOCALE", first, { path: "/", maxAge: 31536000, sameSite: "lax" });
    return res;
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${preferredLocale(req)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
