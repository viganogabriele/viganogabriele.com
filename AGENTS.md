# Repository guide

## Overview

`viganogabriele.com` is Gabriele Viganò's personal portfolio. It is a React 19 + TypeScript single-page application built with Vite, styled with Tailwind CSS utilities, and animated with Framer Motion. The CV route renders the real PDF through react-pdf.

The repository is intentionally design- and interaction-heavy. Preserve responsiveness, reduced-motion behavior, accessibility semantics, and the established visual language when changing UI code.

## Commands

- `npm run dev` — start the Vite development server.
- `npm run build` — type-check and produce the production build.
- `npm run lint` — run ESLint.
- `npm run test:e2e` — build, serve, and run Playwright tests in Chromium, Firefox, and WebKit. On Arch Linux, WebKit cannot launch natively (missing/ABI-incompatible system libraries such as ICU and libxml2); use `npm run test:e2e:docker` for WebKit coverage on this machine.
- `npm run test:e2e:docker` — run the full Playwright suite (Chromium, Firefox, WebKit) inside the official `mcr.microsoft.com/playwright` container, matched to the installed `@playwright/test` version. Requires Docker.
- `npm run test:e2e:update` — update Playwright snapshots when intentional visual assertions change.
- `npm run test:e2e:csp` — run only the `csp-headers` project: the built site in Chromium behind the real `vercel.json` headers, checking that nothing is blocked by the production Content-Security-Policy. Included in `npm run test:e2e`.
- `npm run generate:og-card` — regenerate the Open Graph card asset from `scripts/assets/`.

Use npm consistently for routine commands: `package-lock.json` is the only lockfile and the Playwright configuration invokes npm. Node.js 22 or later is required.

## Project map

- `src/main.tsx` — React entry point, global CSS, and motion provider.
- `src/App.tsx` — routes, route transitions, preloader, scroll restoration, and route-level error boundary.
- `src/pages/` — page-level composition (`HomePage`, lazy-loaded note and 404 pages).
- `src/components/layout/` — shell, navigation, footer, preloader, and system-mode overlay.
- `src/components/sections/` — home-page sections.
- `src/components/motion/` — shared visual and interaction primitives.
- `src/components/ui/` — reusable presentation components, including the hero portrait object and the circular carousel.
- `src/data/` — portfolio content, navigation, notes, timeline, and site metadata. Prefer data changes here over hard-coding content in components.
- `src/hooks/` — feature detection, preloader, motion profile, and SYS mode behavior.
- `src/lib/` — small shared utilities for classes, motion, navigation state, and SEO.
- `src/index.css` — global styles, Tailwind theme tokens, and cross-component visual rules.
- `scripts/static-pages.ts` — Vite plugin that emits crawler-safe static HTML, metadata, sitemap, and 404 responses, including each note's prose in its shell for clients that do not run JS. Keep it in sync with route and SEO changes.
- `scripts/verify-csp.mjs` and `scripts/csp-verification.mjs` — check the CSP in `vercel.json` against the inline scripts the build actually emitted. Run inside `npm run build`, which is also the deploy's build command, so a stale hash cannot ship.
- `scripts/serve-dist.mjs` — serves `dist` with `vercel.json`'s headers, redirects and clean URLs. Only used by the `csp-headers` Playwright project; `vite preview` sends none of those headers.
- `public/` — static assets, favicons, the CV PDF, the social image, and robots directives.
- `tests/portfolio.spec.ts` — end-to-end coverage for responsive layout, navigation, accessibility, metadata, static SEO output, and SYS mode.
- `tests/csp-headers.spec.ts` — the built site under the production security headers. Runs in its own project against `scripts/serve-dist.mjs` and is excluded from the three browser projects.

## Change guidelines

- Keep `prefers-reduced-motion` paths functional. Motion is centrally informed by `useMotionProfile`.
- Preserve keyboard support, ARIA labels, focus behavior, and the skip link when changing interactive UI.
- Treat the `SYS` mode and browser-specific safe rendering paths as tested behavior; adjust the corresponding Playwright tests with intentional changes.
- When routes, note slugs, titles, canonical URLs, or Open Graph metadata change, update both the React-side SEO behavior and `scripts/static-pages.ts`.
- Do not hand-edit generated model or OG-card outputs when their source-generation script is the appropriate change point.
- Avoid broad formatting-only edits: much of the UI uses compact JSX deliberately.

## Verification

For most source changes, run `npm run lint` and `npm run build` (which type-checks `src`, `scripts`, and `tests`, then verifies the CSP against the emitted build). Run `npm run test:e2e` for changes affecting layout, navigation, interaction, SEO/static output, or browser compatibility. The e2e suite launches a local production preview automatically. When WebKit coverage matters (e.g. Safari-specific rendering paths) and you are on a machine where WebKit can't launch natively, use `npm run test:e2e:docker` instead.
