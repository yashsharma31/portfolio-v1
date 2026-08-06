/**
 * AI journey stages (PRD-ai-journey.md section 3). Copy locked; zero em-dashes.
 */

export type AiStage = {
  year: string;
  title: string;
  body: string;
};

export const AI_JOURNEY_HEADER = {
  title: "Inside the black box.",
  sub: "Five years of taking AI apart to see how it thinks.",
} as const;

export const AI_JOURNEY_STAGES: readonly AiStage[] = [
  {
    year: "2021",
    title: "Autocomplete",
    body: "Copilot ships, and I am on it the same week. Ghost text finishing my code felt like a trick worth understanding, not just using.",
  },
  {
    year: "2022",
    title: "Fundamentals",
    body: "I took the deep learning coursework seriously at Bennett: neural nets, backprop, then transformers and attention. Once you have traced a forward pass by hand, the black box has edges.",
  },
  {
    year: "2023",
    title: "Small models",
    body: "I trained the classics myself on GPU: linear regression, random forests, the unglamorous machine learning that teaches you what data actually does. Small models, real intuition.",
  },
  {
    year: "2024-25",
    title: "Burning tokens",
    body: "When LLMs took off I used them past any reasonable budget, on purpose. I read the thinking traces, watched agents plan and fail, and learned where the reasoning bends.",
  },
  {
    year: "2026",
    title: "Sharing it",
    body: "Now I write about what I find: articles and posts on LinkedIn about building with AI. The fastest way to test what you know is to explain it.",
  },
] as const;

export const AI_STAGE_COUNT = AI_JOURNEY_STAGES.length;
