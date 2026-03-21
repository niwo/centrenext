import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getLandingPageContent } from "@/lib/content";

function LanguageFlag({ locale }: { locale: "de" | "fr" }) {
  if (locale === "de") {
    return (
      <svg aria-hidden="true" className="h-4 w-6 overflow-hidden rounded-sm shadow-sm" viewBox="0 0 24 16" fill="none">
        <rect width="24" height="16" fill="#000000" />
        <rect y="5.333" width="24" height="5.334" fill="#DD0000" />
        <rect y="10.666" width="24" height="5.334" fill="#FFCE00" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-4 w-6 overflow-hidden rounded-sm shadow-sm" viewBox="0 0 24 16" fill="none">
      <rect width="8" height="16" fill="#0055A4" />
      <rect x="8" width="8" height="16" fill="#FFFFFF" />
      <rect x="16" width="8" height="16" fill="#EF4135" />
    </svg>
  );
}

const localeLabels = {
  de: "Deutsch",
  fr: "Français",
} as const;

export default async function Home() {
  const content = await getLandingPageContent();
  const localeLinks = Object.fromEntries(content.localeLinks.map((entry) => [entry.locale, entry])) as Record<
    "de" | "fr",
    (typeof content.localeLinks)[number]
  >;

  return (
    <main className="min-h-screen bg-hero-glow">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-16 sm:px-10">
        <div className="max-w-4xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-forest/70">
            {content.brandLabel}
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {content.introByLocale.map((entry) => (
              <section
                key={entry.locale}
                className="flex h-full flex-col rounded-3xl border border-forest/10 bg-white/70 p-6 shadow-soft backdrop-blur-sm"
              >
                <div className="flex flex-1 flex-col justify-center">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-forest/60">
                    {localeLabels[entry.locale]}
                  </p>
                  <h1 className="font-display text-4xl leading-tight text-forest sm:text-5xl">
                    {entry.tagline}
                  </h1>
                </div>
                <Button asChild className="mt-6 w-fit self-start" size="lg">
                  <Link className="gap-3" href={localeLinks[entry.locale].href}>
                    <LanguageFlag locale={entry.locale} />
                    <span>{localeLinks[entry.locale].label}</span>
                  </Link>
                </Button>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}