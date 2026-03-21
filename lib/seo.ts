import { siteConfig, type Locale } from "@/lib/site-config";

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

function joinLocalizedList(locale: Locale, values: string[]) {
  if (values.length === 0) {
    return "";
  }

  if (values.length === 1) {
    return values[0] ?? "";
  }

  if (values.length === 2) {
    return locale === "de" ? `${values[0]} und ${values[1]}` : `${values[0]} et ${values[1]}`;
  }

  const leadingValues = values.slice(0, -1).join(", ");
  const lastValue = values[values.length - 1] ?? "";
  return locale === "de" ? `${leadingValues} sowie ${lastValue}` : `${leadingValues} ainsi que ${lastValue}`;
}

export function getLocaleSeoDescription(locale: Locale, serviceTitles: string[]) {
  const intro = locale === "de"
    ? "Die Praxis fuer das ganzheitliche Wohlbefinden."
    : "Le cabinet pour le bien-etre holistique.";

  if (serviceTitles.length === 0) {
    return intro;
  }

  const label = locale === "de" ? "Angebote" : "Prestations";
  return `${intro} ${label}: ${joinLocalizedList(locale, serviceTitles)}.`;
}

export function getLocaleSeoKeywords(locale: Locale, serviceTitles: string[]) {
  const baseKeywords = locale === "de"
    ? ["Physiotherapie", "Biel", "Centre bien-etre", "ganzheitliches Wohlbefinden", "Kontakt"]
    : ["physiotherapie", "Bienne", "Centre bien-etre", "bien-etre holistique", "contact"];

  return [...baseKeywords, ...serviceTitles];
}

export function getOpenGraphLocale(locale: Locale) {
  return locale === "de" ? "de_CH" : "fr_CH";
}
