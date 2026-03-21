import Link from "next/link";
import { MapPinned, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type LocationSectionProps = {
  locale: string;
  location: {
    title: string;
    intro: string;
    kicker: string;
    detailLink: string;
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
    <section id="location" className="section-shell space-y-6">
      <div className="space-y-2">
        <p className="section-kicker">{location.kicker}</p>
        <h2 className="section-title">{location.title}</h2>
        <p className="max-w-xl text-base leading-7 text-ink/75">{location.intro}</p>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-[rgb(var(--border-soft)/0.6)] bg-[rgb(var(--surface-card)/0.9)] shadow-soft">
        <div className="border-b border-stone-200 px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-clay">
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

      <Card className="space-y-5 bg-[rgb(var(--surface-elevated)/0.74)]">
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

        <div className="flex items-center gap-2 text-sm text-ink/75">
          <Phone className="h-4 w-4 text-clay" />
          {practice.contact.phone}
        </div>
      </Card>

      <Button asChild variant="outline">
        <Link href={`/${locale}/location`}>{location.detailLink}</Link>
      </Button>
    </section>
  );
}