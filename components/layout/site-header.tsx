"use client";

import { cloneElement, Fragment, isValidElement, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Users, Briefcase, Newspaper, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getCanonicalSection, getLocalizedPath } from "@/lib/routes";
import type { SearchIndexItem } from "@/lib/content";
import type { Locale } from "@/lib/site-config";

type SiteHeaderProps = {
  locale: Locale;
  practiceName: string;
  searchLabel: string;
  navigation: Array<{
    label: string;
    href: string;
  }>;
  searchItems: SearchIndexItem[];
};

function SearchTypeIcon({ type }: { type: SearchIndexItem["type"] }) {
  if (type === "team") return <Users className="h-4 w-4" aria-hidden />;
  if (type === "services") return <Briefcase className="h-4 w-4" aria-hidden />;
  if (type === "about") return <Search className="h-4 w-4" aria-hidden />;
  if (type === "location") return <Search className="h-4 w-4" aria-hidden />;
  return <Newspaper className="h-4 w-4" aria-hidden />;
}

function highlightMatches(text: string, query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return text;
  }

  const normalizedText = text.toLocaleLowerCase();
  const normalizedQuery = trimmedQuery.toLocaleLowerCase();
  const segments: Array<{ value: string; matched: boolean }> = [];

  let cursor = 0;

  while (cursor < text.length) {
    const nextIndex = normalizedText.indexOf(normalizedQuery, cursor);

    if (nextIndex === -1) {
      segments.push({ value: text.slice(cursor), matched: false });
      break;
    }

    if (nextIndex > cursor) {
      segments.push({ value: text.slice(cursor, nextIndex), matched: false });
    }

    segments.push({ value: text.slice(nextIndex, nextIndex + trimmedQuery.length), matched: true });
    cursor = nextIndex + trimmedQuery.length;
  }

  return segments.map((segment, index) =>
    segment.matched ? (
      <mark key={`${segment.value}-${index}`} className="rounded-sm bg-clay/25 px-0.5 text-forest">
        {segment.value}
      </mark>
    ) : (
      <Fragment key={`${segment.value}-${index}`}>{segment.value}</Fragment>
    ),
  );
}

function highlightNodeText(node: ReactNode, query: string): ReactNode {
  if (typeof node === "string") {
    return highlightMatches(node, query);
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => <Fragment key={index}>{highlightNodeText(child, query)}</Fragment>);
  }

  if (isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: ReactNode }>;
    return cloneElement(element, {
      children: highlightNodeText(element.props.children, query),
    });
  }

  return node;
}

export function SiteHeader({ locale, practiceName, searchLabel, navigation, searchItems }: SiteHeaderProps) {
  const alternateLocale = locale === "de" ? "fr" : "de";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const segments = (pathname ?? `/${locale}`).split("/").filter(Boolean);
  const sectionSegment = segments[0] === locale ? segments[1] : segments[0];
  const currentSection = sectionSegment ? getCanonicalSection(locale, sectionSegment) : null;

  const alternateLocaleHref = (() => {
    return getLocalizedPath(pathname ?? `/${locale}`, alternateLocale as Locale);
  })();

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const shouldShowResults = normalizedQuery.length >= 3;
  const filteredSearchItems = shouldShowResults
    ? searchItems.filter((item) => item.haystack.toLocaleLowerCase().includes(normalizedQuery)).slice(0, 12)
    : [];
  const searchIntroText = locale === "de" ? "Mindestens 3 Buchstaben eingeben" : "Saisissez au moins 3 lettres";
  const searchEmptyText = locale === "de" ? "Keine Treffer gefunden." : "Aucun resultat.";
  const searchTypeLabels = {
    team: locale === "de" ? "Team" : "Equipe",
    services: locale === "de" ? "Angebote" : "Prestations",
    news: locale === "de" ? "Artikel" : "Articles",
    about: locale === "de" ? "Praxis" : "Cabinet",
    location: locale === "de" ? "Kontakt" : "Contact",
  };

  return (
    <>
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
          className={`${isMobileMenuOpen ? "mt-5 flex" : "hidden"} clear-both flex-col gap-2 text-ink/85 dark:text-ink lg:clear-none lg:float-right lg:mt-0 lg:flex lg:h-12 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-3`}
        >
          {navigation.map((item) => {
            const sectionKey = getCanonicalSection(locale, item.href.replace("/", ""));
            const isActive = currentSection === sectionKey;

            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-5 py-2.5 text-lg font-semibold transition-colors ${isActive ? "bg-forest text-sand dark:bg-clay dark:text-sand" : "text-ink/85 hover:bg-forest/5 hover:text-forest dark:text-ink dark:hover:bg-white/10 dark:hover:text-ink"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-lg font-semibold text-ink/85 transition-colors hover:bg-forest/5 hover:text-forest dark:text-ink dark:hover:bg-white/10 dark:hover:text-ink"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSearchOpen(true);
            }}
          >
            <Search className="h-4 w-4" />
            {searchLabel}
          </button>
          <div className="mt-2 flex items-center gap-2 lg:mt-0">
            <Link
              href={alternateLocaleHref}
              className="rounded-full border border-forest/15 px-4 py-2 font-semibold text-forest transition-colors hover:bg-forest hover:text-sand dark:border-mist/55 dark:text-ink dark:hover:bg-clay dark:hover:text-sand"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {alternateLocale.toUpperCase()}
            </Link>
            <ThemeToggle onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </nav>
      </header>

      {isSearchOpen ? (
        <div className="fixed inset-0 z-50 bg-ink/35 p-4 backdrop-blur-sm dark:bg-ink/60 sm:p-6" role="dialog" aria-modal="true">
          <div className="mx-auto max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-[rgb(var(--color-mist)/0.45)] bg-[rgb(var(--surface-shell)/0.98)] shadow-[0_18px_50px_rgb(var(--color-forest)/0.2)]">
            <div className="flex items-center gap-3 border-b border-[rgb(var(--border-soft)/0.9)] px-4 py-4 sm:px-6">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45 dark:text-ink/70" />
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={searchLabel}
                  className="h-12 w-full rounded-full border border-[rgb(var(--border-soft)/0.9)] bg-[rgb(var(--surface-card)/0.85)] pl-11 pr-4 text-base text-ink outline-none transition focus:border-forest/45 focus:ring-2 focus:ring-forest/20 dark:border-[rgb(var(--border-soft)/0.95)] dark:bg-[rgb(var(--surface-elevated)/0.98)] dark:text-ink dark:focus:border-mist/70 dark:focus:ring-mist/30"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                className="h-11 w-11 p-0"
                aria-label={locale === "de" ? "Suche schliessen" : "Fermer la recherche"}
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[68vh] overflow-y-auto p-4 sm:p-6">
              {!shouldShowResults ? null : filteredSearchItems.length === 0 ? (
                <p className="rounded-2xl bg-[rgb(var(--surface-card)/0.8)] px-4 py-6 text-center text-ink/75 dark:text-ink/90">{searchEmptyText}</p>
              ) : (
                <ul className="space-y-3">
                  {filteredSearchItems.map((item) => (
                    <li key={`${item.type}-${item.href}`}>
                      <Link
                        href={item.href}
                        className="block rounded-2xl border border-[rgb(var(--color-mist)/0.45)] bg-[rgb(var(--surface-card)/0.82)] p-4 transition hover:border-forest/25 hover:bg-[rgb(var(--surface-elevated)/0.9)] dark:hover:border-mist/70 dark:hover:bg-[rgb(var(--surface-elevated)/1)]"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
                          <SearchTypeIcon type={item.type} />
                          {searchTypeLabels[item.type]}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-forest">{highlightMatches(item.title, searchQuery)}</p>
                        <div className="mt-1 max-h-20 overflow-hidden text-sm text-ink/75">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{highlightNodeText(children, searchQuery)}</p>,
                              strong: ({ children }) => (
                                <strong className="font-semibold text-forest">{highlightNodeText(children, searchQuery)}</strong>
                              ),
                              em: ({ children }) => <em className="italic">{highlightNodeText(children, searchQuery)}</em>,
                              ul: ({ children }) => <ul className="list-disc space-y-1 pl-4">{highlightNodeText(children, searchQuery)}</ul>,
                              li: ({ children }) => <li>{highlightNodeText(children, searchQuery)}</li>,
                            }}
                          >
                            {item.summary}
                          </ReactMarkdown>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {!shouldShowResults ? (
                <p className="rounded-2xl bg-[rgb(var(--surface-card)/0.8)] px-4 py-6 text-center text-ink/75 dark:text-ink/90">{searchIntroText}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}