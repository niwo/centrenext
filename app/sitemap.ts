import type { MetadataRoute } from "next";

import { getSiteContent, sectionKeys } from "@/lib/content";
import { getItemHref, getSectionHref } from "@/lib/routes";
import { toAbsoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

function parseDateOrNow(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  for (const locale of siteConfig.locales) {
    const content = await getSiteContent(locale);

    entries.push({
      url: toAbsoluteUrl(`/${locale}`),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    });

    for (const section of sectionKeys) {
      entries.push({
        url: toAbsoluteUrl(getSectionHref(locale, section)),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const person of content.page.team.people) {
      entries.push({
        url: toAbsoluteUrl(getItemHref(locale, "team", person.slug)),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const service of content.servicePosts) {
      entries.push({
        url: toAbsoluteUrl(getItemHref(locale, "services", service.slug)),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const post of content.newsPosts) {
      entries.push({
        url: toAbsoluteUrl(getItemHref(locale, "news", post.slug)),
        lastModified: parseDateOrNow(post.date),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
