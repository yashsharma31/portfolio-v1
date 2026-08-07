/**
 * About copy (PRD 6.7). Voice: first person, concrete, quietly confident.
 */

export const ABOUT = {
  paragraphs: [
    "I studied Computer Science at Bennett University from 2019 to 2023, then spent three years at Glue Labs inside photo and video editors on React and Pixi.js. That pull toward canvases never left. At Trential I am learning the other half: shipping wallets and evaluation portals where security, biometrics, and telemetry are the product, not a layer you add later.",
    "I have been poking at AI since Copilot shipped in 2021: deep learning coursework at Bennett, small models trained by hand, and far too many tokens burned reading how agents think. I write about it on LinkedIn.",
  ],
  stack:
    "TypeScript · React · React Native · Next.js · Pixi.js · WebGL · Motion · Redux · Tailwind · Python",
  resume: {
    href: "/Yash-Sharma-Resume.pdf",
    label: "Download resume (PDF)",
    /** True until Yash supplies a post-Trential PDF. Link still works for e2e. */
    pendingUpdate: true,
  },
  portrait: {
    src: "/images/about-portrait.jpg",
    alt: "Portrait of Yash Sharma",
  },
} as const;

export const MEDIUM_PROFILE = "https://medium.com/@yash.sh0031";
