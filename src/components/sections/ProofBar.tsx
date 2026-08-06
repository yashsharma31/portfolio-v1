/**
 * Proof bar (PRD 6.2). Phase 4 replaces the static fallback with the live
 * GitHub contribution ribbon and count-up stats.
 */
export default function ProofBar() {
  return (
    <section aria-label="GitHub activity" className="border-t border-line">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-6 md:px-8">
        <p className="font-mono text-xs text-ink-tertiary">
          [Phase 4: live contribution ribbon]
        </p>
        <p className="tabular font-mono text-xs text-ink-tertiary">
          shipping since 2022
        </p>
      </div>
    </section>
  );
}
