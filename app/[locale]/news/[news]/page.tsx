import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSiteContent } from "@/lib/content";
import { isLocale, siteConfig, type Locale } from "@/lib/site-config";

type PageProps = {
  params: Promise<{
    locale: string;
    news: string;
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
      return content.newsPosts.map((entry) => ({ locale, news: entry.slug }));
    }),
  );

  return entries.flat();
}

export default async function NewsPostPage({ params }: PageProps) {
  const { locale, news } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const content = await getSiteContent(locale as Locale);
  const post = content.newsPosts.find((entry) => entry.slug === news);

  if (!post) {
    notFound();
  }

  const relatedServices = content.servicePosts.filter((servicePost) =>
    servicePost.tags.some((tag) => post.tags.includes(tag)),
  );

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-hero-glow opacity-90" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <SiteHeader locale={locale} practiceName={content.practice.name} navigation={content.page.navigation} />

        <Card className="space-y-6 overflow-hidden p-0">
          <Image src="/images/DSC06642.jpg" alt={post.title} width={1500} height={560} className="h-64 w-full object-cover" />
          <div className="space-y-4 px-6 pb-8 sm:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
              <Link href={`/${locale}`} className="hover:text-forest">
                Start
              </Link>
              <span aria-hidden="true" className="text-clay/60">/</span>
              <Link href={`/${locale}/news`} className="hover:text-forest">
                {content.page.news.title}
              </Link>
              <span aria-hidden="true" className="text-clay/60">/</span>
              <span className="text-forest">{post.title}</span>
            </nav>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">{formatNewsDate(post.date, locale)}</p>
            <h1 className="section-title">{post.title}</h1>
            <p className="text-lg leading-8 text-ink/75">{post.excerpt}</p>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              <div className="prose prose-stone prose-lg max-w-none prose-headings:text-forest prose-p:text-ink/80 prose-strong:text-forest">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>

              {relatedServices.length > 0 ? (
                <aside className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5 lg:sticky lg:top-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">{content.page.services.title}</p>
                  <ul className="mt-3 space-y-2">
                    {relatedServices.map((servicePost) => (
                      <li key={servicePost.slug}>
                        <Link href={`/${locale}/services/${servicePost.slug}`} className="font-semibold text-forest underline-offset-4 hover:underline">
                          {servicePost.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/${locale}/news`}>{content.page.news.detailLink}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${locale}`}>{content.page.footer.backLink}</Link>
              </Button>
            </div>
          </div>
        </Card>

        <SiteFooter footer={content.page.footer} practice={content.practice} />
      </div>
    </main>
  );
}
