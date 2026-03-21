import Image from "next/image";
import Link from "next/link";
import { Briefcase } from "lucide-react";

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
      price: string;
      image: string;
    }>;
  };
};

export function ServicesSection({ services, locale }: ServicesSectionProps) {
  return (
    <section id="services" className="section-shell flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="section-kicker">{services.kicker}</p>
          <h2 className="section-title">{services.title}</h2>
        </div>
        <p className="max-w-2xl text-base leading-7 text-ink/75">{services.intro}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {services.items.map((service) => (
          <Link id={service.slug} key={service.slug} href={getItemHref(locale, "services", service.slug)}>
            <Card className="flex h-full flex-col gap-3 bg-[rgb(var(--surface-card)/0.88)] p-3 transition hover:bg-[rgb(var(--surface-elevated)/0.85)]">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                <Image src={service.image} alt={service.name} fill className="object-cover" />
              </div>
              <div className="space-y-2 px-1 pb-1 flex-grow flex flex-col">
                <h3 className="text-2xl font-semibold text-forest">{service.name}</h3>
                <p className="text-base leading-6 text-ink/75 flex-grow">{service.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      <Button asChild variant="outline" className="mt-auto self-start">
        <Link href={getSectionHref(locale, "services")} className="inline-flex items-center gap-2">
          <Briefcase className="h-4 w-4" aria-hidden />
          {services.detailLink}
        </Link>
      </Button>
    </section>
  );
}