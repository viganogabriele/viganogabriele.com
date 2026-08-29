import { useEffect, useRef } from "react";

/**
 * Adapted from ReactBits `ParticleText` (MIT + Commons Clause).
 * https://reactbits.dev/text-animations/particle-text
 *
 * The upstream component owns its own box and centres one line of text inside
 * it, sized from a `fontSize` prop. Here it has to sit exactly on top of the
 * hero wordmark without moving it by a pixel, so it takes its geometry from the
 * DOM instead: it reads every `[data-particle-line]` inside its parent and
 * samples that element's own computed font, at that element's own offset. The
 * real text stays in the document (transparent, still selectable, still the
 * accessible name) so layout, SEO and the reflow test are untouched.
 *
 * Also changed: letter-spacing is applied by advancing glyph-by-glyph rather
 * than through `ctx.letterSpacing`, which Firefox only shipped in 126 — below
 * the browser floor in vite.config.ts — and the render loop parks itself when
 * the wordmark scrolls out of view or the tab is hidden, where the original
 * kept a rAF running for the life of the page.
 */

// The canvas is deliberately larger than the element it sits on. The wordmark
// runs at a leading of 0.8, so its glyphs overflow their own line boxes, and at
// 1024-1280px the hero grid narrows the heading to about 578px while the type
// stays at 112px — bound to the h1's box exactly, the canvas cut the bottom off
// VIGANÒ and clipped the wordmark's sides at those widths.
const PAD = 130;
const DENSITY = 3;
const MAX_PARTICLES = 3200;
// Mobile glyphs render smaller (see the .hero-wordmark clamp()s), but not
// proportionally smaller than this cap implies — a lower ratio than the
// glyph area actually shrinks by read as visibly sparser dots than desktop.
const COMPACT_MAX_PARTICLES = 1800;
const GATHER_MS = 480;
/** Sweep left to right across the wordmark, so the field assembles like a scan
 *  rather than every particle leaving at once on a random delay. */
const WAVE_MS = 230;
const JITTER_MS = 65;
const RELEASE_MS = 280;
// Real text starts fading almost immediately — the CSS transition on
// .hero-wordmark--particles is long enough on its own (see index.css) to
// keep it visible until particles across the whole wave have caught up; this
// only needs to hold it steady for one frame so the canvas has painted
// before anything starts moving.
const TEXT_HIDE_DELAY_MS = 16;
/** How long a mobile tap/press keeps the repel pulse alive before it decays
 *  back to rest — long enough to read as a deliberate poke, short enough it
 *  never reads as a stuck, hover-like state. */
const TOUCH_RIPPLE_MS = 320;
/** Presses held past this read as a deliberate long press rather than a tap,
 *  switching from the fixed pulse to continuous, hover-like finger tracking
 *  for as long as the press lasts. */
const LONG_PRESS_MS = 220;
/** Kept under PAD: a particle that starts outside the canvas is clipped, and
 *  the clip drew the canvas's own rectangle across the hero mid-animation. */
const SCATTER = 78;
const REPEL_RADIUS = 130;
const REPEL_STRENGTH = 34;
const IDLE_DRIFT = 0.8;

type Particle = {
  x: number;
  y: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  size: number;
  seed: number;
  depth: number;
  delay: number;
  tone: number;
  tint: Rgb;
  color: string;
};

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

type Rgb = [number, number, number];

function parseColor(value: string, fallback: Rgb): Rgb {
  const hex = value.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return fallback;
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

function readAccents() {
  const root = getComputedStyle(document.documentElement);
  return {
    base: parseColor(root.getPropertyValue("--accent"), [120, 169, 255]),
    soft: parseColor(root.getPropertyValue("--accent-soft"), [184, 208, 255]),
  };
}

export function ParticleText({ active, compact = false }: { active: boolean; compact?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setActiveRef = useRef<(next: boolean) => void>(() => undefined);
  const initialActive = useRef(active);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !host || !context) return;

    let particles: Particle[] = [];
    let frame: number | null = null;
    let resample: number | null = null;
    let build = 0;
    let width = 0;
    let height = 0;
    let gatherStart = 0;
    let gathering = false;
    let releaseStart = 0;
    let releasing = false;
    let activeNow = initialActive.current;
    let textTimer: number | null = null;
    let visible = true;
    let colors = readAccents();

    const pointer = { active: false, clientX: 0, clientY: 0, x: 0, y: 0, smoothX: 0, smoothY: 0 };

    // Each line's own tint, drifting toward the accent across the width so the
    // field has some internal life instead of reading as flat fill. Recomputed
    // when SYS mode swaps the accent, not per frame.
    const recolor = () => {
      const [ar, ag, ab] = colors.soft;
      for (const particle of particles) {
        const [r, g, b] = particle.tint;
        const t = particle.tone * 0.4;
        particle.color = `rgb(${Math.round(r + (ar - r) * t)}, ${Math.round(g + (ag - g) * t)}, ${Math.round(b + (ab - b) * t)})`;
      }
    };

    const paint = (now: number) => {
      context.clearRect(0, 0, width, height);
      if (pointer.active) {
        const box = canvas.getBoundingClientRect();
        pointer.x = pointer.clientX - box.left;
        pointer.y = pointer.clientY - box.top;
      }
      pointer.smoothX += (pointer.x - pointer.smoothX) * 0.18;
      pointer.smoothY += (pointer.y - pointer.smoothY) * 0.18;

      let settled = true;
      for (const particle of particles) {
        let x = particle.toX;
        let y = particle.toY;
        let progress = 1;
        let alpha = 1;

        if (gathering) {
          progress = Math.min(Math.max((now - gatherStart - particle.delay) / GATHER_MS, 0), 1);
          const eased = easeOutCubic(progress);
          x = particle.fromX + (particle.toX - particle.fromX) * eased;
          y = particle.fromY + (particle.toY - particle.fromY) * eased;
          alpha = progress * progress;
          if (progress < 1) settled = false;
        } else if (releasing) {
          progress = Math.min(Math.max((now - releaseStart) / RELEASE_MS, 0), 1);
          const eased = easeOutCubic(progress) * 0.32;
          x = particle.toX + (particle.fromX - particle.toX) * eased;
          y = particle.toY + (particle.fromY - particle.toY) * eased;
          alpha = (1 - progress) ** 2;
          if (progress < 1) settled = false;
        } else if (activeNow) {
          const clock = now * 0.001;
          x += Math.sin(clock * 0.9 + particle.seed * 10) * IDLE_DRIFT * particle.depth;
          y += Math.cos(clock * 0.75 + particle.depth * 10) * IDLE_DRIFT * particle.depth;
        }

        if (pointer.active) {
          const dx = x - pointer.smoothX;
          const dy = y - pointer.smoothY;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < REPEL_RADIUS) {
            const force = (1 - distance / REPEL_RADIUS) ** 2 * REPEL_STRENGTH;
            x += (dx / distance) * force;
            y += (dy / distance) * force;
          }
        }

        // Transition frames own exact coordinates. A second easing used to
        // leave dots chasing the glyph grid after the timer had completed,
        // creating a visible last-second shuffle on straight letter edges.
        if (gathering || releasing) {
          particle.x = x;
          particle.y = y;
        } else {
          particle.x += (x - particle.x) * 0.22;
          particle.y += (y - particle.y) * 0.22;
        }

        // Colour is precomputed per particle; only the gather fades alpha, and
        // that rides globalAlpha rather than rebuilding a colour string for
        // every particle on every frame. Starting from zero means a particle is
        // still invisible while it is furthest out, which is the other half of
        // keeping the canvas's edge off the screen.
        context.globalAlpha = alpha;
        context.fillStyle = particle.color;
        context.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
      }
      context.globalAlpha = 1;

      if (gathering && settled) {
        gathering = false;
        for (const particle of particles) {
          particle.x = particle.toX;
          particle.y = particle.toY;
        }
      }
      if (releasing && settled) {
        releasing = false;
        context.clearRect(0, 0, width, height);
        frame = null;
        return;
      }
      frame = requestAnimationFrame(paint);
    };

    const run = () => {
      if (frame === null && visible && particles.length && (activeNow || gathering || releasing)) frame = requestAnimationFrame(paint);
    };
    const park = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    const clearTextTimer = () => {
      if (textTimer !== null) window.clearTimeout(textTimer);
      textTimer = null;
    };
    const setActiveState = (next: boolean) => {
      const wasVisible = activeNow || gathering || releasing || host.classList.contains("hero-wordmark--particles");
      activeNow = next;
      clearTextTimer();

      if (!next) {
        host.classList.remove("hero-wordmark--particles");
        pointer.active = false;
        gathering = false;
        if (!wasVisible || particles.length === 0) {
          releasing = false;
          context.clearRect(0, 0, width, height);
          park();
          return;
        }
        releaseStart = performance.now();
        releasing = true;
        run();
        return;
      }

      if (particles.length === 0) return;
      releasing = false;
      gatherStart = performance.now();
      gathering = true;
      for (const particle of particles) {
        particle.x = particle.fromX;
        particle.y = particle.fromY;
      }
      run();
      // Let the first incoming dots overlap the readable wordmark before its
      // colour fades. This prevents a blank phase on both entry and exit.
      textTimer = window.setTimeout(() => {
        textTimer = null;
        if (activeNow) host.classList.add("hero-wordmark--particles");
      }, TEXT_HIDE_DELAY_MS);
    };
    setActiveRef.current = setActiveState;

    const sample = async () => {
      const token = ++build;
      const preserveSettledField = activeNow && !gathering && !releasing && particles.length > 0;
      // Keep the real text painted while an inactive canvas is sampled. During
      // active resizes the existing text/canvas cross-fade state is preserved,
      // avoiding a one-frame flash of solid type.
      if (!activeNow) host.classList.remove("hero-wordmark--particles");
      const lines = Array.from(host.querySelectorAll<HTMLElement>("[data-particle-line]"));
      if (!lines.length) return;

      await document.fonts.ready;
      if (token !== build) return;

      const hostBox = host.getBoundingClientRect();
      if (hostBox.width <= 0 || hostBox.height <= 0) return;
      width = Math.ceil(hostBox.width) + PAD * 2;
      height = Math.ceil(hostBox.height) + PAD * 2;

      const dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.75 : 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      // A canvas is a replaced element: with width:auto it takes its backing
      // store as its intrinsic size and insets alone will not stretch it, so
      // the CSS box has to be stated or the field renders at dpr scale.
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.left = `${-PAD}px`;
      canvas.style.top = `${-PAD}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const stencil = document.createElement("canvas");
      stencil.width = canvas.width;
      stencil.height = canvas.height;
      const stencilContext = stencil.getContext("2d", { willReadFrequently: true });
      if (!stencilContext) return;
      stencilContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      stencilContext.fillStyle = "#fff";
      stencilContext.textBaseline = "alphabetic";

      const draw = (line: HTMLElement) => {
        const text = line.dataset.particleLine || line.textContent || "";
        if (!text) return;
        const style = getComputedStyle(line);
        const size = parseFloat(style.fontSize) || 96;
        // `translate` on the reveal animation does not move layout boxes, so
        // offsetLeft/offsetTop give the resting position even mid-animation.
        let left = line.offsetLeft + PAD;
        let top = line.offsetTop + PAD;
        for (let node = line.offsetParent as HTMLElement | null; node && node !== host; node = node.offsetParent as HTMLElement | null) {
          left += node.offsetLeft;
          top += node.offsetTop;
        }

        stencilContext.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
        // Advancing per glyph rather than setting ctx.letterSpacing, which
        // Firefox only shipped in 126 — under the floor in vite.config.ts.
        const tracking = parseFloat(style.letterSpacing) || 0;
        const capHeight = stencilContext.measureText(text).actualBoundingBoxAscent || size * 0.72;
        // Centre the cap box in the line box: the wordmark runs at a leading of
        // 0.8, so the glyphs deliberately overflow their own line box.
        const baseline = top + (line.offsetHeight + capHeight) / 2;

        let pen = left;
        for (const glyph of Array.from(text)) {
          stencilContext.fillText(glyph, pen, baseline);
          pen += stencilContext.measureText(glyph).width + tracking;
        }
      };

      // Rasterise each line once. Widening the lattice below only changes the
      // coordinates sampled from these cached masks; it never repeats the
      // expensive canvas read for an identical line.
      const masks = lines.map((line) => {
        const tint = parseColor(getComputedStyle(line).getPropertyValue("--particle-tint"), colors.base);
        stencilContext.clearRect(0, 0, width, height);
        draw(line);
        return { tint, pixels: stencilContext.getImageData(0, 0, stencil.width, stencil.height).data };
      });

      const collect = (grid: number) => {
        const found: { x: number; y: number; tint: [number, number, number] }[] = [];
        for (const { tint, pixels } of masks) {
          for (let y = 0; y < stencil.height; y += grid) {
            for (let x = 0; x < stencil.width; x += grid) {
              if (pixels[(y * stencil.width + x) * 4 + 3] > 40) found.push({ x: x / dpr, y: y / dpr, tint });
            }
          }
        }
        return found;
      };

      // Thin by widening the lattice, never by dropping every Nth hit from a
      // row-major list: that shifts the sampling phase from row to row and the
      // glyphs come out looking sketched rather than sampled.
      let step = Math.max(2, Math.round(DENSITY * dpr));
      let targets = collect(step);
      const maxParticles = compact ? COMPACT_MAX_PARTICLES : MAX_PARTICLES;
      while (targets.length > maxParticles && step <= 24) {
        step += 1;
        targets = collect(step);
      }
      if (token !== build) return;

      const dot = Math.max(1.5, (step / dpr) * 0.72);
      particles = targets
        .map((target, index) => {
          const seed = ((index * 9301 + 49297) % 233280) / 233280;
          const depth = 0.45 + (((index * 233 + 97) % 1000) / 1000) * 0.9;
          const angle = seed * Math.PI * 2;
          const distance = SCATTER * (0.35 + depth * 0.75);
          return {
            x: target.x + Math.cos(angle) * distance,
            y: target.y + Math.sin(angle) * distance,
            fromX: target.x + Math.cos(angle) * distance,
            fromY: target.y + Math.sin(angle) * distance + (depth - 0.9) * SCATTER * 0.4,
            toX: target.x,
            toY: target.y,
            size: dot,
            seed,
            depth,
            delay: (target.x / Math.max(1, width)) * WAVE_MS + seed * JITTER_MS,
            tone: Math.min(Math.max(target.x / Math.max(1, width) + (seed - 0.5) * 0.3, 0), 1),
            tint: target.tint,
            color: "",
          };
        });
      recolor();
      if (preserveSettledField) {
        // A geometry change should move an already assembled field to its new
        // targets, not replay the activation scatter. Initial activation and
        // resizes that interrupt an in-flight gather still use the ordinary
        // transition path above.
        gathering = false;
        releasing = false;
        for (const particle of particles) {
          particle.x = particle.toX;
          particle.y = particle.toY;
        }
        host.classList.add("hero-wordmark--particles");
        run();
      } else {
        setActiveState(activeNow);
      }
    };

    const queueSample = () => {
      if (resample !== null) cancelAnimationFrame(resample);
      resample = requestAnimationFrame(() => {
        resample = null;
        void sample();
      });
    };

    const move = (event: PointerEvent) => {
      if (!activeNow) return;
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      pointer.active = true;
    };
    const leave = () => { pointer.active = false; };

    // Mobile has no hover, so a press stands in for it. A quick tap gives the
    // same short pulse as before; holding past LONG_PRESS_MS instead tracks
    // the finger for as long as it stays down, the same way desktop `move`
    // tracks the mouse, and lets go the instant it lifts rather than fading.
    // The decision is made at release, not at press: scheduling the pulse's
    // fade-out up front would end a still-held long press early once
    // TOUCH_RIPPLE_MS elapsed. Tracking listens on `host` (the heading), not
    // `window` — the canvas itself is pointer-events:none, so the heading is
    // what actually receives the touch, and scoping to it means a press
    // elsewhere on the page can't trigger an unrelated repel — but release is
    // still caught on `window`, the same reason CircularCarousel's pointerup
    // listener is global: a finger can drift off the heading before lifting.
    let rippleTimer: number | null = null;
    const clearRipple = () => {
      if (rippleTimer !== null) window.clearTimeout(rippleTimer);
      rippleTimer = null;
    };
    let pressStart = 0;
    let pressedPointerId: number | null = null;
    const trackPress = (event: PointerEvent) => {
      if (event.pointerId !== pressedPointerId) return;
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
    };
    const endPress = (event: PointerEvent) => {
      if (event.pointerId !== pressedPointerId) return;
      pressedPointerId = null;
      host.removeEventListener("pointermove", trackPress);
      window.removeEventListener("pointerup", endPress);
      window.removeEventListener("pointercancel", endPress);
      if (performance.now() - pressStart < LONG_PRESS_MS) {
        rippleTimer = window.setTimeout(() => { pointer.active = false; rippleTimer = null; }, TOUCH_RIPPLE_MS);
      } else {
        pointer.active = false;
      }
    };
    const tap = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || !activeNow) return;
      const box = canvas.getBoundingClientRect();
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      // Seed the smoothed position at the tap point too, otherwise the pulse
      // visibly slides in from wherever the pointer last was (the origin, on
      // a first tap) instead of bursting from where the finger landed.
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      pointer.smoothX = pointer.x;
      pointer.smoothY = pointer.y;
      pointer.active = true;
      run();
      clearRipple();
      pressStart = performance.now();
      pressedPointerId = event.pointerId;
      host.addEventListener("pointermove", trackPress, { passive: true });
      window.addEventListener("pointerup", endPress);
      window.addEventListener("pointercancel", endPress);
    };

    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) run(); else park();
    }, { threshold: 0 });
    observer.observe(host);

    const onVisibility = () => {
      if (document.hidden) park(); else run();
    };
    // SYS mode swaps the accent from blue to violet; follow it without
    // re-sampling, the glyph targets have not moved.
    const accents = new MutationObserver(() => {
      colors = readAccents();
      recolor();
    });
    accents.observe(document.documentElement, { attributes: true, attributeFilter: ["data-system-mode"] });

    const resize = new ResizeObserver(queueSample);
    resize.observe(host);
    if (!compact) {
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerleave", leave);
    } else {
      host.addEventListener("pointerdown", tap, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibility);
    void sample();

    return () => {
      build += 1;
      setActiveRef.current = () => undefined;
      clearTextTimer();
      host.classList.remove("hero-wordmark--particles");
      park();
      if (resample !== null) cancelAnimationFrame(resample);
      observer.disconnect();
      accents.disconnect();
      resize.disconnect();
      if (!compact) {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerleave", leave);
      } else {
        host.removeEventListener("pointerdown", tap);
        host.removeEventListener("pointermove", trackPress);
        window.removeEventListener("pointerup", endPress);
        window.removeEventListener("pointercancel", endPress);
        clearRipple();
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [compact]);

  useEffect(() => {
    setActiveRef.current(active);
  }, [active]);

  return <canvas ref={canvasRef} aria-hidden className="hero-particle-canvas pointer-events-none absolute left-0 top-0" />;
}
