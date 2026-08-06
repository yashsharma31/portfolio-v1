"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT, DUR } from "@/utils/motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger offset in seconds (keep between 0 and 0.3) */
  delay?: number;
};

/**
 * Shared scroll-entrance: fade up 20px, once, ease-out.
 * Under reduced motion it renders static (opacity-only handled by initial={false}).
 */
export default function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: DUR.reveal, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
