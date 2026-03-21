import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export default function Home() {
  return (
    <main className="min-h-screen bg-hero-glow">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-16 sm:px-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-forest/70">
            Centre Bien-Etre 2.0
          </p>
          <h1 className="font-display text-5xl leading-tight text-forest sm:text-7xl">
            Mehrsprachige Praxis-Website mit lokal gepflegten Inhalten.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-ink/75">
            Dieses Grundgeruest stellt die Landing Page fuer Deutsch und Franzoesisch bereit,
            laedt Inhalte aus YAML und Markdown und ist fuer statisches Deployment vorbereitet.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {siteConfig.locales.map((locale) => (
            <Button asChild key={locale} size="lg">
              <Link href={`/${locale}`}>{locale === "de" ? "Zur deutschen Version" : "Version francaise"}</Link>
            </Button>
          ))}
        </div>
      </div>
    </main>
  );
}