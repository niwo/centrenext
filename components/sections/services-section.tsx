"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartPulse, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getItemHref, getSectionHref } from "@/lib/routes";
import type { Locale } from "@/lib/site-config";

type ServicesSectionProps = {
  locale: Locale;
  services: {
    title: string;
    intro: string;
    kicker: string;
    detailLink: string;
    items: Array<{
      slug: string;
      name: string;
      description: string;
      image: string;
    }>;
  };
};

export function ServicesSection({ services, locale }: ServicesSectionProps) {
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  function scrollManually(direction: "left" | "right") {
    const track = scrollTrackRef.current;

    if (!track) {
      return;
    }

    const amount = Math.max(220, track.clientWidth * 0.8);
    track.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <section id="services" className="section-shell flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="section-kicker">{services.kicker}</p>
          <h2 className="section-title">{services.title}</h2>
        </div>
        <p className="max-w-2xl text-base leading-7 text-ink/75">{services.intro}</p>
      </div>

      <div className="testimonials-marquee-shell">
        <div className="testimonials-marquee">
          <div ref={scrollTrackRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {services.items.map((service) => (
              <Link
                id={service.slug}
                key={service.slug}
                href={getItemHref(locale, "services", service.slug)}
                className="min-w-[16rem] snap-start sm:min-w-[18rem] lg:min-w-[calc((100%-2rem)/3)]"
              >
                <Card className="flex h-full flex-col gap-3 border-[rgb(var(--color-clay)/0.26)] bg-[rgb(var(--surface-card)/0.98)] p-3 shadow-[0_8px_24px_rgb(var(--color-forest)/0.08)] transition hover:border-[rgb(var(--color-clay)/0.38)] hover:bg-white dark:border-[rgb(var(--border-soft)/0.85)] dark:bg-[rgb(var(--surface-shell)/0.98)] dark:hover:bg-[rgb(var(--surface-card)/1)]">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                    <Image src={service.image} alt={service.name} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover" />
                  </div>
                  <div className="space-y-2 px-1 pb-1 flex-grow flex flex-col">
                    <h3 className="text-2xl font-semibold text-forest dark:text-ink">{service.name}</h3>
                    <p className="text-base leading-6 text-ink/75 dark:text-ink/88 flex-grow">{service.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="testimonials-nav">
          <Button
            type="button"
            variant="outline"
            aria-label="Scroll services left"
            className="h-10 w-10 p-0"
            onClick={() => scrollManually("left")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label="Scroll services right"
            className="h-10 w-10 p-0"
            onClick={() => scrollManually("right")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <Button asChild variant="outline" className="mt-auto self-start">
        <Link href={getSectionHref(locale, "services")} className="inline-flex items-center gap-2">
          <HeartPulse className="h-4 w-4" aria-hidden />
          {services.detailLink}
        </Link>
      </Button>
    </section>
  );
}