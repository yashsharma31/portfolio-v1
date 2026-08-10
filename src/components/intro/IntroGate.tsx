"use client";

import { useEffect, useRef, useState } from "react";
import IntroCover from "./IntroCover";
import {
  hasIntroTestBypass,
  introControl,
  isDeepLinkHash,
  pauseLenis,
  prefersReducedMotion,
  resumeLenis,
  setIntroAttr,
} from "./introControl";
import { INTRO, INTRO_CRAFT_MS } from "./introTiming";

const MIN_SHOW_MS = INTRO_CRAFT_MS;
const HARD_TIMEOUT_MS = INTRO.hardTimeout;
const EXIT_MS = INTRO.exit;

function heroArtReady(): Promise<void> {
  const img = document.querySelector<HTMLImageElement>("img[data-hero-art]");
  if (!img) return Promise.resolve();
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

function fontsReady(): Promise<void> {
  if (!document.fonts?.ready) return Promise.resolve();
  return document.fonts.ready.then(() => undefined).catch(() => undefined);
}

function shouldSkipIntro(): boolean {
  if (hasIntroTestBypass()) return true;
  if (prefersReducedMotion()) return true;
  if (isDeepLinkHash(window.location.hash)) return true;
  return false;
}

function finishGone(focus = true): void {
  introControl.phase = "gone";
  setIntroAttr("done");
  document.documentElement.style.overflow = "";
  resumeLenis();
  if (focus) {
    document.getElementById("top")?.focus({ preventScroll: true });
  }
}

/**
 * Intro gate (PRD-loading-screen L1/L2): every-reload Ember Birth / C3 wipe.
 * Cluster craft is self-contained (canvas 2d) so it reads before Pixi warms.
 */
export default function IntroGate() {
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const exitStarted = useRef(false);
  const beginExitRef = useRef<() => void>(() => {});
  const runId = useRef(0);

  useEffect(() => {
    if (shouldSkipIntro()) {
      introControl.phase = "skipped";
      setIntroAttr("done");
      return;
    }

    const id = ++runId.current;
    exitStarted.current = false;
    introControl.phase = "assembling";
    introControl.assemble = 0;
    setIntroAttr("pending");
    setExiting(false);
    setMounted(true);
    document.documentElement.style.overflow = "hidden";
    pauseLenis();

    const ac = new AbortController();
    const startedAt = performance.now();
    const timers: number[] = [];

    const alive = () => runId.current === id && !ac.signal.aborted;

    const beginExit = () => {
      if (!alive() || exitStarted.current) return;
      exitStarted.current = true;
      introControl.phase = "exiting";
      // Crossfade: hero CSS + main opacity start under the still-visible cover.
      setIntroAttr("exiting");
      setExiting(true);

      timers.push(
        window.setTimeout(() => {
          if (runId.current !== id) return;
          setMounted(false);
          introControl.assemble = 1;
          finishGone(true);
        }, EXIT_MS)
      );
    };
    beginExitRef.current = beginExit;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        beginExit();
      }
    };
    window.addEventListener("keydown", onKey);

    timers.push(
      window.setTimeout(() => {
        beginExit();
      }, HARD_TIMEOUT_MS)
    );

    // Soft readiness: fonts + hero art, but never block past min craft window.
    void (async () => {
      await Promise.race([
        Promise.all([fontsReady(), heroArtReady()]),
        new Promise<void>((r) => {
          const t = window.setTimeout(r, MIN_SHOW_MS);
          timers.push(t);
        }),
      ]);
      if (!alive() || exitStarted.current) return;

      const elapsed = performance.now() - startedAt;
      const remain = Math.max(0, MIN_SHOW_MS - elapsed);
      if (remain > 0) {
        await new Promise<void>((r) => {
          const t = window.setTimeout(r, remain);
          timers.push(t);
          ac.signal.addEventListener(
            "abort",
            () => {
              window.clearTimeout(t);
              r();
            },
            { once: true }
          );
        });
      }
      if (!alive() || exitStarted.current) return;
      beginExit();
    })();

    return () => {
      ac.abort();
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("keydown", onKey);
      if (runId.current === id) {
        document.documentElement.style.overflow = "";
        resumeLenis();
      }
    };
  }, []);

  if (!mounted) return null;

  return (
    <IntroCover exiting={exiting} onSkip={() => beginExitRef.current()} />
  );
}
