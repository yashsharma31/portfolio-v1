"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getMediumPosts, type MediumPost } from "@/utils/medium";
import { MEDIUM_PROFILE } from "@/data/about";

/**
 * Writing rows (PRD 6.6). Editorial hairline rows, max 4 posts.
 * Skeleton while loading; on error/empty → single Medium link.
 */

function readMinutes(html?: string): number {
  const text = (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}

function SkeletonRows() {
  return (
    <ul aria-hidden className="mt-12">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center justify-between gap-6 border-t border-line py-5"
        >
          <div className="h-5 w-2/3 animate-pulse rounded bg-subtle" />
          <div className="h-3 w-28 shrink-0 animate-pulse rounded bg-subtle" />
        </li>
      ))}
    </ul>
  );
}

function MediumArrowLink({
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

export default function WritingRows() {
  const [posts, setPosts] = useState<MediumPost[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await getMediumPosts();
        if (cancelled) return;
        if (!all.length) setFailed(true);
        else setPosts(all.slice(0, 4));
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (posts === null && !failed) return <SkeletonRows />;

  if (failed || !posts?.length) {
    return (
      <p className="mt-12">
        <MediumArrowLink
          href={MEDIUM_PROFILE}
          className="font-mono text-sm text-ink-secondary transition-colors duration-200 hover:text-accent-soft"
          size={14}
        >
          Read on Medium
        </MediumArrowLink>
      </p>
    );
  }

  return (
    <div className="mt-12" data-writing data-writing-rows>
      <ul>
        {posts.map((post) => (
          <li key={post.link} className="border-t border-line">
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
            >
              <h3 className="text-lg font-medium text-ink transition-colors duration-200 group-hover:text-accent-soft md:text-xl">
                {post.title}
              </h3>
              <span className="shrink-0 font-mono text-xs text-ink-tertiary">
                {post.pubDate}
                <span aria-hidden> · </span>
                {readMinutes(post.content)} min
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-8 border-t border-line pt-6">
        <MediumArrowLink
          href={MEDIUM_PROFILE}
          className="font-mono text-xs text-ink-tertiary transition-colors duration-200 hover:text-accent-soft"
          size={12}
        >
          All posts on Medium
        </MediumArrowLink>
      </p>
    </div>
  );
}
