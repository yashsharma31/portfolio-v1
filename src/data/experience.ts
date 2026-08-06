/**
 * Canonical experience timeline (PRD 6.5).
 * Source of record: LinkedIn profile PDF + monthly reports, Aug 2026.
 * Every fact here is verified; do not add or embellish.
 */

export type ExperienceEntry = {
  company: string;
  role: string;
  period: string; // display string, mono
  location?: string;
  bullets: [string, string, string];
  stack: string[];
};

export const EXPERIENCE: ExperienceEntry[] = [
  {
    company: "Trential",
    role: "Software Development Engineer II",
    period: "03/2026 - Present",
    location: "Gurugram",
    bullets: [
      "Led TruWallet development in React Native: NFC passport scanning, FaceID and TouchID with liveness checks, and secure QR credential sharing.",
      "Spearheaded frontend performance across the Evaluation and Verity Ops portals: code splitting, list virtualization, and Core Web Vitals work.",
      "Architected telemetry across all portals with Mixpanel, Clarity, LogRocket, and Sentry, routed through a secure proxy layer.",
    ],
    stack: ["React Native", "React", "TypeScript", "Mixpanel", "Sentry"],
  },
  {
    company: "Trential",
    role: "Software Development Engineer",
    period: "03/2025 - 02/2026",
    location: "Gurugram",
    bullets: [
      "Engineered the Domestic Transfer and Grading Scale modules for the evaluation platform: multi-step forms, real-time GPA calculators, and Redux state systems.",
      "Built accessible, responsive components on Radix, Tailwind, and shadcn, with feature-flagged product tours for onboarding.",
      "Integrated Stripe payments and identity verification into the Indisi Web Wallet, handling polling, cancellation, and complex async states.",
    ],
    stack: ["React", "TypeScript", "Redux", "Radix", "Stripe"],
  },
  {
    company: "Glue Labs",
    role: "Software Development Engineer",
    period: "06/2023 - 03/2025",
    location: "Chandigarh",
    bullets: [
      "Led development of a WebGL video editor on React and Pixi.js, a 30% efficiency improvement.",
      "Shipped the xG campaign tooling, cutting campaign setup time by 50%.",
      "Built a customizable email editor and responsive templates: 40% better editing experience, 10% lift in marketing CTR.",
    ],
    stack: ["Pixi.js", "React", "Next.js", "TypeScript", "React Email"],
  },
  {
    company: "Glue Labs",
    role: "Software Development Engineer Intern",
    period: "03/2022 - 05/2023",
    bullets: [
      "Enhanced the Slate.js rich text editor, boosting editing efficiency by 15%.",
      "Improved code testing protocols, cutting post-deployment bugs by 15%.",
      "Shipped core product features alongside senior developers on React and Next.js.",
    ],
    stack: ["React", "Slate.js", "Next.js", "JavaScript"],
  },
];

/** For the proof bar and any "years shipping" copy. */
export const SHIPPING_SINCE = new Date("2022-03-01");
