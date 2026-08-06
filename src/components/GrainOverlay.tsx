/**
 * Fixed full-viewport noise at ~3% opacity (PRD 3.1). Pointer-events none,
 * never attached to scrolling containers (GPU repaint cost).
 */
export default function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none opacity-[0.03]"
      style={{
        zIndex: "var(--z-grain)",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "160px 160px",
      }}
    />
  );
}
