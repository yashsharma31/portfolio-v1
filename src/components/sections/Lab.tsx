import Reveal from "@/components/motion/Reveal";
import LabGrid from "@/components/lab/LabGrid";

/** The Lab (PRD 6.4). Eyebrow 2 of 2 on the page. */
export default function Lab() {
  return (
    <section id="lab" aria-label="Interactive lab" className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-tertiary">
            The lab
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Small things, built to be touched.
          </h2>
          <p className="mt-4 max-w-[65ch] text-ink-secondary">
            Every demo runs live on this page. View the source of each.
          </p>
        </Reveal>
        <LabGrid />
      </div>
    </section>
  );
}
