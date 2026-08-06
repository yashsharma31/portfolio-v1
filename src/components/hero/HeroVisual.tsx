"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useReducedMotion } from "motion/react";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

/**
 * Hero background visual (PRD 5.1). The static poster is the LCP element and
 * renders immediately; the Pixi canvas lazy-loads behind it and the poster
 * crossfades away once the first frame is up. Under reduced motion (or if
 * WebGL never initializes) the poster simply stays.
 */
export default function HeroVisual() {
  const reduce = useReducedMotion();
  const [canvasReady, setCanvasReady] = useState(false);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-40 md:w-[46%] md:opacity-100"
      style={{ zIndex: "var(--z-canvas)" }}
    >
      {!reduce && (
        <div className="absolute inset-0">
          <HeroCanvas onReady={() => setCanvasReady(true)} />
        </div>
      )}
      <Image
        src="/images/hero-poster.png"
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 100vw, 46vw"
        className={`object-contain object-right-bottom transition-opacity duration-700 ${
          canvasReady ? "opacity-0" : "opacity-100"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      />
    </div>
  );
}
