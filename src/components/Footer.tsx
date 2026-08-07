import { CONTACT_LINKS } from "@/utils/constants";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-2 px-5 py-8 font-mono text-xs text-ink-tertiary sm:flex-row sm:items-center md:px-8">
        <p>© {new Date().getFullYear()} Yash Sharma</p>
        <p>
          Built with Next.js and Pixi.js ·{" "}
          <a
            href={CONTACT_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-ink-secondary"
          >
            Source ↗
          </a>
        </p>
      </div>
    </footer>
  );
}
