/**
 * Contact success burst. ContactForm arms once per session;
 * EmberField ticker reads + advances. Never mirrored into React state.
 * Anchored on globalThis so HMR cannot split the singleton.
 */
type BurstControl = {
  active: boolean;
  t: number;
  fired: boolean;
};

const g = globalThis as typeof globalThis & {
  __emberBurstControl?: BurstControl;
};

export const burstControl: BurstControl =
  g.__emberBurstControl ??
  (g.__emberBurstControl = { active: false, t: 0, fired: false });

/** Arm a one-shot ember burst from the contact CTA. Session-once. */
export function triggerContactBurst() {
  if (burstControl.fired) return;
  burstControl.fired = true;
  burstControl.active = true;
  burstControl.t = 0;
}
