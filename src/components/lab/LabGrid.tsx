"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

/**
 * Lab bento (PRD 5.3 final): ember brush spans 2 columns; spring playground
 * and scramble clock stack in the third. Every demo is an isolated client
 * leaf, lazy-mounted when the grid scrolls near the viewport.
 */

const EmberBrush = dynamic(() => import("./EmberBrush"), { ssr: false });
const SpringPlayground = dynamic(() => import("./SpringPlayground"), {
  ssr: false,
});
const ScrambleClock = dynamic(() => import("./ScrambleClock"), { ssr: false });

const REPO_BLOB =
  "https://github.com/yashsharma31/portfolio-v1/blob/main/src/components/lab";

function useNearViewport<T extends HTMLElement>(margin = "400px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!ref.current || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [near, margin]);
  return { ref, near };
}

function Cell({
  title,
  caption,
  file,
  children,
  className,
}: {
  title: string;
  caption: string;
  file: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border border-line bg-elevated p-5 ${className ?? ""}`}
    >
      <div className="min-h-0 flex-1">{children}</div>
      <div className="mt-4 flex items-end justify-between gap-4 border-t border-line pt-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          <p className="mt-0.5 text-xs leading-snug text-ink-tertiary">
            {caption}
          </p>
        </div>
        <a
          href={`${REPO_BLOB}/${file}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex shrink-0 items-center gap-1 font-mono text-xs text-ink-tertiary transition-colors duration-200 hover:text-accent-soft"
        >
          source
          <ArrowUpRight
            size={12}
            className="hover-arrow transition-transform duration-200 ease-[var(--ease-out)]"
            aria-hidden
          />
        </a>
      </div>
    </div>
  );
}

export default function LabGrid() {
  const { ref, near } = useNearViewport<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-lab-grid
      className="mt-12 grid gap-4 lg:grid-cols-3 lg:grid-rows-[minmax(200px,1fr)_minmax(200px,1fr)]"
    >
      <Cell
        title="Ember brush"
        caption="Paint with the same particles the hero dissolves into."
        file="EmberBrush.tsx"
        className="min-h-[420px] lg:col-span-2 lg:row-span-2"
      >
        {near && <EmberBrush />}
      </Cell>
      <Cell
        title="Spring playground"
        caption="Drag the ball. The curve is the exact spring you configured."
        file="SpringPlayground.tsx"
        className="min-h-[200px]"
      >
        {near && <SpringPlayground />}
      </Cell>
      <Cell
        title="Scramble clock"
        caption="IST, live. Digits scramble-settle on the minute."
        file="ScrambleClock.tsx"
        className="min-h-[200px]"
      >
        {near && <ScrambleClock />}
      </Cell>
    </div>
  );
}
