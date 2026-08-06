"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reveal from "@/components/motion/Reveal";
import { cn } from "@/utils/cn";
import {
  AI_JOURNEY_HEADER,
  AI_JOURNEY_STAGES,
  AI_STAGE_COUNT,
  type AiStage,
} from "@/data/ai-journey";
import { STAGE_GLYPHS } from "./glyphs";
import { journeyScrub } from "./scrub";

gsap.registerPlugin(ScrollTrigger);

/** Fraction of scrub reserved for the header beat before formations begin. */
const PROLOGUE = 0.12;
/** Header holds solid, then fades across this raw-progress window. */
const HEADER_FADE_START = 0.08;
const HEADER_FADE_END = 0.14;

/**
 * Inside the black box (PRD-ai-journey).
 * A1: stacked editorial timeline (mobile / reduced-motion).
 * A2: lg+ pinned scrollytelling — formations live on the global Ember Organism.
 * No direct motion/react imports in this folder (PRD 3.5 / addendum section 5).
 */

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);
  return matches;
}

function stageFromProgress(progress: number) {
  const t = Math.max(0, Math.min(1, progress)) * AI_STAGE_COUNT;
  return Math.min(AI_STAGE_COUNT - 1, Math.floor(t));
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function StackedTimeline() {
  return (
    <div
      data-ai-fallback
      className="relative mt-12 overflow-x-clip"
      style={
        {
          "--seg-y": "0px",
          "--seg-h": "48px",
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[7px] top-0 w-[2px] bg-line md:left-[11px]"
      />

      <ol className="relative">
        {AI_JOURNEY_STAGES.map((stage, i) => {
          const Glyph = STAGE_GLYPHS[i] as ComponentType<{ className?: string }>;
          return (
            <li
              key={stage.year}
              data-ai-stage={i}
              className="relative scroll-mt-24 pb-14 last:pb-0 md:pb-20"
            >
              <span
                aria-hidden
                className="absolute left-[3px] top-2 z-10 h-2 w-2 rounded-full border border-line bg-subtle md:left-[7px]"
              />

              <span
                aria-hidden
                className="pointer-events-none absolute left-3 top-[-0.2em] z-0 select-none font-mono text-[80px] leading-none tracking-tighter md:left-5 md:text-[140px] lg:text-[160px]"
                style={{ color: "rgb(255 255 255 / 0.055)" }}
              >
                {stage.year.replace(/-.*$/, "")}
              </span>

              <Reveal
                delay={Math.min(i * 0.055, 0.22)}
                className="relative z-[1] pl-5 md:pl-7"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-ink-tertiary">
                      {stage.year}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink md:text-2xl">
                      {stage.title}
                    </h3>
                    <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-ink-secondary md:text-base">
                      {stage.body}
                    </p>
                  </div>
                  <Glyph className="mt-2 h-7 w-[120px] shrink-0 sm:mt-6" />
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function PinStep({
  stage,
  index,
}: {
  stage: AiStage;
  index: number;
}) {
  return (
    <div
      data-ai-step={index}
      className="ai-step absolute inset-x-0 top-1/2 w-full opacity-0"
    >
      <p className="font-mono text-xs text-ink-tertiary">{stage.year}</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        {stage.title}
      </h3>
      <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-ink-secondary md:text-base">
        {stage.body}
      </p>
    </div>
  );
}

function PinnedJourney() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = sectionRef.current;
    const steps = stepsRef.current;
    const header = headerRef.current;
    if (!root || !steps || !header) return;

    const ctx = gsap.context(() => {
      const stepEls = gsap.utils.toArray<HTMLElement>(
        steps.querySelectorAll(".ai-step")
      );

      gsap.set(header, { yPercent: -50, opacity: 1, y: 0 });
      gsap.set(stepEls, { yPercent: -50, opacity: 0, y: 14 });

      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "+=500%",
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const raw = self.progress;
          journeyScrub.progress = clamp01((raw - PROLOGUE) / (1 - PROLOGUE));

          // Header: solid through ~8%, fade out by ~14%, scrub-driven.
          let headerOpacity = 1;
          let headerY = 0;
          if (raw >= HEADER_FADE_END) {
            headerOpacity = 0;
            headerY = -18;
          } else if (raw > HEADER_FADE_START) {
            const t =
              (raw - HEADER_FADE_START) /
              (HEADER_FADE_END - HEADER_FADE_START);
            headerOpacity = 1 - t;
            headerY = -18 * t;
          }
          gsap.set(header, { yPercent: -50, opacity: headerOpacity, y: headerY });

          // Stage crossfades in place — short scrub windows (~12% of a stage).
          const t = journeyScrub.progress * AI_STAGE_COUNT;
          stepEls.forEach((el, i) => {
            const local = t - i;
            let opacity = 0;
            let y = 14;
            if (local >= 0 && local < 1) {
              if (local < 0.12) {
                const u = local / 0.12;
                opacity = u;
                y = 14 * (1 - u);
              } else if (local > 0.88) {
                const u = (1 - local) / 0.12;
                opacity = u;
                y = -14 * (1 - u);
              } else {
                opacity = 1;
                y = 0;
              }
            }
            gsap.set(el, { yPercent: -50, opacity, y });
            el.classList.toggle(
              "is-active",
              journeyScrub.progress > 0 && stageFromProgress(journeyScrub.progress) === i
            );
          });
        },
      });
    }, root);

    return () => {
      ctx.revert();
      journeyScrub.progress = 0;
    };
  }, []);

  return (
    <div ref={sectionRef} data-ai-pinned className="relative min-h-[100dvh]">
      <div className="relative h-[100dvh] w-full overflow-hidden">
        {/* Left scrim for text readability over the organism */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[45%]"
          style={{
            background:
              "linear-gradient(to right, color-mix(in oklab, var(--color-page) 85%, transparent), transparent)",
          }}
        />

        {/* Overlay column: prologue header + stage texts */}
        <div className="relative z-10 h-full w-full max-w-[45%] px-5 md:px-8 lg:pl-[max(2rem,calc((100vw-1200px)/2+2rem))]">
          <div
            ref={headerRef}
            className="pointer-events-none absolute inset-x-5 top-1/2 md:inset-x-8 lg:left-[max(2rem,calc((100vw-1200px)/2+2rem))] lg:right-8"
          >
            <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
              {AI_JOURNEY_HEADER.title}
            </h2>
            <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-ink-secondary md:text-lg">
              {AI_JOURNEY_HEADER.sub}
            </p>
          </div>

          <div
            ref={stepsRef}
            className="absolute inset-y-0 left-5 right-5 md:left-8 md:right-8 lg:left-[max(2rem,calc((100vw-1200px)/2+2rem))] lg:right-8"
          >
            {AI_JOURNEY_STAGES.map((stage, i) => (
              <PinStep key={stage.year} stage={stage} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AiJourney() {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const usePinned = isLg && !reduce;

  return (
    <section
      id="ai"
      aria-label="Inside the black box"
      className={cn(
        "overflow-x-clip",
        usePinned ? "min-h-[100dvh]" : "py-24 md:py-40"
      )}
    >
      {!usePinned ? (
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
              {AI_JOURNEY_HEADER.title}
            </h2>
            <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-ink-secondary md:text-lg">
              {AI_JOURNEY_HEADER.sub}
            </p>
          </Reveal>
          <StackedTimeline />
        </div>
      ) : (
        <PinnedJourney />
      )}
    </section>
  );
}
