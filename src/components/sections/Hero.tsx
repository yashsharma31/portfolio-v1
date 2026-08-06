import HeroVisual from "@/components/hero/HeroVisual";
import Magnetic from "@/components/motion/Magnetic";

/**
 * Hero (PRD 6.1). Copy is locked. Entrance choreography is pure CSS
 * (globals.css .hero-* keyframes) so the text server-renders and animates
 * off the main thread; reduced motion disables it there too.
 */
export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100dvh] items-center overflow-hidden">
      <HeroVisual />
      <div
        className="relative mx-auto w-full max-w-[1200px] px-5 md:px-8"
        style={{ zIndex: "var(--z-content)" }}
      >
        <div>
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[0.95] tracking-tighter text-ink">
            <span className="hero-line">
              <span className="hero-line-inner">I build editors, canvases,</span>
            </span>
            <span className="hero-line">
              <span className="hero-line-inner [animation-delay:80ms]">
                and interfaces that feel fast.
              </span>
            </span>
          </h1>
          <p className="hero-fade mt-6 max-w-[65ch] text-lg leading-relaxed text-ink-secondary md:text-xl">
            SDE-2 at Trential. Four years shipping secure wallets, evaluation
            portals, and WebGL canvas editors.
          </p>
          <div className="hero-fade mt-10 flex items-center gap-6">
            <Magnetic>
              <a
                href="#projects"
                className="inline-flex items-center rounded-full bg-accent px-6 py-3 font-medium text-page transition-transform duration-[140ms] ease-[var(--ease-out)] active:scale-[0.97]"
              >
                See the work
              </a>
            </Magnetic>
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
