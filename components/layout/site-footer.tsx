import { Phone, Mail } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";

type SiteFooterProps = {
  footer: {
    contactKicker: string;
  };
  practice: {
    name: string;
    tagline: string;
    contact: {
      phone: string;
      email: string;
    };
  };
};

export function SiteFooter({ footer, practice }: SiteFooterProps) {
  const copyright = `© ${new Date().getFullYear()} ${practice.name}`;

  return (
    <footer className="section-shell relative flex flex-col gap-6 bg-forest text-sand sm:flex-row sm:items-end sm:justify-between">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="space-y-2">
        <p className="section-kicker text-sand/60">{footer.contactKicker}</p>
        <h2 className="font-display text-5xl">{practice.name}</h2>
        <p className="max-w-xl text-lg text-sand/75">{practice.tagline}</p>
      </div>

      <div className="space-y-2 text-base text-sand/80">
        <a href={`tel:${practice.contact.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 hover:text-sand">
          <Phone className="h-4 w-4" />
          {practice.contact.phone}
        </a>
        <a href={`mailto:${practice.contact.email}`} className="flex items-center gap-2 hover:text-sand">
          <Mail className="h-4 w-4" />
          {practice.contact.email}
        </a>
        <p>{copyright}</p>
      </div>
    </footer>
  );
}