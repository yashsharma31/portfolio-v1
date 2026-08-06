import { EMAIL } from "@/utils/constants";
import Placeholder from "./Placeholder";

/** Contact (PRD 6.8). Copy locked. Inline form lands in Phase 6. */
export default function ContactSection() {
  return (
    <section id="contact" aria-label="Contact" className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[0.95] tracking-tighter text-ink">
          Let&apos;s build
          <br />
          something together.
        </h2>
        <p className="mt-6 max-w-[65ch] text-lg text-ink-secondary">
          I read everything sent here. Expect a reply within two days.
        </p>
        <div className="mt-12 max-w-xl">
          <Placeholder phase={6} note="Inline contact form (EmailJS)" />
        </div>
        <p className="mt-8 text-ink-secondary">
          Or email directly:{" "}
          <a
            href={`mailto:${EMAIL}`}
            className="text-accent-soft transition-colors duration-200 hover:text-accent"
          >
            {EMAIL}
          </a>
        </p>
      </div>
    </section>
  );
}
