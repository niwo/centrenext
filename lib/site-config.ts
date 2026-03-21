export const siteConfig = {
  locales: ["de", "fr"] as const,
  defaultLocale: "de" as const,
  sectionSlugs: {
    de: {
      about: "ueber-uns",
      team: "team",
      services: "angebote",
      news: "aktuelles",
      location: "standort",
    },
    fr: {
      about: "a-propos",
      team: "equipe",
      services: "services",
      news: "actualites",
      location: "adresse",
    },
  } as const,
};

export type Locale = (typeof siteConfig.locales)[number];

export function isLocale(value: string): value is Locale {
  return siteConfig.locales.includes(value as Locale);
}