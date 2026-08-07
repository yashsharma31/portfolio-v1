/** Temporary Phase 0 slot. Every placeholder is replaced by its named phase. */
export default function Placeholder({ phase, note }: { phase: number; note: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-line-strong">
      <p className="font-mono text-xs text-ink-tertiary">
        Phase {phase}: {note}
      </p>
    </div>
  );
}
