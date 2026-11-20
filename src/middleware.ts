import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, locales } from "@/i18n/config";

function preferredLocale(req: NextRequest) {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value;
  if (isLocale(cookie)) return cookie;
  const accept = req.headers.get("accept-language")?.toLowerCase() ?? "";
  return locales.find((l) => accept.includes(l)) ?? defaultLocale;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
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
