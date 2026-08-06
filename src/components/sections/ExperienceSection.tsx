import Reveal from "@/components/motion/Reveal";
import ExperienceRail from "@/components/experience/ExperienceRail";

/** Experience (PRD 6.5). No eyebrow. Overflow clipped for ghost year numerals. */
export default function ExperienceSection() {
  return (
    <section
      id="experience"
      aria-label="Work experience"
      className="overflow-x-clip py-24 md:py-40"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Where the hours went.
          </h2>
        </Reveal>
        <ExperienceRail />
      </div>
    </section>
  );
}
