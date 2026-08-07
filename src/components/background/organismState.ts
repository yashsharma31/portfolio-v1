/**
 * Organism state. Scene controller writes; Pixi ticker reads.
 * Never mirrored into React state.
 * Anchored on globalThis so HMR / dual-module graphs cannot split the singleton.
 */
export type OrganismScene =
  | "hero"
  | "disperse"
  | "proof"
  | "lab"
  | "experience"
  | "writing"
  | "about"
  | "contact"
  | "dormant"
  | "ai";

export type OrganismState = {
  mode: "drift" | "choreo";
  scene: OrganismScene;
  /** 0..1 within current scene (enter/hold/exit). Hero: scroll dissolve p. */
  progress: number;
  alpha: number;
};

const g = globalThis as typeof globalThis & {
  __emberOrganismState?: OrganismState;
};

export const organismState: OrganismState =
  g.__emberOrganismState ??
  (g.__emberOrganismState = {
    mode: "drift",
    scene: "disperse",
    progress: 0,
    alpha: 1,
  });
