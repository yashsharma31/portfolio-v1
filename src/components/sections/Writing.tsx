import Reveal from "@/components/motion/Reveal";
import WritingRows from "@/components/writing/WritingRows";

/** Writing (PRD 6.6). No eyebrow. */
export default function Writing() {
  return (
    <section id="blog" aria-label="Writing" className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Notes on building things.
          </h2>
        </Reveal>
        <WritingRows />
      </div>
    </section>
  );
}
