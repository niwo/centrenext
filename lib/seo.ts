import { siteConfig } from "@/lib/site-config";

const fallbackSiteUrl = "https://www.centrebienetre.ch";

export function getBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl;

  try {
    const normalizedUrl = configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
    return new URL(normalizedUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

export function toAbsoluteUrl(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalizedPath, getBaseUrl()).toString();
}

export function getRootLanguageAlternates() {
  return Object.fromEntries(siteConfig.locales.map((locale) => [locale, `/${locale}`]));
}
