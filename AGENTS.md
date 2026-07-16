# Repository guide

## Overview

`viganogabriele.com` is Gabriele Viganò's personal portfolio. It is a React 19 + TypeScript single-page application built with Vite, styled with Tailwind CSS utilities, and animated with Framer Motion. It also uses Three.js for the adaptive hero object and Matter.js for interactive elements.

The repository is intentionally design- and interaction-heavy. Preserve responsiveness, reduced-motion behavior, accessibility semantics, and the established visual language when changing UI code.

## Commands

- `npm run dev` — start the Vite development server.
- `npm run build` — type-check and produce the production build.
- `npm run lint` — run ESLint.
- `npm run test:e2e` — build, serve, and run Playwright tests in Chromium, Firefox, and WebKit.
- `npm run test:e2e:update` — update Playwright snapshots when intentional visual assertions change.
- `npm run generate:face-model` — regenerate `public/models/gabriele-head.v2.glb`.
- `npm run generate:og-card` — regenerate the Open Graph card asset.

Use npm consistently for routine commands: `package-lock.json` is present and the Playwright configuration invokes npm. Node.js 22 or later is required.

## Project map

- `src/main.tsx` — React entry point, global CSS, and motion provider.
- `src/App.tsx` — routes, route transitions, preloader, scroll restoration, and route-level error boundary.
- `src/pages/` — page-level composition (`HomePage`, lazy-loaded note and 404 pages).
- `src/components/layout/` — shell, navigation, footer, preloader, and system-mode overlay.
- `src/components/sections/` — home-page sections.
- `src/components/motion/` — shared visual and interaction primitives.
- `src/components/ui/` — reusable presentation components, including the adaptive Three.js hero object.
- `src/data/` — portfolio content, navigation, notes, timeline, and site metadata. Prefer data changes here over hard-coding content in components.
- `src/hooks/` — feature detection, preloader, motion profile, and SYS mode behavior.
- `src/lib/` — small shared utilities for classes, motion, navigation state, and SEO.
- `src/index.css` — global styles, Tailwind theme tokens, and cross-component visual rules.
- `scripts/static-pages.ts` — Vite plugin that emits crawler-safe static HTML, metadata, sitemap, and 404 responses. Keep it in sync with route and SEO changes.
- `public/` — static assets, favicons, models, social images, and robots directives.
- `tests/portfolio.spec.ts` — end-to-end coverage for responsive layout, navigation, accessibility, metadata, static SEO output, and SYS mode.

## Change guidelines

- Keep `prefers-reduced-motion` paths functional. Motion is centrally informed by `useMotionProfile`.
- Preserve keyboard support, ARIA labels, focus behavior, and the skip link when changing interactive UI.
- Treat the `SYS` mode and browser-specific safe rendering paths as tested behavior; adjust the corresponding Playwright tests with intentional changes.
- When routes, note slugs, titles, canonical URLs, or Open Graph metadata change, update both the React-side SEO behavior and `scripts/static-pages.ts`.
- Do not hand-edit generated model or OG-card outputs when their source-generation script is the appropriate change point.
- Avoid broad formatting-only edits: much of the UI uses compact JSX deliberately.

## Verification

For most source changes, run `npm run lint` and `npm run build`. Run `npm run test:e2e` for changes affecting layout, navigation, interaction, SEO/static output, or browser compatibility. The e2e suite launches a local production preview automatically.
