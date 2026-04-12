"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Newspaper } from "lucide-react";

type ExpandableNewsListProps = {
  title: string;
  showAllLabel: string;
  items: Array<{
    slug: string;
    title: string;
    href: string;
  }>;
};

export function ExpandableNewsList({ title, showAllLabel, items }: ExpandableNewsListProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-label={`${showAllLabel} (${items.length})`}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <p className="min-w-0 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
          {title} <span className="text-forest">({items.length})</span>
        </p>
        <ChevronDown
          className={expanded ? "h-4 w-4 shrink-0 text-forest transition-transform duration-200 rotate-180" : "h-4 w-4 shrink-0 text-forest transition-transform duration-200"}
          aria-hidden
        />
      </button>

      {expanded ? (
        <ul className="mt-4 space-y-2 border-t border-[rgb(var(--color-mist)/0.45)] pt-4">
          {items.map((item) => (
            <li key={item.slug}>
              <Link href={item.href} className="inline-flex items-center gap-2 font-semibold text-forest underline-offset-4 hover:underline">
                <Newspaper className="h-4 w-4" aria-hidden />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
