import { promises as fs } from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import yaml from "js-yaml";

import { getItemHref, getSectionHref, getSectionSlug } from "@/lib/routes";
import type { Locale } from "@/lib/site-config";

export const sectionKeys = ["about", "team", "services", "news", "location"] as const;
export type SectionKey = (typeof sectionKeys)[number];

// ---------------------------------------------------------------------------
// Display types (consumed by components)
// ---------------------------------------------------------------------------

type NavigationLink = {
  label: string;
  href: string;
};

type CallToAction = {
  label: string;
  href: string;
};

type SchedulePeriod = "morning" | "afternoon";
type ScheduleDayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
type WorkingDay = { day: ScheduleDayKey; periods: SchedulePeriod[] };

type TeamMember = {
  slug: string;
  name: string;
  slogan?: string;
  role: string;
  email?: string;
  phone?: string;
  socialLinks?: Array<{
    platform: "website" | "instagram" | "linkedin";
    href: string;
  }>;
  schedule?: WorkingDay[];
  image?: string;
  headerImage?: string;
  tags: string[];
};

export type TeamProfile = {
  slug: string;
  content: string;
};

type ServiceItem = {
  slug: string;
  name: string;
  description: string;
  image: string;
};

export type ServicePost = {
  slug: string;
  title: string;
  description: string;
  prices: Array<{
    amountChf: number;
    unit: string;
  }>;
  insurance: {
    obligatory_coverage: boolean;
    supplementary: {
      covered: boolean;
      insurers: string[];
    };
  };
  image: string;
  tags: string[];
  tag_color?: string;
  highlight: boolean;
  content: string;
};

type NewsItem = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export type NewsPost = NewsItem & {
  tags: string[];
  content: string;
};

export type TestimonialItem = {
  slug: string;
  quote: string;
  name: string;
  date: string;
  image?: string;
};

export type SearchIndexItem = {
  type: "team" | "services" | "news" | "about" | "location";
  title: string;
  href: string;
  summary: string;
  haystack: string;
};

type PageContent = {
  navigation: NavigationLink[];
  searchLabel: string;
  hero: {
    eyebrow: string;
    title: string;
    primaryCta: CallToAction;
    secondaryCta: CallToAction;
  };
  about: {
    title: string;
    kicker: string;
    detailLink: string;
  };
  team: {
    title: string;
    intro: string;
    kicker: string;
    detailLink: string;
    scheduleTitle: string;
    scheduleMorningLabel: string;
    scheduleAfternoonLabel: string;
    people: TeamMember[];
  };
  services: {
    title: string;
    intro: string;
    kicker: string;
    detailLink: string;
    priceLabel: string;
    unitLabel: string;
    unitSessionLabel: string;
    insuranceLabel: string;
    insuranceObligatoryLabel: string;
    insuranceSupplementaryLabel: string;
    insuranceNoCoverageLabel: string;
    insuranceSupplementaryInsurersLabel: string;
    insuranceCoveredLabel: string;
    insuranceNotCoveredLabel: string;
    items: ServiceItem[];
  };
  news: {
    title: string;
    sectionTitle: string;
    intro: string;
    kicker: string;
    detailLink: string;
    showAllLabel: string;
    items: NewsItem[];
  };
  location: {
    title: string;
    intro: string;
    kicker: string;
    detailLink: string;
    practiceDetailLink: string;
    addressLabel: string;
    openingHoursLabel: string;
    mapLabel: string;
  };
  testimonials: {
    title: string;
    kicker: string;
    items: TestimonialItem[];
  };
  footer: {
    contactKicker: string;
    backLink: string;
    detailKicker: string;
    emailLabel: string;
    phoneLabel: string;
    adminLabel: string;
  };
};

export type PracticeContent = {
  name: string;
  tagline: string;
  addressLines: string[];
  mapEmbedUrl: string;
  seo: {
    defaultImage: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  socialLinks?: Array<{
    platform: "github" | "instagram" | "facebook" | "linkedin" | "youtube" | "x";
    href: string;
  }>;
  openingHours: Array<{
    day: string;
    hours: string;
  }>;
};

export type SiteContent = {
  page: PageContent;
  days: Record<string, string>;
  about: string;
  details: Record<SectionKey, string>;
  practice: PracticeContent;
  teamProfiles: TeamProfile[];
  servicePosts: ServicePost[];
  newsPosts: NewsPost[];
  searchIndex: SearchIndexItem[];
};

export type LandingPageContent = {
  brandLabel: string;
  introByLocale: Array<{
    locale: Locale;
    tagline: string;
  }>;
  localeLinks: Array<{
    locale: Locale;
    label: string;
    href: string;
  }>;
};

export type SiteSeoContent = {
  siteName: string;
  defaultImage: string;
};

// ---------------------------------------------------------------------------
// Raw data types (language-neutral, stored in content/data/)
// ---------------------------------------------------------------------------

type LocalizedField = string | Partial<Record<Locale, string>>;

type PracticeData = {
  name: string;
  tagline?: Partial<Record<string, string>>;
  seo?: {
    defaultImage?: string;
  };
  address: { street: LocalizedField; number: number; postcode: number; city: LocalizedField };
  contact: { phone: string; email: string };
  socialLinks?: Array<{
    platform: "github" | "instagram" | "facebook" | "linkedin" | "youtube" | "x";
    href: string;
  }>;
  map: { embedUrl: string; lat: number; lon: number };
  openingHours: Array<{ dayKey: string; hours: string }>;
};

// ---------------------------------------------------------------------------
// i18n translation type (stored in content/i18n/<locale>.yaml)
// ---------------------------------------------------------------------------

type I18nData = {
  landing: {
    localeLinkLabel: string;
  };
  days: Record<string, string>;
  nav: {
    about: string;
    team: string;
    services: string;
    posts: string;
    search: string;
    location: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    primaryCta: string;
    secondaryCta: string;
  };
  about: {
    title?: string;
    detailLink?: string;
  };
  team: {
    title?: string;
    detailLink?: string;
    intro?: string;
    schedule?: {
      title?: string;
      morning?: string;
      afternoon?: string;
    };
  };
  services: {
    title?: string;
    intro?: string;
    pricePrefix?: string;
    detailLink?: string;
    priceLabel?: string;
    unitLabel?: string;
    unitSessionLabel?: string;
    insuranceLabel?: string;
    insuranceObligatoryLabel?: string;
    insuranceSupplementaryLabel?: string;
    insuranceNoCoverageLabel?: string;
    insuranceSupplementaryInsurersLabel?: string;
    insuranceCoveredLabel?: string;
    insuranceNotCoveredLabel?: string;
  };
  posts: {
    title?: string;
    sectionTitle?: string;
    intro?: string;
    detailLink?: string;
    showAllLabel?: string;
  };
  location: {
    title?: string;
    intro?: string;
    detailLink?: string;
    practiceDetailLink?: string;
    addressLabel?: string;
    openingHoursLabel?: string;
    mapLabel?: string;
  };
  testimonials: {
    kicker: string;
    title: string;
    intro: string;
  };
  footer: {
    contactKicker: string;
    backLink: string;
    detailKicker: string;
    emailLabel: string;
    phoneLabel: string;
    adminLabel: string;
  };
};

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

async function readTextFile(filePath: string) {
  return fs.readFile(filePath, "utf8");
}

async function parseYamlFile<T>(filePath: string): Promise<T> {
  const raw = await readTextFile(filePath);
  return yaml.load(raw) as T;
}

async function parseMarkdownFile(filePath: string) {
  const raw = await readTextFile(filePath);
  return matter(raw).content.trim();
}

export async function getLandingPageContent(): Promise<LandingPageContent> {
  const dataDir = path.join(process.cwd(), "content", "data");
  const i18nDir = path.join(process.cwd(), "content", "i18n");

  const [practiceData, defaultI18n, localizedEntries] = await Promise.all([
    parseYamlFile<PracticeData>(path.join(dataDir, "main.yaml")),
    parseYamlFile<I18nData>(path.join(i18nDir, "de.yaml")),
    Promise.all(
      (["de", "fr"] as const).map(async (locale) => {
        const i18n = await parseYamlFile<I18nData>(path.join(i18nDir, `${locale}.yaml`));
        return {
          locale,
          label: i18n.landing.localeLinkLabel,
        };
      }),
    ),
  ]);

  return {
    brandLabel: practiceData.name,
    introByLocale: ([
      { locale: "de", i18n: defaultI18n },
      {
        locale: "fr",
        i18n: await parseYamlFile<I18nData>(path.join(i18nDir, "fr.yaml")),
      },
    ] as const).map(({ locale, i18n }) => ({
      locale,
      tagline: practiceData.tagline?.[locale] ?? "",
    })),
    localeLinks: localizedEntries.map(({ locale, label }) => ({
      locale,
      label,
      href: `/${locale}`,
    })),
  };
}

export async function getSiteSeoContent(): Promise<SiteSeoContent> {
  const practiceData = await parseYamlFile<PracticeData>(path.join(process.cwd(), "content", "data", "main.yaml"));

  return {
    siteName: practiceData.name,
    defaultImage: practiceData.seo?.defaultImage ?? "/images/DSC06768.webp",
  };
}

type NewsLocalizedProfile = {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
};

type ServiceLocalizedProfile = {
  title?: string;
  description?: string;
  content?: string;
};

type ServiceDataFile = {
  id?: string;
  profile?: Partial<Record<Locale, ServiceLocalizedProfile>>;
  prices?: Array<{
    amountChf?: number;
    unit?: string;
  }>;
  insurance?: {
    obligatory_coverage?: boolean;
    supplementary?: {
      covered?: boolean;
      insurers?: string[];
    };
  };
  image?: string;
  tags?: string[];
  tag_color?: string;
  highlight?: boolean;
};

type TestimonialLocalizedProfile = {
  name?: string;
  quote?: string;
};

type NewsDataFile = {
  id?: string;
  updated?: string;
  tags?: string[];
  profile?: Partial<Record<Locale, NewsLocalizedProfile>>;
};

type TestimonialDataFile = {
  id?: string;
  name?: string;
  date?: string;
  image?: string;
  profile?: Partial<Record<Locale, TestimonialLocalizedProfile>>;
};

type PageDataFile = {
  id: string;
  de: {
    content: string;
    title?: string;
    intro?: string;
    detailLink?: string;
    sectionTitle?: string;
    showAllLabel?: string;
    practiceDetailLink?: string;
    addressLabel?: string;
    openingHoursLabel?: string;
    mapLabel?: string;
    schedule?: {
      title?: string;
      morning?: string;
      afternoon?: string;
    };
    priceLabel?: string;
    unitLabel?: string;
    unitSessionLabel?: string;
    insuranceLabel?: string;
    insuranceObligatoryLabel?: string;
    insuranceSupplementaryLabel?: string;
    insuranceNoCoverageLabel?: string;
    insuranceSupplementaryInsurersLabel?: string;
    insuranceCoveredLabel?: string;
    insuranceNotCoveredLabel?: string;
  };
  fr: {
    content: string;
    title?: string;
    intro?: string;
    detailLink?: string;
    sectionTitle?: string;
    showAllLabel?: string;
    practiceDetailLink?: string;
    addressLabel?: string;
    openingHoursLabel?: string;
    mapLabel?: string;
    schedule?: {
      title?: string;
      morning?: string;
      afternoon?: string;
    };
    priceLabel?: string;
    unitLabel?: string;
    unitSessionLabel?: string;
    insuranceLabel?: string;
    insuranceObligatoryLabel?: string;
    insuranceSupplementaryLabel?: string;
    insuranceNoCoverageLabel?: string;
    insuranceSupplementaryInsurersLabel?: string;
    insuranceCoveredLabel?: string;
    insuranceNotCoveredLabel?: string;
  };
};

type TeamLocalizedProfile = {
  role?: string;
  slogan?: string;
  content?: string;
};

type TeamDataFile = {
  id?: string;
  name?: string;
  profile?: Partial<Record<Locale, TeamLocalizedProfile>>;
  email?: string;
  phone?: string;
  socialLinks?: Array<{
    platform?: "website" | "instagram" | "linkedin";
    href?: string;
  }>;
  schedule?: Array<{
    day?: string;
    periods?: string[];
  }>;
  image?: string;
  headerImage?: string;
  tags?: string[];
};

type TeamProfileWithMeta = TeamProfile & {
  name: string;
  role: string;
  slogan?: string;
  email?: string;
  phone?: string;
  socialLinks?: Array<{
    platform: "website" | "instagram" | "linkedin";
    href: string;
  }>;
  schedule?: WorkingDay[];
  image?: string;
  headerImage?: string;
  tags: string[];
};

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
}

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function normalizeServicePrices(value: ServiceDataFile["prices"]) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => ({
      amountChf: typeof entry?.amountChf === "number" ? entry.amountChf : 0,
      unit: typeof entry?.unit === "string" ? entry.unit.trim() : "",
    }))
    .filter((entry) => entry.amountChf > 0 && entry.unit.length > 0);
}

const VALID_SCHEDULE_DAYS = new Set<string>(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]);
const VALID_SCHEDULE_PERIODS = new Set<string>(["morning", "afternoon"]);

function normalizeTeamSchedule(value: TeamDataFile["schedule"]): WorkingDay[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => ({
      day: typeof entry?.day === "string" && VALID_SCHEDULE_DAYS.has(entry.day) ? (entry.day as ScheduleDayKey) : undefined,
      periods: Array.isArray(entry?.periods)
        ? (entry.periods.filter((p) => typeof p === "string" && VALID_SCHEDULE_PERIODS.has(p)) as SchedulePeriod[])
        : [],
    }))
    .filter((entry): entry is WorkingDay => entry.day !== undefined && entry.periods.length > 0);
}

function normalizeTeamSocialLinks(value: TeamDataFile["socialLinks"]) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => ({
      platform:
        entry?.platform === "website" || entry?.platform === "instagram" || entry?.platform === "linkedin"
          ? entry.platform
          : undefined,
      href: typeof entry?.href === "string" ? entry.href.trim() : "",
    }))
    .filter(
      (entry): entry is { platform: "website" | "instagram" | "linkedin"; href: string } =>
        Boolean(entry.platform) && entry.href.length > 0,
    );
}

function compareNewsByDateDesc(a: NewsPost, b: NewsPost) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function compareByDateDesc(a: { date: string }, b: { date: string }) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function compareServicesBySlug(a: ServicePost, b: ServicePost) {
  if (a.highlight !== b.highlight) {
    return a.highlight ? -1 : 1;
  }

  return a.slug.localeCompare(b.slug);
}

function compareTeamBySlug(a: TeamProfileWithMeta, b: TeamProfileWithMeta) {
  return a.slug.localeCompare(b.slug);
}

function compactText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function getLocalizedField(value: LocalizedField, locale: Locale) {
  if (typeof value === "string") {
    return value;
  }

  return value[locale] ?? value.de ?? value.fr ?? "";
}

function getNewsLocalizedProfile(newsData: NewsDataFile, locale: Locale): NewsLocalizedProfile {
  return newsData.profile?.[locale] ?? newsData.profile?.de ?? newsData.profile?.fr ?? {};
}

async function readNewsPosts(newsDataDir: string, locale: Locale): Promise<NewsPost[]> {
  const entries = await fs.readdir(newsDataDir, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  });

  const yamlFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        (entry.name.toLowerCase().endsWith(".yaml") || entry.name.toLowerCase().endsWith(".yml")),
    )
    .map((entry) => entry.name);

  const posts = await Promise.all(
    yamlFiles.map(async (fileName) => {
      const filePath = path.join(newsDataDir, fileName);
      const newsData = await parseYamlFile<NewsDataFile>(filePath);
      const fileSlug = fileName.replace(/\.ya?ml$/i, "");
      const localizedProfile = getNewsLocalizedProfile(newsData, locale);
      const slug = localizedProfile.slug ?? newsData.id ?? fileSlug;

      return {
        slug,
        title: localizedProfile.title ?? slug,
        date: newsData.updated ?? "",
        excerpt: localizedProfile.excerpt ?? "",
        tags: normalizeTags(newsData.tags),
        content: (localizedProfile.content ?? "").trim(),
      };
    }),
  );

  return posts.sort(compareNewsByDateDesc);
}

function getTestimonialLocalizedProfile(
  testimonialData: TestimonialDataFile,
  locale: Locale,
): TestimonialLocalizedProfile | undefined {
  return testimonialData.profile?.[locale] ?? testimonialData.profile?.de ?? testimonialData.profile?.fr;
}

async function readTestimonialPosts(testimonialsDataDir: string, locale: Locale): Promise<TestimonialItem[]> {
  const entries = await fs.readdir(testimonialsDataDir, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  });

  const yamlFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        (entry.name.toLowerCase().endsWith(".yaml") || entry.name.toLowerCase().endsWith(".yml")),
    )
    .map((entry) => entry.name);

  const resolved = await Promise.all(
    yamlFiles.map(async (fileName) => {
      const filePath = path.join(testimonialsDataDir, fileName);
      const testimonialData = await parseYamlFile<TestimonialDataFile>(filePath);
      const fileSlug = fileName.replace(/\.ya?ml$/i, "");
      const localizedProfile = getTestimonialLocalizedProfile(testimonialData, locale);

      if (!localizedProfile) {
        return null;
      }

      const slug = testimonialData.id ?? fileSlug;

      return {
        slug,
        quote: (localizedProfile.quote ?? "").trim(),
        name: testimonialData.name ?? localizedProfile.name ?? slug,
        date: testimonialData.date ?? "",
        image: testimonialData.image,
      };
    }),
  );

  const items: TestimonialItem[] = resolved.filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return items.sort(compareByDateDesc);
}

function getServiceLocalizedProfile(serviceData: ServiceDataFile, locale: Locale): ServiceLocalizedProfile {
  return serviceData.profile?.[locale] ?? serviceData.profile?.de ?? serviceData.profile?.fr ?? {};
}

async function readServicePosts(servicesDataDir: string, locale: Locale): Promise<ServicePost[]> {
  const entries = await fs.readdir(servicesDataDir, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  });

  const yamlFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        (entry.name.toLowerCase().endsWith(".yaml") || entry.name.toLowerCase().endsWith(".yml")),
    )
    .map((entry) => entry.name);

  const posts = await Promise.all(
    yamlFiles.map(async (fileName) => {
      const filePath = path.join(servicesDataDir, fileName);
      const serviceData = await parseYamlFile<ServiceDataFile>(filePath);
      const fileSlug = fileName.replace(/\.ya?ml$/i, "");
      const slug = serviceData.id ?? fileSlug;
      const localizedProfile = getServiceLocalizedProfile(serviceData, locale);

      return {
        slug,
        title: localizedProfile.title ?? slug,
        description: localizedProfile.description ?? "",
        prices: normalizeServicePrices(serviceData.prices),
        insurance: {
          obligatory_coverage: Boolean(serviceData.insurance?.obligatory_coverage),
          supplementary: {
            covered: Boolean(serviceData.insurance?.supplementary?.covered),
            insurers: normalizeStringList(serviceData.insurance?.supplementary?.insurers),
          },
        },
        image: serviceData.image ?? "/images/DSC06840.webp",
        tags: normalizeTags(serviceData.tags),
        tag_color: serviceData.tag_color,
        highlight: Boolean(serviceData.highlight),
        content: (localizedProfile.content ?? "").trim(),
      };
    }),
  );

  return posts.sort(compareServicesBySlug);
}

function getTeamLocalizedProfile(teamData: TeamDataFile, locale: Locale): TeamLocalizedProfile {
  return teamData.profile?.[locale] ?? teamData.profile?.de ?? teamData.profile?.fr ?? {};
}

async function readTeamProfiles(teamDataDir: string, locale: Locale): Promise<TeamProfileWithMeta[]> {
  const entries = await fs.readdir(teamDataDir, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  });

  const yamlFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        (entry.name.toLowerCase().endsWith(".yaml") || entry.name.toLowerCase().endsWith(".yml")),
    )
    .map((entry) => entry.name);

  const profiles = await Promise.all(
    yamlFiles.map(async (fileName) => {
      const filePath = path.join(teamDataDir, fileName);
      const teamData = await parseYamlFile<TeamDataFile>(filePath);
      const fileSlug = fileName.replace(/\.ya?ml$/i, "");
      const slug = teamData.id ?? fileSlug;
      const localizedProfile = getTeamLocalizedProfile(teamData, locale);

      return {
        slug,
        name: teamData.name ?? slug,
        role: localizedProfile.role ?? slug,
        slogan: localizedProfile.slogan,
        email: teamData.email,
        phone: teamData.phone,
        socialLinks: normalizeTeamSocialLinks(teamData.socialLinks),
        schedule: normalizeTeamSchedule(teamData.schedule),
        image: teamData.image,
        headerImage: teamData.headerImage,
        tags: normalizeTags(teamData.tags),
        content: (localizedProfile.content ?? "").trim(),
      };
    }),
  );

  return profiles.sort(compareTeamBySlug);
}

// ---------------------------------------------------------------------------
// getSiteContent — merges language-neutral data with locale translations
// ---------------------------------------------------------------------------

export async function getSiteContent(locale: Locale): Promise<SiteContent> {
  const dataDir = path.join(process.cwd(), "content", "data");
  const newsDataDir = path.join(dataDir, "news");
  const testimonialsDataDir = path.join(dataDir, "testimonials");
  const teamDataDir = path.join(dataDir, "team");
  const servicesDataDir = path.join(dataDir, "services");
  const pagesDataDir = path.join(dataDir, "pages");
  const i18nDir = path.join(process.cwd(), "content", "i18n");

  const [practiceData, i18n, pageEntries, teamProfilesWithMeta, servicePosts, newsPosts, testimonialItems] = await Promise.all([
    parseYamlFile<PracticeData>(path.join(dataDir, "main.yaml")),
    parseYamlFile<I18nData>(path.join(i18nDir, `${locale}.yaml`)),
    Promise.all(
      sectionKeys.map(async (key) => {
        const pageData = await parseYamlFile<PageDataFile>(path.join(pagesDataDir, `${key}.yaml`));
        return [key, pageData[locale] ?? { content: "" }] as const;
      }),
    ),
    readTeamProfiles(teamDataDir, locale),
    readServicePosts(servicesDataDir, locale),
    readNewsPosts(newsDataDir, locale),
    readTestimonialPosts(testimonialsDataDir, locale),
  ]);

  const localizedPages = Object.fromEntries(pageEntries) as Record<SectionKey, PageDataFile[Locale]>;
  const details = Object.fromEntries(
    sectionKeys.map((key) => [key, localizedPages[key]?.content?.trim() ?? ""]),
  ) as Record<SectionKey, string>;

  const aboutPage = localizedPages.about;
  const teamPage = localizedPages.team;
  const servicesPage = localizedPages.services;
  const newsPage = localizedPages.news;
  const locationPage = localizedPages.location;

  const teamProfiles: TeamProfile[] = teamProfilesWithMeta.map(({ slug, content }) => ({ slug, content }));

  // Merge practice data + day-name translations
  const practice: PracticeContent = {
    name: practiceData.name,
    tagline: practiceData.tagline?.[locale] ?? "",
    addressLines: [
      `${getLocalizedField(practiceData.address.street, locale)} ${practiceData.address.number}`,
      `${practiceData.address.postcode} ${getLocalizedField(practiceData.address.city, locale)}`,
    ],
    mapEmbedUrl: practiceData.map.embedUrl,
    seo: {
      defaultImage: practiceData.seo?.defaultImage ?? "/images/DSC06768.webp",
    },
    contact: practiceData.contact,
    socialLinks: practiceData.socialLinks,
    openingHours: practiceData.openingHours.map((slot) => ({
      day: i18n.days[slot.dayKey] ?? slot.dayKey,
      hours: slot.hours,
    })),
  };

  // Merge team data from locale markdown frontmatter
  const teamPeople = teamProfilesWithMeta.map((member) => ({
    slug: member.slug,
    name: member.name,
    slogan: member.slogan,
    role: member.role,
    email: member.email,
    phone: member.phone,
    socialLinks: member.socialLinks,
    schedule: member.schedule,
    image: member.image,
    headerImage: member.headerImage,
    tags: member.tags,
  }));

  const serviceItems = servicePosts.map((item) => ({
    slug: item.slug,
    name: item.title,
    description: item.description,
    image: item.image,
  }));

  const newsItems = newsPosts.map(({ slug, title, date, excerpt }) => ({
    slug,
    title,
    date,
    excerpt,
  }));

  // Build navigation from i18n nav keys (order follows sectionKeys)
  const navigationLabels: Record<SectionKey, string> = {
    about: i18n.nav.about,
    team: i18n.nav.team,
    services: i18n.nav.services,
    news: i18n.nav.posts,
    location: i18n.nav.location,
  };
  const navigation = sectionKeys.map((k) => ({ label: navigationLabels[k], href: `/${getSectionSlug(locale, k)}` }));

  const page: PageContent = {
    navigation,
    searchLabel: i18n.nav.search,
    hero: {
      eyebrow: i18n.hero.eyebrow,
      title: i18n.hero.title,
      primaryCta: { label: i18n.hero.primaryCta, href: "#services" },
      secondaryCta: { label: i18n.hero.secondaryCta, href: "#location" },
    },
    about: {
      title: aboutPage.title ?? i18n.about.title ?? i18n.nav.about,
      kicker: i18n.nav.about,
      detailLink: aboutPage.detailLink ?? i18n.about.detailLink ?? "",
    },
    team: {
      title: teamPage.title ?? i18n.team.title ?? i18n.nav.team,
      intro: teamPage.intro ?? i18n.team.intro ?? "",
      kicker: i18n.nav.team,
      detailLink: teamPage.detailLink ?? i18n.team.detailLink ?? "",
      scheduleTitle: teamPage.schedule?.title ?? i18n.team.schedule?.title ?? "",
      scheduleMorningLabel: teamPage.schedule?.morning ?? i18n.team.schedule?.morning ?? "",
      scheduleAfternoonLabel: teamPage.schedule?.afternoon ?? i18n.team.schedule?.afternoon ?? "",
      people: teamPeople,
    },
    services: {
      title: servicesPage.title ?? i18n.services.title ?? i18n.nav.services,
      intro: servicesPage.intro ?? i18n.services.intro ?? "",
      kicker: i18n.nav.services,
      detailLink: servicesPage.detailLink ?? i18n.services.detailLink ?? "",
      priceLabel: servicesPage.priceLabel ?? i18n.services.priceLabel ?? "",
      unitLabel: servicesPage.unitLabel ?? i18n.services.unitLabel ?? "",
      unitSessionLabel: servicesPage.unitSessionLabel ?? i18n.services.unitSessionLabel ?? "",
      insuranceLabel: servicesPage.insuranceLabel ?? i18n.services.insuranceLabel ?? "",
      insuranceObligatoryLabel:
        servicesPage.insuranceObligatoryLabel ?? i18n.services.insuranceObligatoryLabel ?? "",
      insuranceSupplementaryLabel:
        servicesPage.insuranceSupplementaryLabel ?? i18n.services.insuranceSupplementaryLabel ?? "",
      insuranceNoCoverageLabel:
        servicesPage.insuranceNoCoverageLabel ?? i18n.services.insuranceNoCoverageLabel ?? "",
      insuranceSupplementaryInsurersLabel:
        servicesPage.insuranceSupplementaryInsurersLabel ?? i18n.services.insuranceSupplementaryInsurersLabel ?? "",
      insuranceCoveredLabel: servicesPage.insuranceCoveredLabel ?? i18n.services.insuranceCoveredLabel ?? "",
      insuranceNotCoveredLabel: servicesPage.insuranceNotCoveredLabel ?? i18n.services.insuranceNotCoveredLabel ?? "",
      items: serviceItems,
    },
    news: {
      title: newsPage.title ?? i18n.posts.title ?? i18n.nav.posts,
      sectionTitle: newsPage.sectionTitle ?? i18n.posts.sectionTitle ?? i18n.nav.posts,
      intro: newsPage.intro ?? i18n.posts.intro ?? "",
      kicker: i18n.nav.posts,
      detailLink: newsPage.detailLink ?? i18n.posts.detailLink ?? "",
      showAllLabel: newsPage.showAllLabel ?? i18n.posts.showAllLabel ?? "",
      items: newsItems,
    },
    location: {
      title: locationPage.title ?? i18n.location.title ?? i18n.nav.location,
      intro: locationPage.intro ?? i18n.location.intro ?? "",
      kicker: i18n.nav.location,
      detailLink: locationPage.detailLink ?? i18n.location.detailLink ?? "",
      practiceDetailLink: locationPage.practiceDetailLink ?? i18n.location.practiceDetailLink ?? "",
      addressLabel: locationPage.addressLabel ?? i18n.location.addressLabel ?? "",
      openingHoursLabel: locationPage.openingHoursLabel ?? i18n.location.openingHoursLabel ?? "",
      mapLabel: locationPage.mapLabel ?? i18n.location.mapLabel ?? "",
    },
    testimonials: {
      title: i18n.testimonials.title,
      kicker: i18n.testimonials.kicker,
      items: testimonialItems,
    },
    footer: i18n.footer,
  };

  const teamProfileMap = Object.fromEntries(teamProfiles.map((profile) => [profile.slug, profile.content]));

  const teamSearchItems: SearchIndexItem[] = teamPeople.map((person) => {
    const profileContent = teamProfileMap[person.slug] ?? "";
    const summary = compactText([person.role, person.slogan, profileContent].filter(Boolean).join(" - "), 180);

    return {
      type: "team",
      title: person.name,
      href: getItemHref(locale, "team", person.slug),
      summary,
      haystack: [person.name, person.role, person.slogan, profileContent].filter(Boolean).join(" "),
    };
  });

  const serviceSearchItems: SearchIndexItem[] = servicePosts.map((servicePost) => ({
    type: "services",
    title: servicePost.title,
    href: getItemHref(locale, "services", servicePost.slug),
    summary: compactText([servicePost.description, servicePost.content].filter(Boolean).join(" - "), 180),
    haystack: [servicePost.title, servicePost.description, servicePost.content, servicePost.tags.join(" ")]
      .filter(Boolean)
      .join(" "),
  }));

  const newsSearchItems: SearchIndexItem[] = newsPosts.map((newsPost) => ({
    type: "news",
    title: newsPost.title,
    href: getItemHref(locale, "news", newsPost.slug),
    summary: compactText([newsPost.excerpt, newsPost.content].filter(Boolean).join(" - "), 180),
    haystack: [newsPost.title, newsPost.excerpt, newsPost.content, newsPost.tags.join(" ")].filter(Boolean).join(" "),
  }));

  const aboutSearchItem: SearchIndexItem = {
    type: "about",
    title: page.about.title,
    href: getSectionHref(locale, "about"),
    summary: compactText(details.about, 180),
    haystack: [page.about.title, i18n.nav.about, details.about].filter(Boolean).join(" "),
  };

  const locationSearchItem: SearchIndexItem = {
    type: "location",
    title: page.location.title,
    href: getSectionHref(locale, "location"),
    summary: compactText(details.location, 180),
    haystack: [page.location.title, i18n.nav.location, page.location.intro, details.location].filter(Boolean).join(" "),
  };

  const searchIndex = [...teamSearchItems, ...serviceSearchItems, ...newsSearchItems, aboutSearchItem, locationSearchItem];

  return { page, days: i18n.days, about: details.about, details, practice, teamProfiles, servicePosts, newsPosts, searchIndex };
}