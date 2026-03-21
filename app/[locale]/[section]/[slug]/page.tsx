import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSiteContent, type SectionKey } from "@/lib/content";
import { getCanonicalSection, getItemHref, getSectionHref, getSectionSlug } from "@/lib/routes";
import { isLocale, siteConfig, type Locale } from "@/lib/site-config";

type PageProps = {
  params: Promise<{
    locale: string;
    section: string;
    slug: string;
  }>;
};

function isDetailSection(value: SectionKey): value is "team" | "services" | "news" {
  return value === "team" || value === "services" || value === "news";
}

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
      const translatedSection = {
        team: getSectionSlug(locale, "team"),
        services: getSectionSlug(locale, "services"),
        news: getSectionSlug(locale, "news"),
      };
      const isTranslated = {
        team: translatedSection.team !== "team",
        services: translatedSection.services !== "services",
        news: translatedSection.news !== "news",
      };

      return [
        ...(isTranslated.team
          ? content.page.team.people.map((person) => ({ locale, section: translatedSection.team, slug: person.slug }))
          : []),
        ...(isTranslated.services
          ? content.servicePosts.map((entry) => ({ locale, section: translatedSection.services, slug: entry.slug }))
          : []),
        ...(isTranslated.news
          ? content.newsPosts.map((entry) => ({ locale, section: translatedSection.news, slug: entry.slug }))
          : []),
      ];
    }),
  );

  return entries.flat();
}

export default async function LocalizedDetailPage({ params }: PageProps) {
  const { locale, section, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeValue: Locale = locale;

  const canonicalSection = getCanonicalSection(localeValue, section);

  if (!canonicalSection || !isDetailSection(canonicalSection)) {
    notFound();
  }

  const content = await getSiteContent(localeValue);

  if (canonicalSection === "services") {
    const servicePost = content.servicePosts.find((entry) => entry.slug === slug);
    const serviceCard = content.page.services.items.find((entry) => entry.slug === slug);

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
          <SiteHeader locale={localeValue} practiceName={content.practice.name} navigation={content.page.navigation} />

          <Card className="space-y-6 overflow-hidden p-0">
            <Image src={serviceCard.image} alt={serviceCard.name} width={1500} height={560} className="h-64 w-full object-cover" />
            <div className="space-y-4 px-6 pb-8 sm:px-8">
              <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
                <Link href={`/${locale}`} className="hover:text-forest">
                  Start
                </Link>
                <span aria-hidden="true" className="text-clay/60">/</span>
                <Link href={getSectionHref(localeValue, "services")} className="hover:text-forest">
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
                  <aside className="space-y-4 lg:sticky lg:top-6">
                    {relatedTeamMembers.length > 0 ? (
                      <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay/80">{content.page.footer.contactKicker}</p>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {relatedTeamMembers.map((person) => (
                            <li key={person.slug}>
                              <Link
                                href={getItemHref(localeValue, "team", person.slug)}
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
                      <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay/80">{content.page.news.title}</p>
                        <ul className="mt-2 space-y-2">
                          {relatedNewsPosts.map((post) => (
                            <li key={post.slug}>
                              <Link href={getItemHref(localeValue, "news", post.slug)} className="font-semibold text-forest underline-offset-4 hover:underline">
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

              <div className="mt-12 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={getSectionHref(localeValue, "services")}>{content.page.services.detailLink}</Link>
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

  if (canonicalSection === "news") {
    const post = content.newsPosts.find((entry) => entry.slug === slug);

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
          <SiteHeader locale={localeValue} practiceName={content.practice.name} navigation={content.page.navigation} />

          <Card className="space-y-6 overflow-hidden p-0">
            <Image src="/images/DSC06642.jpg" alt={post.title} width={1500} height={560} className="h-64 w-full object-cover" />
            <div className="space-y-4 px-6 pb-8 sm:px-8">
              <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
                <Link href={`/${locale}`} className="hover:text-forest">
                  Start
                </Link>
                <span aria-hidden="true" className="text-clay/60">/</span>
                <Link href={getSectionHref(localeValue, "news")} className="hover:text-forest">
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
                          <Link href={getItemHref(localeValue, "services", servicePost.slug)} className="font-semibold text-forest underline-offset-4 hover:underline">
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
                  <Link href={getSectionHref(localeValue, "news")}>{content.page.news.detailLink}</Link>
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

  const person = content.page.team.people.find((entry) => entry.slug === slug);
  const profile = content.teamProfiles.find((entry) => entry.slug === slug);

  if (!person || !profile) {
    notFound();
  }

  const relatedServices = content.servicePosts.filter((servicePost) =>
    servicePost.tags.some((tag) => person.specialtyKeys.includes(tag)),
  );
  const relatedNewsPosts = content.newsPosts.filter((post) =>
    post.tags.some((tag) => person.specialtyKeys.includes(tag)),
  );
  const phoneHref = person.phone ? `tel:${person.phone.replace(/\s+/g, "")}` : undefined;

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-hero-glow opacity-90" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <SiteHeader locale={localeValue} practiceName={content.practice.name} navigation={content.page.navigation} />

        <Card className="space-y-6 p-0 overflow-hidden">
          <div className="relative">
            <Image src={person.headerImage ?? person.image ?? "/images/team/christa.jpg"} alt={person.name} width={1500} height={560} className="h-72 w-full object-cover" />
            <div className="absolute -bottom-14 left-6 sm:left-10">
              <Image
                src={person.image ?? "/images/team/christa.jpg"}
                alt={person.name}
                width={112}
                height={112}
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md"
              />
            </div>
          </div>
          <div className="px-6 pb-10 pt-16 sm:px-10">
            <div className="flow-root">
              <aside className="mb-6 w-full space-y-4 lg:float-right lg:mb-4 lg:ml-8 lg:w-[22rem]">
                <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] px-6 py-5 shadow-sm">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-clay">{content.page.footer.contactKicker}</p>
                  <div className="space-y-2 text-lg text-ink/80">
                    {person.email ? (
                      <p>
                        E-Mail: <a href={`mailto:${person.email}`} className="font-semibold text-forest underline-offset-4 hover:underline">{person.email}</a>
                      </p>
                    ) : null}
                    {person.phone && phoneHref ? (
                      <p>
                        Telefon: <a href={phoneHref} className="font-semibold text-forest underline-offset-4 hover:underline">{person.phone}</a>
                      </p>
                    ) : null}
                  </div>
                </div>

                {relatedServices.length > 0 ? (
                  <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">{content.page.services.title}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {relatedServices.map((servicePost) => (
                        <li key={servicePost.slug}>
                          <Link
                            href={getItemHref(localeValue, "services", servicePost.slug)}
                            className="inline-flex rounded-full border border-[rgb(var(--color-mist)/0.7)] bg-white/80 px-3 py-1 text-sm font-semibold text-forest transition hover:bg-white"
                          >
                            {servicePost.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {relatedNewsPosts.length > 0 ? (
                  <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">{content.page.news.title}</p>
                    <ul className="mt-3 space-y-2">
                      {relatedNewsPosts.map((post) => (
                        <li key={post.slug}>
                          <Link href={getItemHref(localeValue, "news", post.slug)} className="font-semibold text-forest underline-offset-4 hover:underline">
                            {post.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </aside>

              <div className="space-y-6">
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
                  <Link href={`/${locale}`} className="hover:text-forest">
                    Start
                  </Link>
                  <span aria-hidden="true" className="text-clay/60">/</span>
                  <Link href={getSectionHref(localeValue, "team")} className="hover:text-forest">
                    {content.page.team.title}
                  </Link>
                  <span aria-hidden="true" className="text-clay/60">/</span>
                  <span className="text-forest">{person.name}</span>
                </nav>
                <h1 className="section-title font-black bg-gradient-to-r from-forest via-teal-700 to-forest bg-clip-text text-transparent">{person.name}</h1>
                <p className="text-lg font-semibold uppercase tracking-[0.24em] text-clay">{person.role}</p>
                {person.slogan ? (
                  <blockquote className="border-l-4 border-forest pl-6 py-2 italic text-2xl text-ink/80">
                    &ldquo;{person.slogan}&rdquo;
                  </blockquote>
                ) : null}

                <div className="prose prose-stone prose-lg max-w-none prose-headings:text-forest prose-p:text-ink/85 prose-strong:text-forest">
                  <ReactMarkdown>{profile.content}</ReactMarkdown>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={getSectionHref(localeValue, "team")}>{content.page.team.detailLink}</Link>
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
