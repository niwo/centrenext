import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

type HeroSectionProps = {
  locale: string;
  tagline: string;
  hero: {
    eyebrow: string;
    title: string;
    primaryCta: {
      label: string;
      href: string;
    };
    secondaryCta: {
      label: string;
      href: string;
    };
  };
};

export function HeroSection({ hero, locale, tagline }: HeroSectionProps) {
  return (
    <section id="hero" className="section-shell relative overflow-hidden p-0">
      <Image
        src="/images/DSC06813.webp"
        alt="Praxis Impression"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(var(--surface-card)/0.9),rgb(var(--surface-elevated)/0.82)_42%,rgb(var(--surface-shell)/0.72))]" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest/25 via-transparent to-transparent" />

      <div className="relative space-y-6 px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <p className="section-kicker">{hero.eyebrow}</p>
        <div className="max-w-4xl space-y-5">
          <h1 className="font-display text-5xl leading-none text-forest sm:text-7xl">{tagline}</h1>
          <p className="max-w-3xl text-xl leading-9 text-ink/80">{hero.title}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={`/${locale}${hero.primaryCta.href}`}>{hero.primaryCta.label}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={`/${locale}${hero.secondaryCta.href}`}>{hero.secondaryCta.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}