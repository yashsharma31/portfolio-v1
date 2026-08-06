"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth scroll (PRD 3.6). Disabled under prefers-reduced-motion;
 * native scrolling and CSS smooth anchors take over in that case.
 * GSAP ScrollTrigger sync is added in Phase 2 where pinning is introduced.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
