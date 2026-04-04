"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const NEWS_LIMIT = 5;

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
  const hasMore = items.length > NEWS_LIMIT;
  const visibleItems = expanded ? items : items.slice(0, NEWS_LIMIT);

  return (
    <div className="rounded-2xl border border-[rgb(var(--color-mist)/0.5)] bg-[rgb(var(--surface-elevated)/0.85)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">{title}</p>
      <ul className="mt-3 space-y-2">
        {visibleItems.map((item) => (
          <li key={item.slug}>
            <Link href={item.href} className="font-semibold text-forest underline-offset-4 hover:underline">
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
      {hasMore && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-forest transition-colors hover:text-forest/75"
        >
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          {showAllLabel} ({items.length})
        </button>
      ) : null}
    </div>
  );
}
