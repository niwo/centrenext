import { Github, Mail, Phone } from "lucide-react";

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
    <footer className="section-shell bg-forest text-sand">

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-display text-4xl sm:text-[2.6rem]">{practice.name}</h2>
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
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <a
          href="https://github.com/niwo/centrenext"
          target="_blank"
          rel="noreferrer"
          title="GitHub Repo"
          aria-label="GitHub Repo"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sand/80 hover:bg-sand/10 hover:text-sand"
        >
          <Github className="h-4 w-4" />
        </a>
        <ThemeToggle />
      </div>
    </footer>
  );
}