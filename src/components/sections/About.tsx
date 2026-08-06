import Placeholder from "./Placeholder";

/** About (PRD 6.7). No eyebrow; the photo is the design. */
export default function About() {
  return (
    <section id="about" aria-label="About" className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
          About
        </h2>
        <div className="mt-12">
          <Placeholder phase={5} note="Duotone portrait + prose + stack line" />
        </div>
      </div>
    </section>
  );
}
