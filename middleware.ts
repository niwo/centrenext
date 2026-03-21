import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["de", "fr"];
const DEFAULT_LOCALE = "de";

function getPreferredLocale(acceptLanguage: string): string {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  // Parse Accept-Language header
  const locales = acceptLanguage
    .split(",")
    .map((lang) => {
      const parts = lang.trim().split(";");
      const locale = parts[0].split("-")[0].toLowerCase();
      const q = parts[1] ? parseFloat(parts[1].split("=")[1]) : 1;
      return { locale, q };
    })
    .sort((a, b) => b.q - a.q);

  // Find first supported locale
  for (const { locale } of locales) {
    if (SUPPORTED_LOCALES.includes(locale)) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If path already has a locale, don't redirect
  if (SUPPORTED_LOCALES.some((locale) => pathname.startsWith(`/${locale}`))) {
    return NextResponse.next();
  }

  // Redirect to locale-specific path
  if (pathname === "/" || pathname === "") {
    const acceptLanguage = request.headers.get("accept-language") ?? "";
    const preferredLocale = getPreferredLocale(acceptLanguage);

    return NextResponse.redirect(new URL(`/${preferredLocale}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
