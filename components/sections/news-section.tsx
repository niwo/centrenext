import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type NewsSectionProps = {
  locale: string;
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
        {news.items.map((item) => (
          <Link id={item.slug} key={item.slug} href={`/${locale}/news/${item.slug}`}>
            <Card className="bg-[rgb(var(--surface-elevated)/0.7)] transition hover:bg-[rgb(var(--surface-elevated)/0.9)]">
              <Image src="/images/DSC06642.jpg" alt={item.title} width={960} height={420} className="h-40 w-full rounded-xl object-cover" />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-clay">{formatNewsDate(item.date, locale)}</p>
              <h3 className="mt-3 text-2xl text-forest">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-ink/75">{item.excerpt}</p>
            </Card>
          </Link>
        ))}
      </div>
      <Button asChild variant="outline" className="mt-auto self-start">
        <Link href={`/${locale}/news`}>{news.detailLink}</Link>
      </Button>
    </section>
  );
}