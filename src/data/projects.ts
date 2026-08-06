/**
 * Canonical case-study content (PRD 6.3). Locked order: recency and seniority
 * first, canvas-craft anchor last. Facts sourced from the LinkedIn profile PDF
 * and 2026 monthly reports; metrics only from the verified pool (PRD 2.3).
 */

export type ProjectMetric = { value: string; label: string };

export type Project = {
  slug: string;
  name: string;
  role: string;
  period: string;
  description: string; // 2 sentences, plain voice
  metrics: ProjectMetric[]; // 0-2, verified only
  stack: string[]; // max 5
  url?: string; // public URL if one exists
  /**
   * Visual asset path under public/images/work/.
   * PENDING-INPUT: TruWallet/TruEnroll need approved assets (auth-walled
   * products; never real candidate data). glue.is is captured live in Phase 2.
   */
  image: { src: string; alt: string; frame: "phone" | "browser"; pending?: boolean };
};

export const PROJECTS: Project[] = [
  {
    slug: "truwallet",
    name: "TruWallet",
    role: "SDE-2, Trential",
    period: "2025 - Present",
    description:
      "A secure credential wallet spanning React Native and web. NFC passport scanning, FaceID and TouchID with liveness checks, DigiLocker and Stripe integrations, shipped behind feature flags with full telemetry.",
    metrics: [],
    stack: ["React Native", "React", "TypeScript", "Mixpanel", "GrowthBook"],
    image: {
      src: "/images/work/truwallet.png",
      alt: "TruWallet mobile app showing passport verification flow",
      frame: "phone",
      pending: true,
    },
  },
  {
    slug: "truenroll",
    name: "TruEnroll",
    role: "SDE, Trential",
    period: "2025 - Present",
    description:
      "A credential evaluation platform used by universities. Dynamic grading scales, real-time GPA calculators, OCR document review, and a platform-wide accessibility overhaul, instrumented end to end.",
    metrics: [{ value: "100+", label: "ops cases audited for the forensics flow" }],
    stack: ["React", "TypeScript", "Redux", "Radix", "Tailwind"],
    image: {
      src: "/images/work/truenroll.png",
      alt: "TruEnroll evaluation portal grading interface",
      frame: "browser",
      pending: true,
    },
  },
  {
    slug: "glue",
    name: "Glue canvas suite",
    role: "SDE, Glue Labs",
    period: "2022 - 2025",
    description:
      "WebGL photo and video editors built on Pixi.js and React, alongside a Slate.js rich text editor and email campaign tooling. The canvas work this whole site is an echo of.",
    metrics: [
      { value: "30%", label: "rendering efficiency gain" },
      { value: "50%", label: "faster campaign setup" },
    ],
    stack: ["Pixi.js", "React", "Next.js", "Slate.js", "TypeScript"],
    url: "https://glue.is",
    image: {
      src: "/images/work/glue.png",
      alt: "Glue canvas editor interface",
      frame: "browser",
    },
  },
];
