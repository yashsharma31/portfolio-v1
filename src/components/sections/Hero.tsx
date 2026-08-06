/**
 * Hero (PRD 6.1). Copy is locked. The Pixi canvas layer lands in Phase 1
 * behind this content at z-canvas.
 */
export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100dvh] items-center">
      <div
        className="mx-auto w-full max-w-[1200px] px-5 md:px-8"
        style={{ zIndex: "var(--z-content)" }}
      >
        <div>
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[0.95] tracking-tighter text-ink">
            I build editors, canvases,
            <br />
            and interfaces that feel fast.
          </h1>
          <p className="mt-6 max-w-[65ch] text-lg leading-relaxed text-ink-secondary md:text-xl">
            Design engineer at Glue Labs. Three years shipping WebGL photo
            tools, video editors, and rich text systems.
          </p>
          <div className="mt-10 flex items-center gap-6">
            <a
              href="#projects"
              className="inline-flex items-center rounded-full bg-accent px-6 py-3 font-medium text-page transition-transform duration-[140ms] ease-[var(--ease-out)] active:scale-[0.97]"
            >
              See the work
            </a>
            <a
              href="#contact"
              className="text-ink-secondary transition-colors duration-200 hover:text-ink"
            >
              Get in touch →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
