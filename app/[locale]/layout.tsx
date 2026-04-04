import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSiteContent } from "@/lib/content";
import { getLocaleSeoDescription, getLocaleSeoKeywords, getOpenGraphLocale, toAbsoluteUrl } from "@/lib/seo";
import { isLocale, siteConfig } from "@/lib/site-config";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export function generateStaticParams() {
  return siteConfig.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const content = await getSiteContent(locale);
  const serviceTitles = content.servicePosts.map((service) => service.title);
  const description = getLocaleSeoDescription(locale, serviceTitles);
  const title = content.practice.name;
  const defaultImage = content.practice.seo.defaultImage;

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: getLocaleSeoKeywords(locale, serviceTitles),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(siteConfig.locales.map((entry) => [entry, `/${entry}`])),
    },
    openGraph: {
      type: "website",
      url: `/${locale}`,
      siteName: content.practice.name,
      title,
      description,
      images: [{ url: toAbsoluteUrl(defaultImage) }],
      locale: getOpenGraphLocale(locale),
      alternateLocale: siteConfig.locales.filter((entry) => entry !== locale).map(getOpenGraphLocale),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [toAbsoluteUrl(defaultImage)],
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return children;
}
