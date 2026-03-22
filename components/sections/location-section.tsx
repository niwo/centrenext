import Link from "next/link";
import { Building2, Mail, MapPin, MapPinned, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSectionHref } from "@/lib/routes";
import type { Locale } from "@/lib/site-config";

type LocationSectionProps = {
  locale: Locale;
  location: {
    title: string;
    intro: string;
    kicker: string;
    detailLink: string;
    practiceDetailLink: string;
    addressLabel: string;
    openingHoursLabel: string;
    mapLabel: string;
  };
  practice: {
    addressLines: string[];
    mapEmbedUrl: string;
    contact: {
      phone: string;
      email: string;
    };
    openingHours: Array<{
      day: string;
      hours: string;
    }>;
  };
};

export function LocationSection({ location, practice, locale }: LocationSectionProps) {
  return (
    <section id="location" className="section-shell flex flex-col gap-6">
      <div className="space-y-2">
        <p className="section-kicker">{location.kicker}</p>
        <h2 className="section-title">{location.title}</h2>
        <p className="max-w-xl text-base leading-7 text-ink/75">{location.intro}</p>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-[rgb(var(--border-soft)/0.6)] bg-[rgb(var(--surface-card)/0.9)] shadow-soft">
        <div className="border-b border-[rgb(var(--border-soft)/0.75)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-clay">
          {location.mapLabel}
        </div>
        <iframe
          title={location.title}
          src={practice.mapEmbedUrl}
          className="h-[420px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <Card className="max-w-xl space-y-5 bg-[rgb(var(--surface-elevated)/0.74)]">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-clay">
            <MapPinned className="h-4 w-4" />
            {location.addressLabel}
          </p>
          <address className="mt-3 not-italic leading-7 text-ink/80">
            {practice.addressLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </address>
        </div>

        <div className="space-y-2 text-sm text-ink/75">
          <a href={`tel:${practice.contact.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 hover:text-forest">
            <Phone className="h-4 w-4 text-clay" />
            {practice.contact.phone}
          </a>
          <a href={`mailto:${practice.contact.email}`} className="flex items-center gap-2 hover:text-forest">
            <Mail className="h-4 w-4 text-clay" />
            {practice.contact.email}
          </a>
        </div>
      </Card>

      <div className="mt-auto flex flex-wrap gap-3">
        <Button asChild variant="outline" className="self-start">
          <Link href={getSectionHref(locale, "location")} className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden />
            {location.detailLink}
          </Link>
        </Button>
        <Button asChild variant="outline" className="self-start">
          <Link href={getSectionHref(locale, "about")} className="inline-flex items-center gap-2">
            <Building2 className="h-4 w-4" aria-hidden />
            {location.practiceDetailLink}
          </Link>
        </Button>
      </div>
    </section>
  );
}