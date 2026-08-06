/**
 * About copy (PRD 6.7). Personal paragraphs are pending owner input.
 * Replace the PENDING-INPUT strings; design does not change.
 */

export const ABOUT = {
  paragraphs: [
    "[PENDING-INPUT] Short personal paragraph one. Possible beats: Bennett University BTech CS 2019-2023, why editors and canvases, what Trential is teaching you about shipping secure product.",
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
