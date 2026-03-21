"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Briefcase, Newspaper, Search, Users } from "lucide-react";

import { Card } from "@/components/ui/card";

type SearchItemType = "team" | "services" | "news";

type SearchItem = {
  type: SearchItemType;
  title: string;
  href: string;
  summary: string;
  haystack: string;
};

type SearchClientProps = {
  locale: "de" | "fr";
  items: SearchItem[];
};

const copy = {
  de: {
    title: "Suche",
    placeholder: "Team, Angebote oder News durchsuchen...",
    empty: "Keine Treffer gefunden.",
    all: "Alle",
    team: "Team",
    services: "Angebote",
    news: "News",
  },
  fr: {
    title: "Recherche",
    placeholder: "Rechercher equipe, prestations ou actualites...",
    empty: "Aucun resultat.",
    all: "Tout",
    team: "Equipe",
    services: "Prestations",
    news: "Actualites",
  },
} as const;

function normalize(value: string) {
  return value.toLocaleLowerCase();
}

function TypeIcon({ type }: { type: SearchItemType }) {
  if (type === "team") return <Users className="h-4 w-4" aria-hidden="true" />;
  if (type === "services") return <Briefcase className="h-4 w-4" aria-hidden="true" />;
  return <Newspaper className="h-4 w-4" aria-hidden="true" />;
}

export function SearchClient({ locale, items }: SearchClientProps) {
  const t = copy[locale];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | SearchItemType>("all");

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalize(query.trim());

    return items.filter((item) => {
      const matchesType = filter === "all" ? true : item.type === filter;
      const matchesQuery = normalizedQuery.length === 0 ? true : normalize(item.haystack).includes(normalizedQuery);
      return matchesType && matchesQuery;
    });
  }, [filter, items, query]);

  return (
    <section className="space-y-6">
      <h1 className="section-title flex items-center gap-3">
        <Search className="h-7 w-7" />
        {t.title}
      </h1>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.placeholder}
            className="h-12 w-full rounded-full border border-[rgb(var(--border-soft)/0.9)] bg-[rgb(var(--surface-card)/0.85)] pl-11 pr-4 text-base text-ink outline-none transition focus:border-forest/45 focus:ring-2 focus:ring-forest/20"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {(["all", "team", "services", "news"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === value ? "bg-forest text-sand" : "bg-[rgb(var(--surface-card)/0.85)] text-forest hover:bg-forest/10"
              }`}
            >
              {t[value]}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="p-8 text-center text-ink/70">{t.empty}</Card>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <Link key={`${item.type}-${item.href}`} href={item.href}>
              <Card className="space-y-2 p-5 transition hover:border-forest/30 hover:bg-[rgb(var(--surface-card)/0.9)]">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
                  <TypeIcon type={item.type} />
                  {t[item.type]}
                </p>
                <h2 className="text-xl font-semibold text-forest">{item.title}</h2>
                <p className="line-clamp-2 text-base text-ink/75">{item.summary}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
