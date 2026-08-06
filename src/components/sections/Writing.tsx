import Placeholder from "./Placeholder";

/** Writing (PRD 6.6). No eyebrow. Editorial rows land in Phase 5. */
export default function Writing() {
  return (
    <section id="blog" aria-label="Writing" className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
          Notes on building things.
        </h2>
        <div className="mt-12">
          <Placeholder phase={5} note="Medium posts as editorial rows" />
        </div>
      </div>
    </section>
  );
}
