import Image from "next/image";
import {
  GithubLogo,
  LinkedinLogo,
  XLogo,
} from "@phosphor-icons/react/dist/ssr";
import Reveal from "@/components/motion/Reveal";
import { ABOUT } from "@/data/about";
import { CONTACT_LINKS } from "@/utils/constants";

/**
 * About (PRD 6.7). Duotone portrait left, prose + stack + resume + socials right.
 */

const SOCIALS = [
  { href: CONTACT_LINKS.github, label: "GitHub", Icon: GithubLogo },
  { href: CONTACT_LINKS.linkedin, label: "LinkedIn", Icon: LinkedinLogo },
  { href: CONTACT_LINKS.twitter, label: "X", Icon: XLogo },
] as const;

export default function About() {
  return (
    <section id="about" aria-label="About" className="py-24 md:py-40">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
            About
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-subtle lg:col-span-5">
            <Image
              src={ABOUT.portrait.src}
              alt={ABOUT.portrait.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-top"
              data-about-portrait
            />
          </div>

          <div className="flex flex-col justify-center lg:col-span-7">
            <div className="max-w-[58ch] space-y-5 text-base leading-relaxed text-ink-secondary md:text-lg">
              {ABOUT.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={
                    p.startsWith("[PENDING-INPUT]")
                      ? "rounded-lg border border-dashed border-line px-4 py-3 font-mono text-sm text-ink-tertiary"
                      : undefined
                  }
                >
                  {p}
                </p>
              ))}
            </div>

            <p className="mt-8 font-mono text-[11px] leading-relaxed tracking-wide text-ink-tertiary md:text-xs">
              {ABOUT.stack}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <a
                href={ABOUT.resume.href}
                download
                data-resume-link
                className="font-medium text-ink transition-colors duration-200 hover:text-accent-soft"
              >
                {ABOUT.resume.label}
                {ABOUT.resume.pendingUpdate ? (
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-ink-tertiary">
                    update pending
                  </span>
                ) : null}
              </a>

              <div className="flex items-center gap-3">
                {SOCIALS.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-ink-tertiary transition-colors duration-200 hover:text-ink"
                  >
                    <Icon size={22} weight="regular" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
