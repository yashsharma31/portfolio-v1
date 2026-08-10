/**
 * Ambient ember-field opacity + readiness contract.
 * ScrollTriggers write `target`; EmberField's ticker lerps toward it.
 * IntroGate reads `ready` after Pixi pool init (or fail).
 * Never mirrored into React state.
 * Anchored on globalThis so HMR cannot split the singleton.
 */
type FieldControl = {
  target: number;
  /** True after organism init succeeds or WebGL fails closed. */
  ready: boolean;
};

const g = globalThis as typeof globalThis & {
  __emberFieldControl?: FieldControl;
};

export const fieldControl: FieldControl =
  g.__emberFieldControl ??
  (g.__emberFieldControl = { target: 1, ready: false });
