import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { getSectionHref } from "@/lib/routes";
import type { Locale } from "@/lib/site-config";

type AboutSectionProps = {
  locale: Locale;
  title: string;
  kicker: string;
  tagline: string;
  detailLink: string;
  about: string;
};

export function AboutSection({ locale, title, kicker, tagline, detailLink, about }: AboutSectionProps) {
  return (
    <section id="about" className="section-shell space-y-0 overflow-hidden p-0">
      <div className="relative h-40 overflow-hidden">
        <Image
          src="/images/DSC06768.jpg"
          alt="Praxisraum"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgb(var(--surface-shell)/0.4)] to-[rgb(var(--surface-shell)/0.97)]" />
      </div>
        <div className="flex flex-col gap-5 px-6 pb-6 pt-2 sm:px-8 sm:pb-8">
        <div className="space-y-2">
          <p className="section-kicker">{kicker}</p>
          <h2 className="section-title">{title}</h2>
          {tagline ? <p className="text-base leading-7 text-ink/70">{tagline}</p> : null}
        </div>
        <div className="prose prose-stone max-w-none prose-headings:text-forest prose-p:text-ink/80 prose-strong:text-forest">
          <ReactMarkdown>{about}</ReactMarkdown>
        </div>
        <Button asChild variant="outline" className="mt-auto self-start">
          <Link href={getSectionHref(locale, "about")}>{detailLink}</Link>
        </Button>
      </div>
    </section>
  );
}