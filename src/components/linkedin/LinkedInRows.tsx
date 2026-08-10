"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import {
  LINKEDIN_ENTRIES,
  LINKEDIN_PROFILE,
  type LinkedInEntry,
} from "@/data/linkedin";
import { cn } from "@/utils/cn";

/**
 * LinkedIn editorial rows. Hairline language matches Writing (PRD 6.6).
 * Filters + progressive reveal for a full articles/posts archive.
 */

const INITIAL_COUNT = 6;
const PAGE_SIZE = 6;

type Filter = "all" | "article" | "post";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "article", label: "Articles" },
  { id: "post", label: "Posts" },
];

function ProfileArrowLink({
  href,
  children,
  className,
  size,
}: {
  href: string;
  children: React.ReactNode;
  className: string;
  size: number;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group/link inline-flex items-center gap-1 ${className}`}
    >
      {children}
      <ArrowUpRight
        size={size}
        className="hover-arrow transition-transform duration-200 ease-[var(--ease-out)]"
        aria-hidden
      />
    </a>
  );
}

function metaLine(entry: LinkedInEntry) {
  const parts = [entry.pubDate];
  if (entry.kind === "article") parts.push(`${entry.readMinutes} min`);
  parts.push(entry.kind);
  return parts;
}

export default function LinkedInRows() {
  const [filter, setFilter] = useState<Filter>("all");
  const [visible, setVisible] = useState(INITIAL_COUNT);

  const counts = useMemo(() => {
    let articles = 0;
    let posts = 0;
    for (const e of LINKEDIN_ENTRIES) {
      if (e.kind === "article") articles++;
      else posts++;
    }
    return { all: LINKEDIN_ENTRIES.length, article: articles, post: posts };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return LINKEDIN_ENTRIES;
    return LINKEDIN_ENTRIES.filter((e) => e.kind === filter);
  }, [filter]);

  const shown = filtered.slice(0, visible);
  const remaining = Math.max(0, filtered.length - shown.length);

  if (!LINKEDIN_ENTRIES.length) {
    return (
      <p className="mt-12">
        <ProfileArrowLink
          href={LINKEDIN_PROFILE}
          className="font-mono text-sm text-ink-secondary transition-colors duration-200 hover:text-accent-soft"
          size={14}
        >
          Read on LinkedIn
        </ProfileArrowLink>
      </p>
    );
  }

  return (
    <div className="mt-12" data-linkedin data-linkedin-rows>
      <div
        className="mb-8 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b border-line pb-4"
        role="tablist"
        aria-label="Filter LinkedIn writing"
      >
        {FILTERS.map((f) => {
          const count = counts[f.id];
          const disabled = count === 0 && f.id !== "all";
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => {
                setFilter(f.id);
                setVisible(INITIAL_COUNT);
              }}
              className={cn(
                "font-mono text-xs transition-colors duration-200",
                disabled && "cursor-not-allowed opacity-40",
                active
                  ? "text-accent-soft"
                  : "text-ink-tertiary hover:text-ink-secondary"
              )}
            >
              {f.label}
              <span className="ml-1 tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="font-mono text-sm text-ink-tertiary">
          No {filter === "post" ? "posts" : "articles"} in the imported archive
          yet. Request a LinkedIn export that includes Posts, then run{" "}
          <span className="text-ink-secondary">npm run import:linkedin</span>.
        </p>
      ) : (
        <ul>
          {shown.map((entry) => (
            <li key={entry.id} className="border-t border-line">
              <a
                href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-10"
              >
                <div className="min-w-0">
                  <h3 className="text-lg font-medium text-ink transition-colors duration-200 group-hover:text-accent-soft md:text-xl">
                    {entry.title}
                  </h3>
                  {entry.excerpt ? (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                      {entry.excerpt}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 font-mono text-xs text-ink-tertiary sm:pt-1.5">
                  {metaLine(entry).map((part, i) => (
                    <span key={`${entry.id}-${part}`}>
                      {i > 0 ? <span aria-hidden> · </span> : null}
                      {part}
                    </span>
                  ))}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 ? (
        <p className="mt-6">
          <button
            type="button"
            onClick={() => setVisible((n) => n + PAGE_SIZE)}
            className="font-mono text-xs text-ink-tertiary transition-colors duration-200 hover:text-accent-soft"
          >
            Show {Math.min(PAGE_SIZE, remaining)} more
            <span aria-hidden> · </span>
            {remaining} left
          </button>
        </p>
      ) : null}

      <p className="mt-8 border-t border-line pt-6">
        <ProfileArrowLink
          href={LINKEDIN_PROFILE}
          className="font-mono text-xs text-ink-tertiary transition-colors duration-200 hover:text-accent-soft"
          size={12}
        >
          All activity on LinkedIn
        </ProfileArrowLink>
      </p>
    </div>
  );
}
