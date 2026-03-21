import { siteConfig, type Locale } from "@/lib/site-config";

const sectionKeys = ["about", "team", "services", "news", "location"] as const;
export type SectionKey = (typeof sectionKeys)[number];

const detailCollectionKeys = ["team", "services", "news"] as const;
export type DetailCollectionKey = (typeof detailCollectionKeys)[number];

type AnySectionByLocale = (typeof siteConfig.sectionSlugs)[Locale];

type SectionSlugMap = {
  [K in Locale]: {
    [S in SectionKey]: string;
  };
};

const sectionSlugMap = siteConfig.sectionSlugs as unknown as SectionSlugMap;

function normalizePath(value: string) {
  if (!value.startsWith("/")) {
    return `/${value}`;
  }

  return value;
}

export function getSectionSlug(locale: Locale, section: SectionKey) {
  return sectionSlugMap[locale][section];
}

export function getSectionHref(locale: Locale, section: SectionKey) {
  return `/${locale}/${getSectionSlug(locale, section)}`;
}

export function getItemHref(locale: Locale, section: DetailCollectionKey, itemSlug: string) {
  return `${getSectionHref(locale, section)}/${itemSlug}`;
}

export function getCanonicalSection(locale: Locale, sectionOrSlug: string): SectionKey | null {
  if (sectionKeys.includes(sectionOrSlug as SectionKey)) {
    return sectionOrSlug as SectionKey;
  }

  const localeSlugs = sectionSlugMap[locale] as AnySectionByLocale;

  for (const section of sectionKeys) {
    if (localeSlugs[section] === sectionOrSlug) {
      return section;
    }
  }

  return null;
}

export function toCanonicalPath(pathname: string) {
  const normalizedPath = normalizePath(pathname);
  const segments = normalizedPath.split("/").filter(Boolean);

  if (segments.length < 2) {
    return normalizedPath;
  }

  const [localeSegment, sectionSegment, ...rest] = segments;

  if (!localeSegment || !siteConfig.locales.includes(localeSegment as Locale)) {
    return normalizedPath;
  }

  const locale = localeSegment as Locale;
  const canonicalSection = getCanonicalSection(locale, sectionSegment ?? "");

  if (!canonicalSection) {
    return normalizedPath;
  }

  const canonicalSegments = [locale, canonicalSection, ...rest];
  return `/${canonicalSegments.join("/")}`;
}

export function getLocalizedPath(pathname: string, targetLocale: Locale) {
  const normalizedPath = normalizePath(pathname);
  const segments = normalizedPath.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${targetLocale}`;
  }

  const sourceLocaleSegment = segments[0];

  if (!sourceLocaleSegment || !siteConfig.locales.includes(sourceLocaleSegment as Locale)) {
    return `/${targetLocale}/${segments.join("/")}`;
  }

  const sourceLocale = sourceLocaleSegment as Locale;
  const [, sectionSegment, ...rest] = segments;
  const canonicalSection = sectionSegment ? getCanonicalSection(sourceLocale, sectionSegment) : null;

  if (!canonicalSection) {
    const passthroughSegments = [targetLocale, ...segments.slice(1)].filter(Boolean);
    return `/${passthroughSegments.join("/")}`;
  }

  const localizedSection = getSectionSlug(targetLocale, canonicalSection);
  const localizedSegments = [targetLocale, localizedSection, ...rest].filter(Boolean);
  return `/${localizedSegments.join("/")}`;
}
