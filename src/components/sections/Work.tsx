import WorkChapters from "@/components/work/WorkChapters";

/** Selected Work (PRD 6.3). Eyebrow 1 of 2 on the page. */
export default function Work() {
  return (
    <section id="projects" aria-label="Selected work" className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-tertiary">
          Selected work 2022-2026
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-5xl">
          Three products, shipped and in production.
        </h2>
      </div>
      {/* Chapters escape the container: pinned cards need full-width room */}
      <div className="px-5 md:px-8">
        <WorkChapters />
      </div>
    </section>
  );
}
