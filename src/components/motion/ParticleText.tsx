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
const GATHER_MS = 1100;
/** Sweep left to right across the wordmark, so the field assembles like a scan
 *  rather than every particle leaving at once on a random delay. */
const WAVE_MS = 620;
const JITTER_MS = 150;
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

export function ParticleText() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    let visible = true;
    let colors = readAccents();

    const pointer = { active: false, x: 0, y: 0, smoothX: 0, smoothY: 0 };

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
      pointer.smoothX += (pointer.x - pointer.smoothX) * 0.18;
      pointer.smoothY += (pointer.y - pointer.smoothY) * 0.18;

      let settled = true;
      for (const particle of particles) {
        let x = particle.toX;
        let y = particle.toY;
        let progress = 1;

        if (gathering) {
          progress = Math.min(Math.max((now - gatherStart - particle.delay) / GATHER_MS, 0), 1);
          const eased = easeOutCubic(progress);
          x = particle.fromX + (particle.toX - particle.fromX) * eased;
          y = particle.fromY + (particle.toY - particle.fromY) * eased;
          if (progress < 1) settled = false;
        } else {
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

        particle.x += (x - particle.x) * 0.22;
        particle.y += (y - particle.y) * 0.22;

        // Colour is precomputed per particle; only the gather fades alpha, and
        // that rides globalAlpha rather than rebuilding a colour string for
        // every particle on every frame. Starting from zero means a particle is
        // still invisible while it is furthest out, which is the other half of
        // keeping the canvas's edge off the screen.
        if (gathering) context.globalAlpha = progress * progress;
        context.fillStyle = particle.color;
        context.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
      }
      context.globalAlpha = 1;

      if (gathering && settled) gathering = false;
      frame = requestAnimationFrame(paint);
    };

    const run = () => {
      if (frame === null && visible && particles.length) frame = requestAnimationFrame(paint);
    };
    const park = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    const sample = async () => {
      const token = ++build;
      const lines = Array.from(host.querySelectorAll<HTMLElement>("[data-particle-line]"));
      if (!lines.length) return;

      await document.fonts.ready;
      if (token !== build) return;

      const hostBox = host.getBoundingClientRect();
      if (hostBox.width <= 0 || hostBox.height <= 0) return;
      width = Math.ceil(hostBox.width) + PAD * 2;
      height = Math.ceil(hostBox.height) + PAD * 2;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

      // Each line is sampled on its own pass so its particles can carry that
      // line's own tint, set from CSS via --particle-tint.
      const collect = (grid: number) => {
        const found: { x: number; y: number; tint: [number, number, number] }[] = [];
        for (const line of lines) {
          const tint = parseColor(getComputedStyle(line).getPropertyValue("--particle-tint"), colors.base);
          stencilContext.clearRect(0, 0, width, height);
          draw(line);
          const pixels = stencilContext.getImageData(0, 0, stencil.width, stencil.height).data;
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
      while (targets.length > MAX_PARTICLES && step <= 24) {
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

      gatherStart = performance.now();
      gathering = true;
      run();
    };

    const queueSample = () => {
      if (resample !== null) cancelAnimationFrame(resample);
      resample = requestAnimationFrame(() => {
        resample = null;
        void sample();
      });
    };

    const move = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      pointer.active = true;
    };
    const leave = () => { pointer.active = false; };

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
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", onVisibility);
    void sample();

    return () => {
      build += 1;
      park();
      if (resample !== null) cancelAnimationFrame(resample);
      observer.disconnect();
      accents.disconnect();
      resize.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute left-0 top-0" />;
}
