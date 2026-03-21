import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AboutSection } from "@/components/sections/about-section";
import { HeroSection } from "@/components/sections/hero-section";
import { LocationSection } from "@/components/sections/location-section";
import { NewsSection } from "@/components/sections/news-section";
import { ServicesSection } from "@/components/sections/services-section";
import { TeamSection } from "@/components/sections/team-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { getSiteContent } from "@/lib/content";
import { isLocale, siteConfig, type Locale } from "@/lib/site-config";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export function generateStaticParams() {
  return siteConfig.locales.map((locale) => ({ locale }));
}

export default async function LocalePage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeValue: Locale = locale;
  const content = await getSiteContent(localeValue);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-hero-glow opacity-90" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <SiteHeader locale={localeValue} practiceName={content.practice.name} navigation={content.page.navigation} searchItems={content.searchIndex} />
        <HeroSection hero={content.page.hero} locale={locale} tagline={content.practice.tagline} />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <AboutSection locale={localeValue} about={content.about} title={content.page.about.title} kicker={content.page.about.kicker} tagline={content.practice.tagline} detailLink={content.page.about.detailLink} />
          <TeamSection locale={localeValue} team={content.page.team} />
        </div>
        <ServicesSection locale={localeValue} services={content.page.services} />
        <TestimonialsSection locale={locale} testimonials={content.page.testimonials} />
        <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
          <NewsSection locale={localeValue} news={content.page.news} />
          <LocationSection locale={localeValue} location={content.page.location} practice={content.practice} />
        </div>
        <SiteFooter footer={content.page.footer} practice={content.practice} />
      </div>
    </main>
  );
}