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

/**
 * Selected Work sticky-stack (PRD 5.2/6.3, taste-skill 5.A canonical
 * skeleton). Desktop only: cards pin at viewport top, the previous card
 * scales to 0.92 / dims to 0.55 as the next arrives. Below lg and under
 * reduced motion the cards are a plain stacked list.
 *
 * Product visuals are code-drawn abstract skeletons (auth-walled products;
 * screenshots may never arrive). Caption discloses they are illustrative.
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
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
        const visual = card.querySelector(".chapter-visual");
        if (visual) {
          gsap.fromTo(
            visual,
            { y: 0 },
            {
              y: -20,
              ease: "none",
              scrollTrigger: {
                trigger: cardEls[i + 1],
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
            }
          );
        }
      });
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
              "lg:sticky lg:top-0 lg:flex lg:min-h-[100dvh] lg:items-center",
            "py-6 lg:py-0"
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
    <article className="relative mx-auto w-full max-w-[1200px] overflow-hidden rounded-2xl border border-line bg-elevated px-6 py-8 md:px-10 md:py-10 lg:my-8">
      {/* Ghost numeral: white ~5.5% over #131316 reads quietly but clearly.
          Bottom-left, under the text column, so it never collides with the visual. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -left-2 select-none font-mono text-[240px] leading-none tracking-tighter md:text-[280px] lg:text-[320px]"
        style={{ color: "rgb(255 255 255 / 0.055)" }}
      >
        {numeral}
      </span>

      <div className="relative grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
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

        <div className="chapter-visual lg:col-span-7">
          {project.image.frame === "phone" ? (
            <PhoneFrame>{Visual ? <Visual /> : null}</PhoneFrame>
          ) : (
            <BrowserFrame>{Visual ? <Visual /> : null}</BrowserFrame>
          )}
          {caption && (
            <p className="mt-3 font-mono text-[11px] leading-snug text-ink-tertiary">
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
    <figure className="overflow-hidden rounded-2xl border border-line bg-subtle">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
      </div>
      <div className="relative aspect-[16/10]">{children}</div>
    </figure>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <figure className="mx-auto w-full max-w-[300px] lg:ml-auto lg:mr-8 lg:max-w-[320px]">
      <div className="overflow-hidden rounded-[32px] border-4 border-subtle bg-subtle shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="relative aspect-[39/80]">{children}</div>
      </div>
    </figure>
  );
}
