import Image from "next/image";

import { Card } from "@/components/ui/card";
import type { TestimonialItem } from "@/lib/content";

type TestimonialsSectionProps = {
  locale: string;
  testimonials: {
    title: string;
    intro: string;
    kicker: string;
    items: TestimonialItem[];
  };
};

export function TestimonialsSection({ testimonials, locale }: TestimonialsSectionProps) {
  return (
    <section id="testimonials" className="section-shell space-y-6">
      <div className="space-y-2">
        <p className="section-kicker">{testimonials.kicker}</p>
        <h2 className="section-title">{testimonials.title}</h2>
        <p className="max-w-2xl text-base leading-7 text-ink/75">{testimonials.intro}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {testimonials.items.map((item) => (
          <Card
            key={item.slug}
            className="flex flex-col gap-5 bg-[rgb(var(--surface-elevated)/0.72)] p-6"
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
                    width={48}
                    height={48}
                    className="h-12 w-12 object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest/10 text-sm font-semibold text-forest">
                  {item.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-forest">{item.name}</p>
                {item.date && (
                  <p className="text-sm text-ink/50">
                    {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(item.date))}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
