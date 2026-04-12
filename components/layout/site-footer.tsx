import type { LucideIcon } from "lucide-react";
import { Facebook, Github, Instagram, LayoutDashboard, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";

type SiteFooterProps = {
  footer: {
    contactKicker: string;
    adminLabel: string;
  };
  practice: {
    name: string;
    tagline: string;
    addressLines: string[];
    contact: {
      phone: string;
      email: string;
    };
    socialLinks?: Array<{
      platform: "github" | "instagram" | "facebook" | "linkedin" | "youtube" | "x";
      href: string;
    }>;
  };
};

const socialIconByPlatform: Record<"github" | "instagram" | "facebook" | "linkedin" | "youtube" | "x", LucideIcon> = {
  github: Github,
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  x: Twitter,
};

const socialLabelByPlatform: Record<"github" | "instagram" | "facebook" | "linkedin" | "youtube" | "x", string> = {
  github: "GitHub",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  x: "X",
};

export function SiteFooter({ footer, practice }: SiteFooterProps) {
  const copyright = `© ${new Date().getFullYear()} ${practice.name}`;
  const socialLinks =
    practice.socialLinks && practice.socialLinks.length > 0
      ? practice.socialLinks
      : [{ platform: "github" as const, href: "https://github.com/niwo/centrenext" }];

  return (
    <footer className="section-shell min-h-[8.5rem] !px-6 !py-5 sm:!px-10 sm:!py-7 bg-forest text-sand dark:bg-[rgb(var(--surface-shell)/0.98)] dark:text-ink">

      <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
        <div className="flex flex-col space-y-1.5">
          <h2 className="font-display text-3xl sm:text-4xl">{practice.name}</h2>
          <p className="max-w-xl text-base text-sand/75 dark:text-ink/80">{practice.tagline}</p>
          <p className="pt-1 text-sm text-sand/70 dark:text-ink/70">{copyright}</p>
        </div>

        <div className="flex items-start sm:items-center sm:justify-self-center">
          <div className="flex items-center gap-3">
            <a
              href="/admin/index.html"
              target="_blank"
              rel="noreferrer"
              title={footer.adminLabel}
              aria-label={footer.adminLabel}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sand/75 transition-colors hover:bg-sand/10 hover:text-sand dark:text-ink/75 dark:hover:bg-white/10 dark:hover:text-ink"
            >
              <LayoutDashboard className="h-4 w-4" />
            </a>
            {socialLinks.map((social) => {
              const Icon = socialIconByPlatform[social.platform];
              const label = socialLabelByPlatform[social.platform];

              return (
                <a
                  key={`${social.platform}-${social.href}`}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  title={label}
                  aria-label={label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sand/75 transition-colors hover:bg-sand/10 hover:text-sand dark:text-ink/75 dark:hover:bg-white/10 dark:hover:text-ink"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-left text-sm text-sand/80 dark:text-ink/85 sm:h-full sm:justify-end sm:items-start sm:justify-self-end sm:text-base">
          {practice.addressLines.length > 0 ? (
            <div className="flex items-start gap-2 text-sm text-sand/75 dark:text-ink/80">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                {practice.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          ) : null}
          <a href={`tel:${practice.contact.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 hover:text-sand dark:hover:text-ink">
            <Phone className="h-4 w-4" />
            {practice.contact.phone}
          </a>
          <a href={`mailto:${practice.contact.email}`} className="flex items-center gap-2 hover:text-sand dark:hover:text-ink">
            <Mail className="h-4 w-4" />
            {practice.contact.email}
          </a>
        </div>
      </div>
    </footer>
  );
}