import Placeholder from "./Placeholder";

/** Experience (PRD 6.5). No eyebrow. */
export default function ExperienceSection() {
  return (
    <section id="experience" aria-label="Work experience" className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
          Where the hours went.
        </h2>
        <div className="mt-12">
          <Placeholder phase={4} note="Timeline rail (Glue Labs roles)" />
        </div>
      </div>
    </section>
  );
}
