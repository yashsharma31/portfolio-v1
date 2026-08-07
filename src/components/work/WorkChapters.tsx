"use client";

import { useRef, useEffect, type ComponentType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PROJECTS, type Project } from "@/data/projects";
import { cn } from "@/utils/cn";
import TruWalletVisual from "./visuals/TruWalletVisual";
import TruEnrollVisual from "./visuals/TruEnrollVisual";
import GlueCanvasVisual from "./visuals/GlueCanvasVisual";

gsap.registerPlugin(ScrollTrigger);

const VISUALS: Record<string, ComponentType> = {
  truwallet: TruWalletVisual,
  truenroll: TruEnrollVisual,
  glue: GlueCanvasVisual,
};

/** Per-chapter caption under the device frame. Glue is not auth-walled. */
const CAPTIONS: Record<string, string | null> = {
  truwallet: "Illustrative. Product portals are auth-walled.",
  truenroll: "Illustrative. Product portals are auth-walled.",
  glue: "Illustrative recreation.",
};

/** Shared desktop card box — phone and browser chapters occupy the same space. */
const CARD_BOX =
  "lg:h-[560px] lg:max-h-[calc(100dvh-9rem)]";

/**
 * Selected Work sticky-stack (PRD 5.2/6.3).
 *
 * Stacking is pure CSS sticky (no GSAP pin) so Lenis never fights a
 * pinSpacing:false spacer — that fight was the scroll "jerk". GSAP only
 * scrubs scale/opacity as the next card arrives. All chapters share one
 * fixed card height so the handoff does not change spacing.
 */
export default function WorkChapters() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const cardEls = gsap.utils.toArray<HTMLElement>(
        ref.current!.querySelectorAll(".stack-card")
      );
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;

        // Scale from the top center so width/side gutters do not jump as the
        // previous card dims — keeps the stack aligned under the nav.
        gsap.set(card, { transformOrigin: "50% 0%" });

        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            // Start scaling only once the next card has entered, not the
            // instant the tall min-height wrapper appears at the viewport bottom.
            start: "top 85%",
            end: "top 64px",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        const visual = card.querySelector(".chapter-visual");
        if (visual) {
          gsap.fromTo(
            visual,
            { y: 0 },
            {
              y: -16,
              ease: "none",
              scrollTrigger: {
                trigger: cardEls[i + 1],
                start: "top 85%",
                end: "top 64px",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => mm.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="relative mt-12">
      {PROJECTS.map((project, index) => (
        <div
          key={project.slug}
          className={cn(
            "stack-card",
            !reduce &&
              "lg:sticky lg:top-20 lg:flex lg:min-h-[calc(100dvh-5rem)] lg:items-center lg:py-8",
            "py-6 lg:py-8"
          )}
        >
          <Chapter project={project} index={index} />
        </div>
      ))}
    </div>
  );
}

function Chapter({ project, index }: { project: Project; index: number }) {
  const numeral = String(index + 1).padStart(2, "0");
  const Visual = VISUALS[project.slug];
  const caption = CAPTIONS[project.slug];

  return (
    <article
      className={cn(
        "relative mx-auto flex w-full max-w-[1200px] flex-col justify-center overflow-hidden rounded-2xl border border-line bg-elevated px-6 py-8 md:px-10 md:py-10",
        CARD_BOX
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-4 select-none font-mono text-[clamp(7.5rem,14vw,11rem)] leading-none tracking-tighter md:bottom-3 md:left-6"
        style={{ color: "rgb(255 255 255 / 0.055)" }}
      >
        {numeral}
      </span>

      <div className="relative grid flex-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h3 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
            {project.name}
          </h3>
          <p className="tabular mt-2 font-mono text-sm text-ink-tertiary">
            {project.role} · {project.period}
          </p>
          <p className="mt-5 max-w-[55ch] leading-relaxed text-ink-secondary">
            {project.description}
          </p>

          {project.metrics.length > 0 && (
            <dl className="mt-6 flex gap-10">
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="sr-only">{m.label}</dt>
                  <dd className="tabular font-mono text-2xl font-semibold text-accent-soft">
                    {m.value}
                  </dd>
                  <p className="mt-1 max-w-[18ch] font-mono text-xs leading-snug text-ink-tertiary">
                    {m.label}
                  </p>
                </div>
              ))}
            </dl>
          )}

          <ul className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full bg-subtle px-3 py-1 font-mono text-xs text-ink-secondary"
              >
                {tech}
              </li>
            ))}
          </ul>

          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1 text-sm text-accent-soft transition-colors duration-200 hover:text-accent"
            >
              Visit {project.url.replace("https://", "")}
              <ArrowUpRight size={14} weight="regular" />
            </a>
          )}
        </div>

        <div className="chapter-visual flex h-full min-h-0 flex-col justify-center lg:col-span-7">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            {project.image.frame === "phone" ? (
              <PhoneFrame>{Visual ? <Visual /> : null}</PhoneFrame>
            ) : (
              <BrowserFrame>{Visual ? <Visual /> : null}</BrowserFrame>
            )}
          </div>
          {caption && (
            <p className="mt-3 shrink-0 font-mono text-[11px] leading-snug text-ink-tertiary">
              {caption}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function BrowserFrame({ children }: { children: ReactNode }) {
  return (
    <figure className="w-full overflow-hidden rounded-2xl border border-line bg-subtle">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
      </div>
      <div className="relative aspect-[16/10] w-full">{children}</div>
    </figure>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <figure className="mx-auto w-full max-w-[220px] lg:ml-auto lg:mr-8 lg:max-w-[240px]">
      <div className="overflow-hidden rounded-[28px] border-4 border-subtle bg-subtle shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="relative aspect-[39/80]">{children}</div>
      </div>
    </figure>
  );
}
