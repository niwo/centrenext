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
    service: string;
  }>;
};

export async function generateStaticParams() {
  const entries = await Promise.all(
    siteConfig.locales.map(async (locale) => {
      const content = await getSiteContent(locale);
      return content.servicePosts.map((entry) => ({ locale, service: entry.slug }));
    }),
  );

  return entries.flat();
}

export default async function ServicePage({ params }: PageProps) {
  const { locale, service } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const content = await getSiteContent(locale as Locale);
  const servicePost = content.servicePosts.find((entry) => entry.slug === service);
  const serviceCard = content.page.services.items.find((entry) => entry.slug === service);

  if (!servicePost || !serviceCard) {
    notFound();
  }

  const relatedTeamMembers = content.page.team.people.filter((person) =>
    person.specialtyKeys.some((tag) => servicePost.tags.includes(tag)),
  );
  const relatedNewsPosts = content.newsPosts.filter((post) => post.tags.some((tag) => servicePost.tags.includes(tag)));

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-hero-glow opacity-90" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <SiteHeader locale={locale} practiceName={content.practice.name} navigation={content.page.navigation} />

        <Card className="space-y-6 overflow-hidden p-0">
          <Image src={serviceCard.image} alt={serviceCard.name} width={1500} height={560} className="h-64 w-full object-cover" />
          <div className="space-y-4 px-6 pb-8 sm:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
              <Link href={`/${locale}`} className="hover:text-forest">
                Start
              </Link>
              <span aria-hidden="true" className="text-clay/60">/</span>
              <Link href={`/${locale}/services`} className="hover:text-forest">
                {content.page.services.title}
              </Link>
              <span aria-hidden="true" className="text-clay/60">/</span>
              <span className="text-forest">{servicePost.title}</span>
            </nav>
            <h1 className="section-title">{servicePost.title}</h1>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              <div className="space-y-4">
                <p className="text-base font-semibold uppercase tracking-[0.24em] text-clay">{serviceCard.price}</p>
                <p className="text-lg leading-8 text-ink/75">{servicePost.description}</p>

                <div className="prose prose-stone prose-lg max-w-none prose-headings:text-forest prose-p:text-ink/80 prose-strong:text-forest">
                  <ReactMarkdown>{servicePost.content}</ReactMarkdown>
                </div>
              </div>

              {relatedTeamMembers.length > 0 || relatedNewsPosts.length > 0 ? (
                <aside className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5 lg:sticky lg:top-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">releated news</p>

                  {relatedTeamMembers.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay/80">{content.page.team.title}</p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {relatedTeamMembers.map((person) => (
                          <li key={person.slug}>
                            <Link
                              href={`/${locale}/team/${person.slug}`}
                              className="inline-flex rounded-full border border-[rgb(var(--color-mist)/0.7)] bg-white/80 px-3 py-1 text-sm font-semibold text-forest transition hover:bg-white"
                            >
                              {person.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {relatedNewsPosts.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay/80">{content.page.news.title}</p>
                      <ul className="mt-2 space-y-2">
                        {relatedNewsPosts.map((post) => (
                          <li key={post.slug}>
                            <Link href={`/${locale}/news/${post.slug}`} className="font-semibold text-forest underline-offset-4 hover:underline">
                              {post.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </aside>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/${locale}/services`}>{content.page.services.detailLink}</Link>
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
