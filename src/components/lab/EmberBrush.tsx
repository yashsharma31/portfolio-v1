"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  Application,
  Graphics,
  Particle,
  ParticleContainer,
} from "pixi.js";

/**
 * Lab demo 1 (PRD 5.3): ember brush. Paint strokes emit the same ember
 * particles the hero dissolves into. ParticleContainer + ticker only -
 * zero filters (Pixi v8 BindGroup.setResource crash).
 *
 * Engineering mirrors HeroCanvas: DPR cap 2, ticker paused offscreen and on
 * hidden tab, full destroy on unmount, WebGL failure is a silent card shell.
 */

const TEX_R = 8;
/** Matches --accent / --accent-soft plus warm near-white sparks. */
const EMBER_RAMP = [0xc85f2e, 0xe8763a, 0xf09a6b, 0xffe8d6, 0xffffff] as const;
/** Cumulative pick weights: mostly embers, near-white sparks are rare. */
const EMBER_CDF = [0.25, 0.6, 0.85, 0.95, 1] as const;
const CLEAR_MS = 400;
const LIFE_MIN = 2.5;
const LIFE_MAX = 3.5;
const POOL_FULL = 600;
const SAMPLE_GAP = 5;

type Slot = {
  alive: boolean;
  x: number;
  y: number;
  baseX: number;
  rise: number;
  phase: number;
  age: number;
  life: number;
  size: number;
  baseAlpha: number;
  particle: Particle;
};

type Dot = {
  x: number;
  y: number;
  r: number;
  color: string;
  alpha: number;
  life: number;
  age: number;
};

function poolSize() {
  if (typeof navigator !== "undefined" && navigator.hardwareConcurrency <= 4) {
    return POOL_FULL / 2;
  }
  return POOL_FULL;
}

function pickTint() {
  const r = Math.random();
  for (let i = 0; i < EMBER_CDF.length; i++) {
    if (r < EMBER_CDF[i]) return EMBER_RAMP[i];
  }
  return EMBER_RAMP[0];
}

function prefersReduce() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function tintHex(tint: number) {
  return `#${tint.toString(16).padStart(6, "0")}`;
}

/** Reduced-motion: stamp static ember dots that only fade opacity. */
function ReducedBrush({
  onStroke,
  clearRef,
}: {
  onStroke: () => void;
  clearRef: MutableRefObject<(() => void) | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let alive = true;
    let w = 0;
    let h = 0;
    const dots: Dot[] = [];
    let clearing = false;
    let clearStart = 0;
    const clearAlphas: number[] = [];
    let painting = false;
    let last: { x: number; y: number; t: number } | null = null;
    let stroked = false;
    let raf = 0;
    let carry = 0;

    function resize() {
      const rect = host!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.max(1, Math.floor(w * dpr));
      canvas!.height = Math.max(1, Math.floor(h * dpr));
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function stamp(x: number, y: number, speed: number) {
      const count = 1 + (speed > 300 ? 1 : 0) + (speed > 600 ? 1 : 0);
      for (let i = 0; i < count; i++) {
        dots.push({
          x: x + (Math.random() - 0.5) * 4,
          y: y + (Math.random() - 0.5) * 4,
          r: (1 + Math.random() * 3) * (speed > 400 ? 1.25 : 1),
          color: tintHex(pickTint()),
          alpha: 0.75 + Math.random() * 0.25,
          life: LIFE_MIN + Math.random() * (LIFE_MAX - LIFE_MIN),
          age: 0,
        });
      }
    }

    function local(e: PointerEvent) {
      const r = host!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      painting = true;
      host!.setPointerCapture(e.pointerId);
      const p = local(e);
      last = { ...p, t: performance.now() };
      carry = 0;
      stamp(p.x, p.y, 0);
      if (!stroked) {
        stroked = true;
        onStroke();
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!painting || !last) return;
      const p = local(e);
      const now = performance.now();
      const dt = Math.max((now - last.t) / 1000, 0.001);
      const dx = p.x - last.x;
      const dy = p.y - last.y;
      const dist = Math.hypot(dx, dy);
      const speed = dist / dt;
      carry += dist;
      const rate = SAMPLE_GAP / (1 + Math.min(speed / 350, 2.5));
      while (carry >= rate) {
        carry -= rate;
        const t = 1 - carry / Math.max(dist, 0.001);
        stamp(last.x + dx * t, last.y + dy * t, speed);
      }
      last = { ...p, t: now };
    };

    const onUp = (e: PointerEvent) => {
      painting = false;
      last = null;
      try {
        host!.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    };

    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let prev = performance.now();
    const tick = (now: number) => {
      if (!alive) return;
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      if (clearing) {
        const t = (now - clearStart) / CLEAR_MS;
        const fade = Math.max(0, 1 - t);
        for (let i = 0; i < dots.length; i++) {
          dots[i].alpha = (clearAlphas[i] ?? 0) * fade;
        }
        if (t >= 1) {
          dots.length = 0;
          clearAlphas.length = 0;
          clearing = false;
        }
      } else {
        for (let i = dots.length - 1; i >= 0; i--) {
          dots[i].age += dt;
          if (dots[i].age >= dots[i].life) dots.splice(i, 1);
        }
      }

      ctx!.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const lifeFade = clearing ? 1 : Math.max(0, 1 - d.age / d.life);
        const a = d.alpha * lifeFade;
        if (a <= 0.01) continue;
        ctx!.beginPath();
        ctx!.fillStyle = d.color;
        ctx!.globalAlpha = a;
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    clearRef.current = () => {
      if (dots.length === 0 || clearing) return;
      clearing = true;
      clearStart = performance.now();
      clearAlphas.length = 0;
      for (let i = 0; i < dots.length; i++) {
        clearAlphas.push(dots[i].alpha * Math.max(0, 1 - dots[i].age / dots[i].life));
        dots[i].alpha = clearAlphas[i];
        dots[i].age = 0;
        dots[i].life = 1;
      }
    };

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearRef.current = null;
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
    };
  }, [onStroke, clearRef]);

  return (
    <div ref={hostRef} className="absolute inset-0 touch-none" data-ember-canvas>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

export default function EmberBrush() {
  const hostRef = useRef<HTMLDivElement>(null);
  const clearRef = useRef<(() => void) | null>(null);
  const [hint, setHint] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reduce] = useState(prefersReduce);

  const onStroke = useCallback(() => setHint(false), []);

  useEffect(() => {
    if (reduce) return;
    const host = hostRef.current;
    if (!host) return;

    let app: Application | null = null;
    let destroyed = false;
    let observer: IntersectionObserver | null = null;
    const aborts: Array<() => void> = [];

    async function build() {
      const rect = host!.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const capacity = poolSize();
      const application = new Application();
      try {
        await application.init({
          background: 0x0b0b0d,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
          preference: "webgl",
          width: rect.width,
          height: rect.height,
        });
      } catch {
        if (!destroyed) setFailed(true);
        return;
      }
      if (destroyed) {
        application.destroy(true, { children: true, texture: true });
        return;
      }
      app = application;
      host!.appendChild(application.canvas);
      application.canvas.style.position = "absolute";
      application.canvas.style.inset = "0";
      application.canvas.style.width = "100%";
      application.canvas.style.height = "100%";
      application.canvas.style.touchAction = "none";

      const gfx = new Graphics().circle(0, 0, TEX_R).fill(0xffffff);
      const texture = application.renderer.generateTexture(gfx);
      gfx.destroy();

      const pc = new ParticleContainer({
        dynamicProperties: {
          position: true,
          vertex: true, // scale is baked into the vertex attribute
          color: true,
        },
      });
      application.stage.addChild(pc);

      const slots: Slot[] = [];
      const free: number[] = [];
      for (let i = 0; i < capacity; i++) {
        const particle = new Particle({
          texture,
          x: -100,
          y: -100,
          tint: EMBER_RAMP[0],
          alpha: 0,
          scaleX: 0,
          scaleY: 0,
          anchorX: 0.5,
          anchorY: 0.5,
        });
        pc.addParticle(particle);
        slots.push({
          alive: false,
          x: 0,
          y: 0,
          baseX: 0,
          rise: 0,
          phase: 0,
          age: 0,
          life: 1,
          size: 1,
          baseAlpha: 1,
          particle,
        });
        free.push(i);
      }

      let painting = false;
      let lastX = 0;
      let lastY = 0;
      let lastT = 0;
      let carry = 0;
      let stroked = false;
      let clearing = false;
      let clearElapsed = 0;
      let time = 0;

      function spawn(x: number, y: number, speed: number) {
        if (free.length === 0) return;
        const i = free.pop()!;
        const s = slots[i];
        const size =
          (1 + Math.random() * 3) *
          (speed > 450 ? 1.35 : speed > 200 ? 1.15 : 1);
        s.alive = true;
        s.x = x + (Math.random() - 0.5) * 5;
        s.y = y + (Math.random() - 0.5) * 5;
        s.baseX = s.x;
        s.rise = 20 + Math.random() * 40;
        s.phase = Math.random() * Math.PI * 2;
        s.age = 0;
        s.life = LIFE_MIN + Math.random() * (LIFE_MAX - LIFE_MIN);
        s.size = size;
        s.baseAlpha = 0.7 + Math.random() * 0.3;
        const p = s.particle;
        p.x = s.x;
        p.y = s.y;
        p.tint = pickTint();
        p.alpha = s.baseAlpha;
        p.scaleX = size / TEX_R;
        p.scaleY = size / TEX_R;
      }

      function emitAlong(
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        speed: number
      ) {
        const dx = x1 - x0;
        const dy = y1 - y0;
        const dist = Math.hypot(dx, dy);
        carry += dist;
        const rate = SAMPLE_GAP / (1 + Math.min(speed / 350, 2.5));
        while (carry >= rate) {
          carry -= rate;
          const t = 1 - carry / Math.max(dist, 0.001);
          const n = 1 + (speed > 300 ? 1 : 0) + (speed > 600 ? 1 : 0);
          for (let k = 0; k < n; k++) {
            spawn(x0 + dx * t, y0 + dy * t, speed);
          }
        }
      }

      function local(e: PointerEvent) {
        const r = host!.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      }

      const onDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        painting = true;
        host!.setPointerCapture(e.pointerId);
        const p = local(e);
        lastX = p.x;
        lastY = p.y;
        lastT = performance.now();
        carry = 0;
        spawn(p.x, p.y, 0);
        if (!stroked) {
          stroked = true;
          onStroke();
        }
      };
      const onMove = (e: PointerEvent) => {
        if (!painting) return;
        const p = local(e);
        const now = performance.now();
        const dt = Math.max((now - lastT) / 1000, 0.001);
        const dist = Math.hypot(p.x - lastX, p.y - lastY);
        const speed = dist / dt;
        emitAlong(lastX, lastY, p.x, p.y, speed);
        lastX = p.x;
        lastY = p.y;
        lastT = now;
      };
      const onUp = (e: PointerEvent) => {
        painting = false;
        try {
          host!.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
      };

      host!.addEventListener("pointerdown", onDown);
      host!.addEventListener("pointermove", onMove);
      host!.addEventListener("pointerup", onUp);
      host!.addEventListener("pointercancel", onUp);
      aborts.push(() => {
        host!.removeEventListener("pointerdown", onDown);
        host!.removeEventListener("pointermove", onMove);
        host!.removeEventListener("pointerup", onUp);
        host!.removeEventListener("pointercancel", onUp);
      });

      clearRef.current = () => {
        if (clearing) return;
        let any = false;
        for (let i = 0; i < slots.length; i++) {
          if (slots[i].alive) {
            any = true;
            break;
          }
        }
        if (!any) return;
        clearing = true;
        clearElapsed = 0;
      };

      application.ticker.add((ticker) => {
        const dt = Math.min(ticker.deltaMS, 50) / 1000;
        time += dt;

        if (clearing) {
          clearElapsed += dt * 1000;
          const fade = Math.max(0, 1 - clearElapsed / CLEAR_MS);
          for (let i = 0; i < slots.length; i++) {
            const s = slots[i];
            if (!s.alive) continue;
            s.particle.alpha = s.baseAlpha * (1 - s.age / s.life) * fade;
            if (fade <= 0) {
              s.alive = false;
              s.particle.alpha = 0;
              s.particle.scaleX = 0;
              s.particle.scaleY = 0;
              free.push(i);
            }
          }
          if (fade <= 0) clearing = false;
          pc.update();
          return;
        }

        for (let i = 0; i < slots.length; i++) {
          const s = slots[i];
          if (!s.alive) continue;
          s.age += dt;
          if (s.age >= s.life) {
            s.alive = false;
            s.particle.alpha = 0;
            s.particle.scaleX = 0;
            s.particle.scaleY = 0;
            free.push(i);
            continue;
          }
          const progress = s.age / s.life;
          const wobble = Math.sin(time * 2.2 + s.phase) * 8;
          s.x = s.baseX + wobble;
          s.y -= s.rise * dt;
          s.baseX += Math.sin(time * 0.9 + s.phase) * 2 * dt;
          const p = s.particle;
          p.x = s.x;
          p.y = s.y;
          p.alpha = s.baseAlpha * (1 - progress);
          const sc = (s.size * (1 - progress * 0.85)) / TEX_R;
          p.scaleX = sc;
          p.scaleY = sc;
        }
        pc.update();
      });

      observer = new IntersectionObserver(([entry]) => {
        if (!app) return;
        if (entry.isIntersecting && !document.hidden) app.ticker.start();
        else app.ticker.stop();
      });
      observer.observe(host!);
      const onVis = () => {
        if (!app) return;
        if (document.hidden) app.ticker.stop();
        else app.ticker.start();
      };
      document.addEventListener("visibilitychange", onVis);
      aborts.push(() =>
        document.removeEventListener("visibilitychange", onVis)
      );

      const ro = new ResizeObserver(() => {
        if (!app || destroyed) return;
        const r = host!.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        app.renderer.resize(r.width, r.height);
      });
      ro.observe(host!);
      aborts.push(() => ro.disconnect());
    }

    build().catch(() => {
      if (!destroyed) setFailed(true);
    });

    return () => {
      destroyed = true;
      observer?.disconnect();
      aborts.forEach((fn) => fn());
      clearRef.current = null;
      app?.destroy(true, { children: true, texture: true });
      app = null;
    };
  }, [reduce, onStroke]);

  return (
    <div className="relative flex h-full min-h-[200px] flex-col">
      <div
        ref={hostRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-page touch-none"
        data-ember-brush
      >
        {reduce && !failed && (
          <ReducedBrush onStroke={onStroke} clearRef={clearRef} />
        )}
        {failed && <div className="absolute inset-0 bg-page" aria-hidden />}
        <p
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center font-mono text-xs text-ink-tertiary transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ opacity: hint && !failed ? 1 : 0 }}
        >
          draw here
        </p>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => clearRef.current?.()}
          className="font-mono text-xs text-ink-tertiary transition-[color,transform] duration-[140ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-accent-soft active:scale-[0.97]"
        >
          clear
        </button>
      </div>
    </div>
  );
}
