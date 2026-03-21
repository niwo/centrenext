import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ServicesSectionProps = {
  locale: string;
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
    <section id="services" className="section-shell space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="section-kicker">{services.kicker}</p>
          <h2 className="section-title">{services.title}</h2>
        </div>
        <p className="max-w-2xl text-base leading-7 text-ink/75">{services.intro}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {services.items.map((service) => (
          <Link id={service.slug} key={service.slug} href={`/${locale}/services/${service.slug}`}>
            <Card className="flex h-full flex-col gap-3 bg-[rgb(var(--surface-card)/0.88)] p-3 transition hover:bg-[rgb(var(--surface-elevated)/0.85)]">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                <Image src={service.image} alt={service.name} fill className="object-cover" />
              </div>
              <div className="space-y-1.5 px-1 pb-1">
                <h3 className="text-lg text-forest">{service.name}</h3>
                <p className="text-xs leading-5 text-ink/75">{service.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      <Button asChild variant="outline">
        <Link href={`/${locale}/services`}>{services.detailLink}</Link>
      </Button>
    </section>
  );
}