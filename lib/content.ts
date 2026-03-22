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

type TeamMember = {
  slug: string;
  name: string;
  slogan?: string;
  role: string;
  email?: string;
  phone?: string;
  image?: string;
  headerImage?: string;
  specialtyKeys: string[];
};

export type TeamProfile = {
  slug: string;
  content: string;
};

type ServiceItem = {
  slug: string;
  name: string;
  description: string;
  price: string;
  image: string;
};

export type ServicePost = {
  slug: string;
  title: string;
  description: string;
  priceChf: number;
  image: string;
  tags: string[];
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
    people: TeamMember[];
  };
  services: {
    title: string;
    intro: string;
    kicker: string;
    detailLink: string;
    items: ServiceItem[];
  };
  news: {
    title: string;
    intro: string;
    kicker: string;
    detailLink: string;
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
  openingHours: Array<{
    day: string;
    hours: string;
  }>;
};

export type SiteContent = {
  page: PageContent;
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
  map: { embedUrl: string; lat: number; lon: number };
  openingHours: Array<{ dayKey: string; hours: string }>;
};

type TeamData = {
  members: Array<{
    id: string;
    name: string;
    titles?: Partial<Record<Locale, string>>;
    slogans?: Partial<Record<Locale, string>>;
    email: string;
    phone: string;
    image: string;
    headerImage?: string;
    specialtyKeys: string[];
  }>;
};

// ---------------------------------------------------------------------------
// i18n translation type (stored in content/i18n/<locale>.yaml)
// ---------------------------------------------------------------------------

type I18nData = {
  landing: {
    localeLinkLabel: string;
  };
  days: Record<string, string>;
  nav: Record<string, string>;
  hero: {
    eyebrow: string;
    title: string;
    primaryCta: string;
    secondaryCta: string;
  };
  about: { title: string; detailLink: string };
  team: {
    title: string;
    detailLink: string;
    intro: string;
  };
  services: {
    title: string;
    intro: string;
    pricePrefix: string;
    detailLink: string;
  };
  news: {
    title: string;
    intro: string;
    detailLink: string;
  };
  location: {
    title: string;
    intro: string;
    detailLink: string;
    practiceDetailLink: string;
    addressLabel: string;
    openingHoursLabel: string;
    mapLabel: string;
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

type NewsFrontmatter = {
  title?: string;
  date?: string;
  excerpt?: string;
  tags?: string[];
};

type ServiceFrontmatter = {
  title?: string;
  description?: string;
  priceChf?: number;
  image?: string;
  tags?: string[];
};

type TestimonialFrontmatter = {
  name?: string;
  date?: string;
  image?: string;
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

function compareNewsByDateDesc(a: NewsPost, b: NewsPost) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function compareByDateDesc(a: { date: string }, b: { date: string }) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function compareServicesBySlug(a: ServicePost, b: ServicePost) {
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

async function readNewsPosts(newsDir: string): Promise<NewsPost[]> {
  const entries = await fs.readdir(newsDir, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  });
  const markdownFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".md") &&
        entry.name.toLowerCase() !== "index.md",
    )
    .map((entry) => entry.name);

  const posts = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const filePath = path.join(newsDir, fileName);
      const raw = await readTextFile(filePath);
      const parsed = matter(raw);
      const frontmatter = parsed.data as NewsFrontmatter;
      const slug = fileName.replace(/\.md$/i, "");

      return {
        slug,
        title: frontmatter.title ?? slug,
        date: frontmatter.date ?? "",
        excerpt: frontmatter.excerpt ?? "",
        tags: normalizeTags(frontmatter.tags),
        content: parsed.content.trim(),
      };
    }),
  );

  return posts.sort(compareNewsByDateDesc);
}

async function readTestimonialPosts(testimonialsDir: string): Promise<TestimonialItem[]> {
  const entries = await fs.readdir(testimonialsDir, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  });
  const markdownFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".md") &&
        entry.name.toLowerCase() !== "index.md",
    )
    .map((entry) => entry.name);

  const items = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const filePath = path.join(testimonialsDir, fileName);
      const raw = await readTextFile(filePath);
      const parsed = matter(raw);
      const frontmatter = parsed.data as TestimonialFrontmatter;
      const slug = fileName.replace(/\.md$/i, "");

      return {
        slug,
        quote: parsed.content.trim(),
        name: frontmatter.name ?? slug,
        date: frontmatter.date ?? "",
        image: frontmatter.image,
      };
    }),
  );

  return items.sort(compareByDateDesc);
}

async function readServicePosts(servicesDir: string): Promise<ServicePost[]> {
  const entries = await fs.readdir(servicesDir, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  });
  const markdownFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".md") &&
        entry.name.toLowerCase() !== "index.md",
    )
    .map((entry) => entry.name);

  const posts = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const filePath = path.join(servicesDir, fileName);
      const raw = await readTextFile(filePath);
      const parsed = matter(raw);
      const frontmatter = parsed.data as ServiceFrontmatter;
      const slug = fileName.replace(/\.md$/i, "");

      return {
        slug,
        title: frontmatter.title ?? slug,
        description: frontmatter.description ?? "",
        priceChf: typeof frontmatter.priceChf === "number" ? frontmatter.priceChf : 0,
        image: frontmatter.image ?? "/images/DSC06840.webp",
        tags: normalizeTags(frontmatter.tags),
        content: parsed.content.trim(),
      };
    }),
  );

  return posts.sort(compareServicesBySlug);
}

// ---------------------------------------------------------------------------
// getSiteContent — merges language-neutral data with locale translations
// ---------------------------------------------------------------------------

export async function getSiteContent(locale: Locale): Promise<SiteContent> {
  const dataDir = path.join(process.cwd(), "content", "data");
  const i18nDir = path.join(process.cwd(), "content", "i18n");
  const localeDir = path.join(process.cwd(), "content", locale);
  const teamDir = path.join(process.cwd(), "content", locale, "team");
  const servicesDir = path.join(process.cwd(), "content", locale, "services");
  const newsDir = path.join(process.cwd(), "content", locale, "news");
  const testimonialsDir = path.join(process.cwd(), "content", locale, "testimonials");

  const [practiceData, teamData, i18n, detailEntries, servicePosts, newsPosts, testimonialItems] = await Promise.all([
    parseYamlFile<PracticeData>(path.join(dataDir, "main.yaml")),
    parseYamlFile<TeamData>(path.join(dataDir, "team.yaml")),
    parseYamlFile<I18nData>(path.join(i18nDir, `${locale}.yaml`)),
    Promise.all(
      sectionKeys.map(async (key) => {
        let filePath: string;
        if (key === "about" || key === "location") {
          filePath = path.join(localeDir, `${key}.md`);
        } else if (key === "team") {
          filePath = path.join(teamDir, "index.md");
        } else if (key === "services") {
          filePath = path.join(servicesDir, "index.md");
        } else if (key === "news") {
          filePath = path.join(newsDir, "index.md");
        } else {
          filePath = path.join(localeDir, `${key}.md`);
        }
        return [key, await parseMarkdownFile(filePath)] as const;
      }),
    ),
    readServicePosts(servicesDir),
    readNewsPosts(newsDir),
    readTestimonialPosts(testimonialsDir),
  ]);

  const details = Object.fromEntries(detailEntries) as Record<SectionKey, string>;

  const teamProfiles = await Promise.all(
    teamData.members.map(async (member) => ({
      slug: member.id,
      content: await parseMarkdownFile(path.join(teamDir, `${member.id}.md`)).catch(() => details.team),
    })),
  );

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
    openingHours: practiceData.openingHours.map((slot) => ({
      day: i18n.days[slot.dayKey] ?? slot.dayKey,
      hours: slot.hours,
    })),
  };

  // Merge team data + role/specialty translations
  const teamPeople = teamData.members.map((member) => ({
    slug: member.id,
    name: member.name,
    slogan: member.slogans?.[locale],
    role: member.titles?.[locale] ?? member.id,
    email: member.email,
    phone: member.phone,
    image: member.image,
    headerImage: member.headerImage,
    specialtyKeys: member.specialtyKeys,
  }));

  const serviceItems = servicePosts.map((item) => ({
    slug: item.slug,
    name: item.title,
    description: item.description,
    price: `${i18n.services.pricePrefix} ${item.priceChf}`,
    image: item.image,
  }));

  const newsItems = newsPosts.map(({ slug, title, date, excerpt }) => ({
    slug,
    title,
    date,
    excerpt,
  }));

  // Build navigation from i18n nav keys (order follows sectionKeys)
  const navigation = sectionKeys.map((k) => ({ label: i18n.nav[k] ?? k, href: `/${getSectionSlug(locale, k)}` }));

  const page: PageContent = {
    navigation,
    hero: {
      eyebrow: i18n.hero.eyebrow,
      title: i18n.hero.title,
      primaryCta: { label: i18n.hero.primaryCta, href: "#services" },
      secondaryCta: { label: i18n.hero.secondaryCta, href: "#location" },
    },
    about: {
      title: i18n.about.title,
      kicker: i18n.nav.about,
      detailLink: i18n.about.detailLink,
    },
    team: {
      title: i18n.team.title,
      intro: i18n.team.intro,
      kicker: i18n.nav.team,
      detailLink: i18n.team.detailLink,
      people: teamPeople,
    },
    services: {
      title: i18n.services.title,
      intro: i18n.services.intro,
      kicker: i18n.nav.services,
      detailLink: i18n.services.detailLink,
      items: serviceItems,
    },
    news: {
      title: i18n.news.title,
      intro: i18n.news.intro,
      kicker: i18n.nav.news,
      detailLink: i18n.news.detailLink,
      items: newsItems,
    },
    location: {
      title: i18n.location.title,
      intro: i18n.location.intro,
      kicker: i18n.nav.location,
      detailLink: i18n.location.detailLink,
      practiceDetailLink: i18n.location.practiceDetailLink,
      addressLabel: i18n.location.addressLabel,
      openingHoursLabel: i18n.location.openingHoursLabel,
      mapLabel: i18n.location.mapLabel,
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
    title: i18n.about.title,
    href: getSectionHref(locale, "about"),
    summary: compactText(details.about, 180),
    haystack: [i18n.about.title, i18n.nav.about, details.about].filter(Boolean).join(" "),
  };

  const locationSearchItem: SearchIndexItem = {
    type: "location",
    title: i18n.location.title,
    href: getSectionHref(locale, "location"),
    summary: compactText(details.location, 180),
    haystack: [i18n.location.title, i18n.nav.location, i18n.location.intro, details.location].filter(Boolean).join(" "),
  };

  const searchIndex = [...teamSearchItems, ...serviceSearchItems, ...newsSearchItems, aboutSearchItem, locationSearchItem];

  return { page, about: details.about, details, practice, teamProfiles, servicePosts, newsPosts, searchIndex };
}