# viganogabriele.com

The personal website of [Gabriele Viganò](https://www.viganogabriele.com): a portfolio about product work, self-hosted infrastructure and the decisions behind both. It is designed as an instrument rather than a static résumé—direct, interactive and deliberately opinionated.

The site pairs a cinematic landing page with selected work, a CV, field notes and a small SYS mode that exposes a different visual layer. Its technical direction is part of the portfolio: motion adapts to the device, touch and in-app browser fallbacks are treated as first-class paths, and the experience remains usable when motion is reduced or unavailable.

## What is in here

- A React 19 and TypeScript portfolio, built with Vite.
- Framer Motion interaction design, a custom cursor and a capability-aware motion profile.
- A responsive hero with portrait and SYS rendering states.
- Projects, experience, notes, timeline and metadata maintained as structured content.
- A browser-rendered CV with the original PDF available to download.
- Static route shells, canonical metadata, sitemap and 404 output for crawlers.
- Playwright coverage for navigation, accessibility, responsive layouts, SEO, scroll restoration and safe browser-rendering paths.

## Technical character

The interface uses Tailwind CSS utilities, React Router and React PDF. It includes Vercel Analytics and Speed Insights, but the important detail is less the stack than the constraints it is built around: no horizontal overflow on compact screens, keyboard support, meaningful focus states, a skip link, reduced-motion behaviour, and defensive rendering for touch/WebKit and embedded browsers.

The codebase is organised around a few clear boundaries:

```text
src/components/  layout, sections, motion primitives and UI
src/data/        portfolio content, navigation, notes, metadata and timeline
src/hooks/       feature detection, motion, route readiness and SYS mode
src/lib/         routing, SEO, scroll restoration and shared utilities
src/pages/       home, CV, note and 404 composition
scripts/         static-page and visual-asset generation
tests/           end-to-end and accessibility coverage
```

## Local verification

Use Node.js 22 or later and install the exact dependency graph from the committed lockfile:

```sh
npm ci
npm run lint
npm run build
npm run test:e2e -- --project=chromium
```

For full Chromium, Firefox and WebKit coverage on hosts where native WebKit is unavailable, run `npm run test:e2e:docker`. The Docker command performs its own clean lockfile install before running Playwright.

## Not open source

This repository is public so the work can be inspected—not so it can be copied.

Do not copy, reuse, republish, modify, redistribute or create derivative work from any part of it, including its code, design, interaction patterns, written content, branding, images and other media. Do not use it as a template, starter project or source of portfolio material.

Any use requires prior written permission from Gabriele Viganò. For licensing or other requests, contact [info@viganogabriele.com](mailto:info@viganogabriele.com). The full legal terms are in [LICENSE](LICENSE).
