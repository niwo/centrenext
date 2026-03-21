import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { getSiteContent } from "@/lib/content";
import { getItemHref } from "@/lib/routes";
import { isLocale, siteConfig, type Locale } from "@/lib/site-config";

import { SearchClient } from "./search-client";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type SearchItem = {
  type: "team" | "services" | "news";
  title: string;
  href: string;
  summary: string;
  haystack: string;
};

function compact(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function generateStaticParams() {
  return siteConfig.locales.map((locale) => ({ locale }));
}

export default async function SearchPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeValue: Locale = locale;
  const content = await getSiteContent(localeValue);

  const teamProfileMap = Object.fromEntries(content.teamProfiles.map((profile) => [profile.slug, profile.content]));

  const teamItems: SearchItem[] = content.page.team.people.map((person) => {
    const profileContent = teamProfileMap[person.slug] ?? "";
    const summary = compact([person.role, person.slogan, profileContent].filter(Boolean).join(" - "), 180);
    return {
      type: "team",
      title: person.name,
      href: getItemHref(localeValue, "team", person.slug),
      summary,
      haystack: [person.name, person.role, person.slogan, profileContent].filter(Boolean).join(" "),
    };
  });

  const serviceItems: SearchItem[] = content.servicePosts.map((post) => ({
    type: "services",
    title: post.title,
    href: getItemHref(localeValue, "services", post.slug),
    summary: compact([post.description, post.content].filter(Boolean).join(" - "), 180),
    haystack: [post.title, post.description, post.content, post.tags.join(" ")].filter(Boolean).join(" "),
  }));

  const newsItems: SearchItem[] = content.newsPosts.map((post) => ({
    type: "news",
    title: post.title,
    href: getItemHref(localeValue, "news", post.slug),
    summary: compact([post.excerpt, post.content].filter(Boolean).join(" - "), 180),
    haystack: [post.title, post.excerpt, post.content, post.tags.join(" ")].filter(Boolean).join(" "),
  }));

  const searchItems = [...teamItems, ...serviceItems, ...newsItems];

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-hero-glow opacity-90" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <SiteHeader locale={localeValue} practiceName={content.practice.name} navigation={content.page.navigation} searchItems={content.searchIndex} />

        <Card className="space-y-6 p-6 sm:p-8">
          <SearchClient locale={localeValue} items={searchItems} />
        </Card>

        <SiteFooter footer={content.page.footer} practice={content.practice} />
      </div>
    </main>
  );
}
