"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCanonicalSection, getLocalizedPath } from "@/lib/routes";
import type { Locale } from "@/lib/site-config";

type SiteHeaderProps = {
  locale: Locale;
  practiceName: string;
  navigation: Array<{
    label: string;
    href: string;
  }>;
};

export function SiteHeader({ locale, practiceName, navigation }: SiteHeaderProps) {
  const alternateLocale = locale === "de" ? "fr" : "de";
  const searchLabel = locale === "de" ? "Suche" : "Recherche";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const segments = (pathname ?? `/${locale}`).split("/").filter(Boolean);
  const sectionSegment = segments[0] === locale ? segments[1] : segments[0];
  const currentSection = sectionSegment ? getCanonicalSection(locale, sectionSegment) : null;

  const alternateLocaleHref = (() => {
    return getLocalizedPath(pathname ?? `/${locale}`, alternateLocale as Locale);
  })();

  return (
    <header className="section-shell sticky top-6 z-20 border border-[rgb(var(--color-clay)/0.25)] bg-gradient-to-r from-[rgb(var(--surface-shell)/0.95)] via-[rgb(var(--surface-elevated)/0.96)] to-[rgb(var(--surface-shell)/0.95)] py-4 shadow-[0_16px_40px_rgb(var(--color-forest)/0.12)]">
      <div>
        <div className="float-left flex h-12 items-center gap-3">
          <Link
            href={`/${locale}`}
            aria-label="Startseite"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--color-clay)/0.14)] shadow-sm transition-transform hover:scale-[1.03]"
          >
            <Image src="/img/logo.svg" alt="Centre bien-etre Logo" width={48} height={48} className="logo-pulsate h-10 w-10" priority />
          </Link>
          <div className="flex h-12 items-center">
            <Link href={`/${locale}`} className="block font-display font-black text-2xl leading-none text-clay transition-opacity hover:opacity-75 sm:text-3xl">
              {practiceName}
            </Link>
          </div>
        </div>

        <div className="float-right flex h-12 items-center gap-2.5 lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="default"
            className="h-11 w-11 p-0 lg:hidden"
            aria-expanded={isMobileMenuOpen}
            aria-controls="site-navigation"
            aria-label={isMobileMenuOpen ? "Navigation schliessen" : "Navigation oeffnen"}
            onClick={() => setIsMobileMenuOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex w-5 flex-col items-center gap-1.5" aria-hidden>
              <span className={`h-0.5 w-full rounded-full bg-forest transition-transform ${isMobileMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`h-0.5 w-full rounded-full bg-forest transition-opacity ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`h-0.5 w-full rounded-full bg-forest transition-transform ${isMobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </span>
          </Button>
        </div>
      </div>

      <nav
        id="site-navigation"
        className={`${isMobileMenuOpen ? "mt-5 flex" : "hidden"} clear-both flex-col gap-2 text-ink/75 lg:clear-none lg:float-right lg:mt-0 lg:flex lg:h-12 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-3`}
      >
        {navigation.map((item) => {
          const sectionKey = getCanonicalSection(locale, item.href.replace("/", ""));
          const isActive = currentSection === sectionKey;

          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-5 py-2.5 text-lg font-semibold transition-colors ${isActive ? "bg-forest text-sand" : "hover:bg-forest/5 hover:text-forest"}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href={`/${locale}/search`}
          aria-current={pathname?.startsWith(`/${locale}/search`) ? "page" : undefined}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-lg font-semibold transition-colors hover:bg-forest/5 hover:text-forest"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Search className="h-4 w-4" />
          {searchLabel}
        </Link>
        <div className="mt-2 flex items-center gap-2 lg:mt-0">
          <Link
            href={alternateLocaleHref}
            className="rounded-full border border-forest/15 px-4 py-2 font-semibold text-forest transition-colors hover:bg-forest hover:text-sand"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {alternateLocale.toUpperCase()}
          </Link>
        </div>
      </nav>
    </header>
  );
}