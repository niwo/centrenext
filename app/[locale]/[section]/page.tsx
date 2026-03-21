import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Building2, Clock3, Home, Mail, MapPin, Phone } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPinned } from "lucide-react";
import { getSiteContent, sectionKeys, type SectionKey } from "@/lib/content";
import { getCanonicalSection, getItemHref, getSectionHref, getSectionSlug } from "@/lib/routes";
import { isLocale, siteConfig, type Locale } from "@/lib/site-config";

type PageProps = {
  params: Promise<{
    locale: string;
    section: string;
  }>;
};

const sectionImageByKey: Record<SectionKey, string> = {
  about: "/images/DSC06768.jpg",
  team: "/images/team/christa.jpg",
  services: "/images/DSC06840.jpg",
  news: "/images/DSC06642.jpg",
  location: "/images/DSC06768.jpg",
};

const aboutGalleryImages = [
  "/images/DSC06642.jpg",
  "/images/DSC06768.jpg",
  "/images/DSC06813.jpg",
  "/images/DSC06840.jpg",
];

function getSectionTitle(section: SectionKey, content: Awaited<ReturnType<typeof getSiteContent>>) {
  if (section === "about") return content.page.about.title;
  if (section === "team") return content.page.team.title;
  if (section === "services") return content.page.services.title;
  if (section === "news") return content.page.news.title;
  return content.page.location.title;
}

function formatNewsDate(date: string, locale: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(parsed);
}

export function generateStaticParams() {
  return siteConfig.locales.flatMap((locale) =>
    sectionKeys.map((section) => ({ locale, section: getSectionSlug(locale, section) })),
  );
}

export default async function SectionPage({ params }: PageProps) {
  const { locale, section } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeValue: Locale = locale;

  const canonicalSection = getCanonicalSection(localeValue, section);

  if (!canonicalSection) {
    notFound();
  }

  const content = await getSiteContent(localeValue);
  const title = getSectionTitle(canonicalSection, content);
  const isAboutSection = canonicalSection === "about";
  const isTeamSection = canonicalSection === "team";
  const isServicesSection = canonicalSection === "services";
  const isNewsSection = canonicalSection === "news";
  const isLocationSection = canonicalSection === "location";

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-hero-glow opacity-90" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <SiteHeader locale={localeValue} practiceName={content.practice.name} navigation={content.page.navigation} />

        <Card className="space-y-6 p-0 overflow-hidden">
          <Image src={sectionImageByKey[canonicalSection]} alt={title} width={1500} height={560} className="h-64 w-full object-cover" />
          <div className="space-y-4 px-6 pb-8 sm:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
              <Link href={`/${locale}`} className="hover:text-forest">
                Start
              </Link>
              <span aria-hidden="true" className="text-clay/60">/</span>
              <span className="text-forest">{title}</span>
            </nav>
            <h1 className="section-title">{title}</h1>
            {isAboutSection ? (
              <>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
                  <div className="prose prose-stone prose-lg max-w-none prose-headings:text-forest prose-p:text-ink/80 prose-strong:text-forest">
                    <ReactMarkdown>{content.details[canonicalSection]}</ReactMarkdown>
                  </div>
                  <Card className="space-y-5 bg-[rgb(var(--surface-elevated)/0.74)]">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                        <Clock3 className="h-4 w-4" />
                        {content.page.location.openingHoursLabel}
                      </p>
                      <div className="mt-4 grid gap-3 text-base text-ink/75">
                        {content.practice.openingHours.map((slot) => (
                          <div
                            key={slot.day}
                            className="flex justify-between gap-6 border-b border-[rgb(var(--border-soft)/0.6)] pb-3 last:border-none last:pb-0"
                          >
                            <span>{slot.day}</span>
                            <span className="font-medium text-forest">{slot.hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
                <Button asChild variant="outline" className="self-start">
                  <Link href={getSectionHref(localeValue, "location")} className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" aria-hidden />
                    {content.page.location.detailLink}
                  </Link>
                </Button>
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">Galerie</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {aboutGalleryImages.map((imageSrc, index) => (
                      <div key={imageSrc} className="overflow-hidden rounded-2xl border border-[rgb(var(--border-soft)/0.6)] bg-[rgb(var(--surface-card)/0.88)]">
                        <Image
                          src={imageSrc}
                          alt={`${title} Bild ${index + 1}`}
                          width={960}
                          height={640}
                          className="h-52 w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : isServicesSection ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {content.page.services.items.map((service) => (
                  <Link
                    key={service.slug}
                    href={getItemHref(localeValue, "services", service.slug)}
                    className="rounded-2xl border border-[rgb(var(--border-soft)/0.65)] bg-[rgb(var(--surface-card)/0.88)] p-6 transition hover:bg-[rgb(var(--surface-elevated)/0.85)]"
                  >
                    <div className="flex items-center gap-5">
                      <div className="overflow-hidden rounded-full border border-[rgb(var(--border-soft)/0.6)]">
                        <Image
                          src={service.image}
                          alt={service.name}
                          width={96}
                          height={96}
                          className="h-[96px] w-[96px] object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-2xl font-semibold text-forest">{service.name}</span>
                        <p className="mt-1 text-base text-ink/70">{service.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : isNewsSection ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {content.newsPosts.map((post) => (
                  <Link
                    id={post.slug}
                    key={post.slug}
                    href={getItemHref(localeValue, "news", post.slug)}
                    className="rounded-2xl border border-[rgb(var(--border-soft)/0.65)] bg-[rgb(var(--surface-card)/0.88)] p-6 transition hover:bg-[rgb(var(--surface-elevated)/0.85)]"
                  >
                    <div className="flex items-center gap-7">
                      <div className="overflow-hidden rounded-full border border-[rgb(var(--border-soft)/0.6)]">
                        <Image
                          src="/images/DSC06642.jpg"
                          alt={post.title}
                          width={96}
                          height={96}
                          className="h-[96px] w-[96px] object-cover"
                        />
                      </div>
                      <div>
                        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.24em] text-clay">{formatNewsDate(post.date, locale)}</p>
                        <h2 className="mt-1 text-2xl font-semibold text-forest">{post.title}</h2>
                        <p className="mt-1 text-lg text-ink/70">{post.excerpt}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : isLocationSection ? (
              <div className="space-y-8">
                <div className="prose prose-stone prose-lg max-w-none prose-headings:text-forest prose-p:text-ink/80 prose-strong:text-forest">
                  <ReactMarkdown>{content.details[canonicalSection]}</ReactMarkdown>
                </div>
                <Card className="max-w-xl space-y-3 bg-[rgb(var(--surface-elevated)/0.74)]">
                  <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                    <MapPinned className="h-4 w-4" />
                    {content.page.location.addressLabel}
                  </p>
                  <address className="not-italic leading-7 text-ink/80">
                    {content.practice.addressLines.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </address>
                  <div className="space-y-2 pt-2 text-ink/75">
                    <a href={`tel:${content.practice.contact.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 hover:text-forest">
                      <Phone className="h-4 w-4 text-clay" />
                      {content.practice.contact.phone}
                    </a>
                    <a href={`mailto:${content.practice.contact.email}`} className="flex items-center gap-2 hover:text-forest">
                      <Mail className="h-4 w-4 text-clay" />
                      {content.practice.contact.email}
                    </a>
                  </div>
                </Card>
                <Button asChild variant="outline" className="self-start">
                  <Link href={getSectionHref(localeValue, "about")} className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4" aria-hidden />
                    {content.page.location.practiceDetailLink}
                  </Link>
                </Button>
                <div className="overflow-hidden rounded-[1.75rem] border border-[rgb(var(--border-soft)/0.6)] bg-[rgb(var(--surface-card)/0.9)] shadow-soft">
                  <div className="border-b border-stone-200 px-5 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                    {content.page.location.mapLabel}
                  </div>
                  <iframe
                    title={content.page.location.title}
                    src={content.practice.mapEmbedUrl}
                    className="h-[420px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            ) : isTeamSection ? (
              <div className="space-y-8">
                <div className="prose prose-stone prose-lg max-w-none prose-headings:text-forest prose-p:text-ink/80 prose-strong:text-forest">
                  <ReactMarkdown>{content.details[canonicalSection]}</ReactMarkdown>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {content.page.team.people.map((person) => (
                    <Link
                      key={person.slug}
                      href={getItemHref(localeValue, "team", person.slug)}
                      className="rounded-2xl border border-[rgb(var(--border-soft)/0.65)] bg-[rgb(var(--surface-card)/0.88)] p-6 transition hover:bg-[rgb(var(--surface-elevated)/0.85)]"
                    >
                      <div className="flex items-center gap-5">
                        <div className="overflow-hidden rounded-full border border-[rgb(var(--border-soft)/0.6)]">
                          <Image
                            src={person.image ?? "/images/team/christa.jpg"}
                            alt={person.name}
                            width={96}
                            height={96}
                            className="h-[96px] w-[96px] object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-2xl font-semibold text-forest">{person.name}</span>
                          {person.slogan ? <p className="mt-1 text-lg text-ink/70">{person.slogan}</p> : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="prose prose-stone prose-lg max-w-none prose-headings:text-forest prose-p:text-ink/80 prose-strong:text-forest">
                  <ReactMarkdown>{content.details[canonicalSection]}</ReactMarkdown>
                </div>
              </div>
            )}
            <div className="mt-12">
              <Button asChild>
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