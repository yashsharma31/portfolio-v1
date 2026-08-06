/** Motion tokens (PRD 3.5). The only easing/duration values allowed in JS animation code. */

export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];

export const DUR = {
  press: 0.14,
  ui: 0.2,
  reveal: 0.6,
} as const;

export const SPRING = { type: "spring", duration: 0.5, bounce: 0.15 } as const;
