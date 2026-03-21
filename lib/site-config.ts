export const siteConfig = {
  locales: ["de", "fr"] as const,
  defaultLocale: "de" as const,
};

export type Locale = (typeof siteConfig.locales)[number];

export function isLocale(value: string): value is Locale {
  return siteConfig.locales.includes(value as Locale);
}