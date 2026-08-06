import Image from "next/image";

/**
 * Hero visual (PRD 5.1 / organism B2). The artwork <img> is the LCP element
 * and the rest state. Desktop choreography samples it into the global Ember
 * Organism and dissolves on scroll; reduced-motion / mobile keep the image.
 */
export default function HeroVisual() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-30 md:opacity-100 lg:w-[60%]"
      style={{ zIndex: "var(--z-canvas)" }}
    >
      <Image
        src="/images/hero-art.png"
        alt=""
        data-hero-art
        fill
        priority
        quality={90}
        sizes="(max-width: 768px) 100vw, 60vw"
        className="object-contain object-right"
      />
    </div>
  );
}
