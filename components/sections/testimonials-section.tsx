import Image from "next/image";
import { UserCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { TestimonialItem } from "@/lib/content";

type TestimonialsSectionProps = {
  locale: string;
  testimonials: {
    title: string;
    kicker: string;
    items: TestimonialItem[];
  };
};

const cardColors = [
  "bg-forest/5 border-forest/15",
  "bg-[rgb(var(--color-clay)/0.07)] border-[rgb(var(--color-clay)/0.2)]",
  "bg-[rgb(var(--color-mist)/0.5)] border-[rgb(var(--color-mist)/0.8)]",
  "bg-[rgb(var(--surface-elevated)/0.9)] border-[rgb(var(--color-mist)/0.5)]",
] as const;

export function TestimonialsSection({ testimonials, locale }: TestimonialsSectionProps) {
  const scrollingItems = [...testimonials.items, ...testimonials.items];

  return (
    <section id="testimonials" className="section-shell space-y-6">
      <div className="space-y-2">
        <p className="section-kicker">{testimonials.kicker}</p>
        <h2 className="section-title">{testimonials.title}</h2>
      </div>

      <div className="testimonials-marquee">
        <div className="testimonials-track">
          {scrollingItems.map((item, index) => (
            <Card
              key={`${item.slug}-${index}`}
              className={`flex w-[17rem] shrink-0 flex-col gap-4 border p-5 sm:w-[18.5rem] ${cardColors[index % cardColors.length]}`}
            >
              <blockquote className="flex-1 text-base leading-7 text-ink/85 italic">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                {item.image ? (
                  <div className="overflow-hidden rounded-full border border-[rgb(var(--border-soft)/0.6)]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
                    <UserCircle className="h-7 w-7" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-forest">{item.name}</p>
                  {item.date && (
                    <p className="text-xs text-ink/50">
                      {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(item.date))}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
