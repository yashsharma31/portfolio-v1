/**
 * Ambient ember-field opacity contract.
 * ScrollTriggers write `target`; EmberField's ticker lerps toward it.
 * Never mirrored into React state.
 * Anchored on globalThis so HMR cannot split the singleton.
 */
type FieldControl = { target: number };

const g = globalThis as typeof globalThis & {
  __emberFieldControl?: FieldControl;
};

export const fieldControl: FieldControl =
  g.__emberFieldControl ?? (g.__emberFieldControl = { target: 1 });
