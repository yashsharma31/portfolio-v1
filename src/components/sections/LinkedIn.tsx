import Reveal from "@/components/motion/Reveal";
import LinkedInRows from "@/components/linkedin/LinkedInRows";

/**
 * LinkedIn writing archive. Articles + posts from the official data export
 * (imported via `npm run import:linkedin`). No eyebrow.
 */
export default function LinkedIn() {
  return (
    <section id="linkedin" aria-label="LinkedIn" className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Thinking out loud on LinkedIn.
          </h2>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-4 max-w-xl text-base text-ink-secondary md:text-lg">
            Articles and posts from my LinkedIn archive. Open any row to read
            the original.
          </p>
        </Reveal>
        <LinkedInRows />
      </div>
    </section>
  );
}
