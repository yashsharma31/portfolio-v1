"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { cn } from "@/utils/cn";
import { EASE_OUT, DUR } from "@/utils/motion";

const LINKS = [
  { label: "Work", href: "#projects", id: "projects" },
  { label: "Lab", href: "#lab", id: "lab" },
  { label: "Experience", href: "#experience", id: "experience" },
  { label: "Writing", href: "#blog", id: "blog" },
  { label: "LinkedIn", href: "#linkedin", id: "linkedin" },
  { label: "About", href: "#about", id: "about" },
] as const;

function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = [...LINKS.map((l) => l.id), "contact"];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return active;
}

function CtaButton({ className }: { className?: string }) {
  return (
    <a
      href="#contact"
      className={cn(
        "inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-page",
        "transition-transform duration-[140ms] ease-[var(--ease-out)] active:scale-[0.97]",
        className
      )}
    >
      Get in touch
    </a>
  );
}

export default function Navbar() {
  const active = useActiveSection();
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  // Lock body scroll while the mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className="fixed inset-x-0 top-0 h-16 border-b border-line bg-page/80 backdrop-blur-md"
      style={{ zIndex: "var(--z-nav)" }}
    >
      <nav className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-5 md:px-8">
        <Link
          href="#top"
          aria-label="Back to top"
          className="font-bold text-lg tracking-tight text-ink"
        >
          YS
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={cn(
                "text-sm transition-colors duration-200",
                active === link.id
                  ? "text-accent-soft"
                  : "text-ink-secondary hover:text-ink"
              )}
            >
              {link.label}
            </a>
          ))}
          <CtaButton />
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <CtaButton />
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-transform duration-[140ms] ease-[var(--ease-out)] active:scale-[0.97]"
          >
            {menuOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </nav>

      {/* Scroll progress line */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 bottom-[-2px] h-[2px] origin-left bg-accent"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              aria-label="Close menu"
              className="fixed inset-0 bg-page/60 md:hidden"
              style={{ zIndex: "var(--z-overlay)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.ui }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 rounded-t-2xl border-t border-line bg-elevated p-6 pb-10 md:hidden"
              style={{ zIndex: "var(--z-overlay)" }}
              initial={{ transform: "translateY(100%)" }}
              animate={{ transform: "translateY(0%)" }}
              exit={{ transform: "translateY(100%)" }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
            >
              <div className="flex flex-col gap-1">
                {LINKS.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-lg font-medium transition-colors duration-200",
                      active === link.id
                        ? "text-accent-soft"
                        : "text-ink hover:bg-subtle"
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
