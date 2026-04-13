import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Home, Newspaper } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSiteContent } from "@/lib/content";
import { getItemHref, getSectionHref } from "@/lib/routes";
import { isLocale, siteConfig, type Locale } from "@/lib/site-config";
import { cn, getServiceColorClasses } from "@/lib/utils";

type PageProps = {
  params: Promise<{
    locale: string;
    post: string;
  }>;
};

function formatNewsDate(date: string, locale: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(parsed);
}

export async function generateStaticParams() {
  const entries = await Promise.all(
    siteConfig.locales.map(async (locale) => {
      const content = await getSiteContent(locale);
      return content.newsPosts.map((entry) => ({ locale, post: entry.slug }));
    }),
  );

  return entries.flat();
}

export default async function NewsPostPage({ params }: PageProps) {
  const { locale, post } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeValue: Locale = locale;
  const content = await getSiteContent(localeValue);
  const newsPost = content.newsPosts.find((entry) => entry.slug === post);

  if (!newsPost) {
    notFound();
  }

  const relatedServices = content.servicePosts.filter((servicePost) =>
    servicePost.tags.some((tag) => newsPost.tags.includes(tag)),
  );

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-hero-glow opacity-90" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <SiteHeader locale={localeValue} practiceName={content.practice.name} searchLabel={content.page.searchLabel} navigation={content.page.navigation} searchItems={content.searchIndex} />

        <Card className="space-y-6 overflow-hidden p-0">
          <Image src={newsPost.image} alt={newsPost.title} width={1500} height={560} sizes="(max-width: 1280px) 100vw, 1200px" className="h-64 w-full object-cover" />
          <div className="space-y-4 px-6 pb-8 sm:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
              <Link href={`/${locale}`} className="hover:text-forest">
                Start
              </Link>
              <span aria-hidden="true" className="text-clay/60">/</span>
              <Link href={getSectionHref(localeValue, "news")} className="hover:text-forest">
                {content.page.news.sectionTitle}
              </Link>
              <span aria-hidden="true" className="text-clay/60">/</span>
              <span className="text-forest">{newsPost.title}</span>
            </nav>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">{formatNewsDate(newsPost.date, locale)}</p>
            <h1 className="section-title">{newsPost.title}</h1>
            <p className="text-lg leading-8 text-ink/75">{newsPost.excerpt}</p>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              <div className="prose prose-stone prose-lg max-w-none prose-headings:text-forest prose-p:text-ink/80 prose-strong:text-forest">
                <ReactMarkdown>{newsPost.content}</ReactMarkdown>
              </div>

              {relatedServices.length > 0 ? (
                <aside className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5 lg:sticky lg:top-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">{content.page.services.title}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {relatedServices.map((servicePost) => (
                      <li key={servicePost.slug}>
                        <Link
                          href={getItemHref(localeValue, "services", servicePost.slug)}
                          className={cn(
                            "inline-flex rounded-full border px-3 py-1 text-sm font-semibold transition",
                            getServiceColorClasses(servicePost.tag_color, servicePost.tags),
                          )}
                        >
                          {servicePost.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}
            </div>

            <div className="mt-12 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={getSectionHref(localeValue, "news")} className="inline-flex items-center gap-2">
                  <Newspaper className="h-4 w-4" aria-hidden />
                  {content.page.news.detailLink}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${locale}`} className="inline-flex items-center gap-2">
                  <Home className="h-4 w-4" aria-hidden />
                  {content.page.footer.backLink}
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        <SiteFooter footer={content.page.footer} practice={content.practice} />
      </div>
    </main>
  );
}
