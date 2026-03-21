import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSiteContent } from "@/lib/content";
import { isLocale, siteConfig, type Locale } from "@/lib/site-config";

type PageProps = {
  params: Promise<{
    locale: string;
    member: string;
  }>;
};

export async function generateStaticParams() {
  const entries = await Promise.all(
    siteConfig.locales.map(async (locale) => {
      const content = await getSiteContent(locale);
      return content.page.team.people.map((person) => ({ locale, member: person.slug }));
    }),
  );

  return entries.flat();
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { locale, member } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const content = await getSiteContent(locale as Locale);
  const person = content.page.team.people.find((entry) => entry.slug === member);
  const profile = content.teamProfiles.find((entry) => entry.slug === member);

  if (!person || !profile) {
    notFound();
  }

  const phoneHref = person.phone ? `tel:${person.phone.replace(/\s+/g, "")}` : undefined;

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-hero-glow opacity-90" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <SiteHeader locale={locale} practiceName={content.practice.name} navigation={content.page.navigation} />

        <Card className="space-y-6 p-0 overflow-hidden">
          <Image src={person.image ?? "/images/team/christa.jpg"} alt={person.name} width={1500} height={560} className="h-72 w-full object-cover" />
          <div className="space-y-6 px-6 pb-10 sm:px-10">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
              <Link href={`/${locale}`} className="hover:text-forest">
                Start
              </Link>
              <span aria-hidden="true" className="text-clay/60">/</span>
              <Link href={`/${locale}/team`} className="hover:text-forest">
                {content.page.team.title}
              </Link>
              <span aria-hidden="true" className="text-clay/60">/</span>
              <span className="text-forest">{person.name}</span>
            </nav>
            <h1 className="section-title">{person.name}</h1>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              <div className="space-y-6">
                <p className="text-lg font-semibold uppercase tracking-[0.24em] text-clay">{person.role}</p>
                {person.slogan ? <p className="text-2xl text-ink/80">{person.slogan}</p> : null}

                <ul className="flex flex-wrap gap-3">
                  {person.specialties.map((specialty) => (
                    <li key={specialty}>
                      <Badge
                        variant="secondary"
                        className="rounded-full border border-[rgb(var(--color-mist)/0.6)] bg-[rgb(var(--surface-elevated)/0.9)] px-4 py-1.5 text-sm font-semibold text-forest shadow-sm"
                      >
                        {specialty}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] px-6 py-5 shadow-sm lg:mt-1">
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
            </div>

            <div className="prose prose-stone prose-lg max-w-none prose-headings:text-forest prose-p:text-ink/85 prose-strong:text-forest">
              <ReactMarkdown>{profile.content}</ReactMarkdown>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/${locale}/team`}>{content.page.team.detailLink}</Link>
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
