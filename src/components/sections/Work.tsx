import Placeholder from "./Placeholder";

/** Selected Work (PRD 6.3). Eyebrow 1 of 2 on the page. */
export default function Work() {
  return (
    <section id="projects" aria-label="Selected work" className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-tertiary">
          Selected work 2022-2026
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-5xl">
          Three products, one canvas obsession.
        </h2>
        <div className="mt-12 space-y-8">
          <Placeholder phase={2} note="Glue chapter (sticky-stack)" />
          <Placeholder phase={2} note="Dashgen chapter" />
          <Placeholder phase={2} note="xG chapter" />
        </div>
      </div>
    </section>
  );
}
