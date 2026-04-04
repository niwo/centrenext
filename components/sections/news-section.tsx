import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getItemHref, getSectionHref } from "@/lib/routes";
import type { Locale } from "@/lib/site-config";

type NewsSectionProps = {
  locale: Locale;
  news: {
    title: string;
    intro: string;
    kicker: string;
    detailLink: string;
    items: Array<{
      slug: string;
      title: string;
      date: string;
      excerpt: string;
    }>;
  };
};

function formatNewsDate(date: string, locale: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(parsed);
}

export function NewsSection({ news, locale }: NewsSectionProps) {
  return (
    <section id="news" className="section-shell flex flex-col gap-6">
      <div className="space-y-2">
        <p className="section-kicker">{news.kicker}</p>
        <h2 className="section-title">{news.title}</h2>
        <p className="max-w-xl text-base leading-7 text-ink/75">{news.intro}</p>
      </div>

      <div className="grid gap-4">
        {news.items.slice(0, 2).map((item) => (
          <Link id={item.slug} key={item.slug} href={getItemHref(locale, "news", item.slug)}>
            <Card className="border-[rgb(var(--color-clay)/0.26)] bg-[rgb(var(--surface-card)/0.97)] shadow-[0_8px_24px_rgb(var(--color-forest)/0.08)] transition hover:border-[rgb(var(--color-clay)/0.38)] hover:bg-white dark:border-[rgb(var(--border-soft)/0.65)] dark:bg-[rgb(var(--surface-elevated)/0.7)] dark:hover:bg-[rgb(var(--surface-elevated)/0.9)]">
              <Image
                src="/images/DSC06642.webp"
                alt={item.title}
                width={960}
                height={420}
                sizes="(max-width: 768px) 100vw, 960px"
                className="h-40 w-full rounded-xl object-cover"
              />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-clay">{formatNewsDate(item.date, locale)}</p>
              <h3 className="mt-3 text-2xl text-forest">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-ink/75">{item.excerpt}</p>
            </Card>
          </Link>
        ))}
      </div>
      <Button asChild variant="outline" className="mt-auto self-start">
        <Link href={getSectionHref(locale, "news")} className="inline-flex items-center gap-2">
          <Newspaper className="h-4 w-4" aria-hidden />
          {news.detailLink}
        </Link>
      </Button>
    </section>
  );
}