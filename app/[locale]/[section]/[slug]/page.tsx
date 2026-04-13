import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Check, Globe, HeartPulse, Home, Instagram, Linkedin, Mail, Newspaper, Phone, User, Users, X } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ExpandableNewsList } from "@/components/ui/expandable-news-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WeeklySchedule } from "@/components/ui/weekly-schedule";
import { getSiteContent, type SectionKey } from "@/lib/content";
import { getCanonicalSection, getItemHref, getSectionHref, getSectionSlug } from "@/lib/routes";
import { isLocale, siteConfig, type Locale } from "@/lib/site-config";
import { cn, getServiceColorClasses } from "@/lib/utils";

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

function formatChfPrice(amountChf: number) {
  if (Number.isInteger(amountChf)) {
    return `CHF ${amountChf}.-`;
  }

  return `CHF ${amountChf.toFixed(2)}`;
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

      return [
        ...content.page.team.people.map((person) => ({ locale, section: translatedSection.team, slug: person.slug })),
        ...content.servicePosts.map((entry) => ({ locale, section: translatedSection.services, slug: entry.slug })),
        ...content.newsPosts.map((entry) => ({ locale, section: translatedSection.news, slug: entry.slug })),
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
      person.tags.some((tag) => servicePost.tags.includes(tag)),
    );
    const relatedNewsPosts = content.newsPosts.filter((post) => post.tags.some((tag) => servicePost.tags.includes(tag)));

    return (
      <main className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-hero-glow opacity-90" />
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
          <SiteHeader locale={localeValue} practiceName={content.practice.name} searchLabel={content.page.searchLabel} navigation={content.page.navigation} searchItems={content.searchIndex} />

          <Card className="space-y-6 overflow-hidden p-0">
            <Image src={serviceCard.image} alt={serviceCard.name} width={1500} height={560} sizes="(max-width: 1280px) 100vw, 1200px" className="h-64 w-full object-cover" />
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
                  <p className="text-lg leading-8 text-ink/75">{servicePost.description}</p>

                  <div className="prose prose-stone prose-lg max-w-none prose-headings:text-forest prose-p:text-ink/80 prose-strong:text-forest">
                    <ReactMarkdown>{servicePost.content}</ReactMarkdown>
                  </div>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-6">
                  <div className="space-y-2 rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] px-4 py-3 text-sm text-ink/80">
                    <p className="font-semibold uppercase tracking-[0.2em] text-clay">{content.page.services.priceLabel}</p>
                    <ul className="space-y-2">
                      {servicePost.prices.map((price, index) => (
                        <li
                          key={`${price.amountChf}-${price.unit}-${index}`}
                          className="rounded-xl border border-[rgb(var(--color-mist)/0.45)] bg-white/70 px-3 py-2 dark:border-[rgb(var(--border-soft)/0.7)] dark:bg-[rgb(var(--surface-card)/0.98)]"
                        >
                          <p className="text-base font-semibold text-forest">{formatChfPrice(price.amountChf)} / {price.unit}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] px-4 py-3 text-sm text-ink/80">
                    <p className="font-semibold uppercase tracking-[0.2em] text-clay">{content.page.services.insuranceLabel}</p>
                    {servicePost.insurance.obligatory_coverage || servicePost.insurance.supplementary.covered ? (
                      <div className="space-y-2">
                        <div className="rounded-xl border border-[rgb(var(--color-mist)/0.45)] bg-white/70 px-3 py-2 dark:border-[rgb(var(--border-soft)/0.7)] dark:bg-[rgb(var(--surface-card)/0.98)]">
                          <p>
                            <span className="font-semibold text-ink">{content.page.services.insuranceObligatoryLabel}:</span>{" "}
                            {servicePost.insurance.obligatory_coverage ? (
                              <span className="inline-flex items-center text-emerald-700 align-middle" aria-label={content.page.services.insuranceCoveredLabel}>
                                <Check className="h-4 w-4" aria-hidden="true" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-rose-700 align-middle" aria-label={content.page.services.insuranceNotCoveredLabel}>
                                <X className="h-4 w-4" aria-hidden="true" />
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[rgb(var(--color-mist)/0.45)] bg-white/70 px-3 py-2 dark:border-[rgb(var(--border-soft)/0.7)] dark:bg-[rgb(var(--surface-card)/0.98)]">
                          {servicePost.insurance.supplementary.covered ? (
                            <div className="space-y-1">
                              <p className="font-semibold text-ink">
                                {servicePost.insurance.supplementary.allExcept
                                  ? content.page.services.insuranceAllExceptLabel
                                  : content.page.services.insuranceSupplementaryInsurersLabel}
                                :
                              </p>
                              <ul className="flex flex-wrap gap-2">
                                {(servicePost.insurance.supplementary.insurers.length > 0
                                  ? servicePost.insurance.supplementary.insurers
                                  : [content.page.services.insuranceAllInsurersLabel]
                                ).map((insurer) => (
                                  <li key={insurer}>
                                    <span className="inline-flex rounded-full border border-[rgb(var(--color-mist)/0.7)] bg-white/80 px-3 py-1 text-sm font-semibold text-ink/85 dark:border-[rgb(var(--border-soft)/0.7)] dark:bg-[rgb(var(--surface-shell)/0.98)] dark:text-ink">
                                      {insurer}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p className="font-semibold text-ink">{content.page.services.insuranceSupplementaryLabel}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p>{content.page.services.insuranceNoCoverageLabel}</p>
                    )}
                  </div>

                  {relatedTeamMembers.length > 0 ? (
                    <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay/80">{content.page.footer.contactKicker}</p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {relatedTeamMembers.map((person) => (
                          <li key={person.slug}>
                            <Link
                              href={getItemHref(localeValue, "team", person.slug)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--color-mist)/0.7)] bg-white/80 px-3 py-1 text-sm font-semibold text-forest transition hover:bg-white dark:border-[rgb(var(--border-soft)/0.7)] dark:bg-[rgb(var(--surface-shell)/0.98)] dark:text-ink dark:hover:bg-[rgb(var(--surface-card)/1)]"
                            >
                              <User className="h-3.5 w-3.5" aria-hidden />
                              {person.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {relatedNewsPosts.length > 0 ? (
                    <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay/80">{content.page.news.sectionTitle}</p>
                      <ul className="mt-2 space-y-2">
                        {relatedNewsPosts.map((post) => (
                          <li key={post.slug}>
                            <Link href={getItemHref(localeValue, "news", post.slug)} className="inline-flex items-center gap-2 font-semibold text-forest underline-offset-4 hover:underline">
                              <Newspaper className="h-4 w-4" aria-hidden />
                              {post.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </aside>
              </div>

              <div className="mt-12 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={getSectionHref(localeValue, "services")} className="inline-flex items-center gap-2">
                    <HeartPulse className="h-4 w-4" aria-hidden />
                    {content.page.services.detailLink}
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

  if (canonicalSection === "news") {
    const post = content.newsPosts.find((entry) => entry.slug === slug);

    if (!post) {
      notFound();
    }

    const relatedServices = content.servicePosts.filter((servicePost) =>
      servicePost.tags.some((tag) => post.tags.includes(tag)),
    );
    const relatedTeamMembers = content.page.team.people.filter((person) =>
      person.tags.some((tag) => post.tags.includes(tag)),
    );

    return (
      <main className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-hero-glow opacity-90" />
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
          <SiteHeader locale={localeValue} practiceName={content.practice.name} searchLabel={content.page.searchLabel} navigation={content.page.navigation} searchItems={content.searchIndex} />

          <Card className="space-y-6 overflow-hidden p-0">
            <Image src={post.image} alt={post.title} width={1500} height={560} sizes="(max-width: 1280px) 100vw, 1200px" className="h-64 w-full object-cover" />
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
                <span className="text-forest">{post.title}</span>
              </nav>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">{formatNewsDate(post.date, locale)}</p>
              <h1 className="section-title">{post.title}</h1>
              <p className="text-lg leading-8 text-ink/75">{post.excerpt}</p>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
                <div className="prose prose-stone prose-lg max-w-none prose-headings:text-forest prose-p:text-ink/80 prose-strong:text-forest">
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>

                {relatedServices.length > 0 || relatedTeamMembers.length > 0 ? (
                  <aside className="space-y-4 lg:sticky lg:top-6">
                    {relatedServices.length > 0 ? (
                      <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5">
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
                      </div>
                    ) : null}

                    {relatedTeamMembers.length > 0 ? (
                      <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay/80">{content.page.footer.contactKicker}</p>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {relatedTeamMembers.map((person) => (
                            <li key={person.slug}>
                              <Link
                                href={getItemHref(localeValue, "team", person.slug)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--color-mist)/0.7)] bg-white/80 px-3 py-1 text-sm font-semibold text-forest transition hover:bg-white dark:border-[rgb(var(--border-soft)/0.7)] dark:bg-[rgb(var(--surface-shell)/0.98)] dark:text-ink dark:hover:bg-[rgb(var(--surface-card)/1)]"
                              >
                                <User className="h-3.5 w-3.5" aria-hidden />
                                {person.name}
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

  const person = content.page.team.people.find((entry) => entry.slug === slug);
  const profile = content.teamProfiles.find((entry) => entry.slug === slug);

  if (!person || !profile) {
    notFound();
  }

  const relatedServices = content.servicePosts.filter((servicePost) =>
    servicePost.tags.some((tag) => person.tags.includes(tag)),
  );
  const relatedNewsPosts = content.newsPosts.filter((post) =>
    post.tags.some((tag) => person.tags.includes(tag)),
  );
  const phoneHref = person.phone ? `tel:${person.phone.replace(/\s+/g, "")}` : undefined;
  const socialIconByPlatform = {
    website: Globe,
    instagram: Instagram,
    linkedin: Linkedin,
  } as const;
  const socialLabelByPlatform = {
    website: "Website",
    instagram: "Instagram",
    linkedin: "LinkedIn",
  } as const;
  const formatSocialLinkText = (href: string) => href.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-hero-glow opacity-90" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <SiteHeader locale={localeValue} practiceName={content.practice.name} searchLabel={content.page.searchLabel} navigation={content.page.navigation} searchItems={content.searchIndex} />

        <Card className="space-y-6 p-0 overflow-hidden">
          <div className="relative">
            <Image src={person.headerImage ?? person.image ?? "/media/team-christa.webp"} alt={person.name} width={1500} height={560} sizes="(max-width: 1280px) 100vw, 1200px" className="h-72 w-full object-cover" />
            <div className="absolute -bottom-14 left-6 sm:left-10">
              <Image
                src={person.image ?? "/media/team-christa.webp"}
                alt={person.name}
                width={112}
                height={112}
                sizes="112px"
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md"
              />
            </div>
          </div>
          <div className="px-6 pb-10 pt-16 sm:px-10">
            <div className="flow-root">
              <aside className="mb-6 w-full space-y-4 lg:float-right lg:mb-4 lg:ml-8 lg:w-[22rem]">
                <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] px-6 py-5 shadow-sm">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-clay">{content.page.footer.contactKicker}</p>
                  <div className="space-y-2 text-base text-ink/80">
                    {person.email ? (
                      <a href={`mailto:${person.email}`} className="inline-flex items-center gap-2 font-semibold text-forest underline-offset-4 hover:underline">
                        <Mail className="h-4 w-4" aria-hidden />
                        {person.email}
                      </a>
                    ) : null}
                    {person.phone && phoneHref ? (
                      <a href={phoneHref} className="inline-flex items-center gap-2 font-semibold text-forest underline-offset-4 hover:underline">
                        <Phone className="h-4 w-4" aria-hidden />
                        {person.phone}
                      </a>
                    ) : null}
                  </div>

                  {person.socialLinks && person.socialLinks.length > 0 ? (
                    <div className="mt-4 space-y-2 text-base text-ink/80">
                      {person.socialLinks.map((social) => {
                        const SocialIcon = socialIconByPlatform[social.platform];
                        const socialLabel = socialLabelByPlatform[social.platform];

                        return (
                          <a
                            key={`${social.platform}-${social.href}`}
                            href={social.href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={socialLabel}
                            title={socialLabel}
                            className="inline-flex items-center gap-2 font-semibold text-forest underline-offset-4 hover:underline"
                          >
                            <SocialIcon className="h-4 w-4" aria-hidden />
                            {formatSocialLinkText(social.href)}
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                {person.schedule && person.schedule.length > 0 ? (
                  <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] px-6 py-5 shadow-sm">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-clay">
                      {content.page.team.scheduleTitle}
                    </p>
                    <WeeklySchedule
                      schedule={person.schedule}
                      dayLabels={content.days}
                      morningLabel={content.page.team.scheduleMorningLabel}
                      afternoonLabel={content.page.team.scheduleAfternoonLabel}
                    />
                  </div>
                ) : null}

                {relatedServices.length > 0 ? (
                  <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5">
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
                  </div>
                ) : null}

                {relatedNewsPosts.length > 0 ? (
                  <ExpandableNewsList
                    title={content.page.news.sectionTitle}
                    showAllLabel={content.page.news.showAllLabel}
                    items={relatedNewsPosts.map((post) => ({
                      slug: post.slug,
                      title: post.title,
                      href: getItemHref(localeValue, "news", post.slug),
                    }))}
                  />
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
                <Link href={getSectionHref(localeValue, "team")} className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4" aria-hidden />
                  {content.page.team.detailLink}
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
