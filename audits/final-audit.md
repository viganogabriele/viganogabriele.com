# Consolidated Production-Readiness Audit

**Repository:** `viganogabriele.com`

**Audited commit:** `3f093c4346e4dd811b739081f805aa47930a2f27` (`3f093c4`)

**Consolidation date:** 2026-08-29

This report consolidates and reconciles these four independent audits:

- **Functional/code:** `viganogabriele-com-production-readiness-audit-2026-08-29.md`
- **UI/UX:** `viganogabriele-com-design-ux-audit-2026-08-29.md`
- **Web-quality:** `viganogabriele-web-quality-audit-2026-08-29.md`
- **Security:** `viganogabriele.com_security_best_practices_report.md`

## Executive Summary

The application is suitable for production in its current static-portfolio scope. The audits agree that the build and lint checks pass, the principal navigation and content flows work, responsive layout is strong, crawler output and route metadata are comprehensive, production security headers are broadly sound, dependency audits found no known vulnerabilities, and no secret, authentication, backend, form-submission, or user-content attack surface exists.

There are no substantiated P0 or P1 issues. The most material accepted risks are non-blocking: mobile lab LCP measured 3.0 seconds; two defects affect the decorative SYS-mode experience; a partially readable PDF can bypass the CV page's recovery UI; inline JavaScript remains allowed by CSP; and one Firefox preloader test is not reliable enough to serve as a deterministic release gate. These issues should be addressed, but none breaks the site's core purpose or establishes a current exploitable security vulnerability.

Two prominent claims were not accepted. The reported capability-legend freeze is confounded by the UI audit's known `requestAnimationFrame` stall and is not supported by the proposed source-level failure path. The reported carousel label/name mismatch conflicts with the literal accessible names, the clean serious/critical axe results, and the same Lighthouse run's 100 accessibility score; it needs a direct reproduction before code changes are justified.

The main residual release uncertainty is coverage rather than a known defect: no real WebKit/Safari run, real-device pass, manual assistive-technology pass, or field Core Web Vitals/INP dataset was available.

## P0 — Production Blockers

None. No audit found a substantiated crash, data-loss path, security compromise, broken primary flow, failed build, or deployment failure.

## P1 — High Priority

None. The High-severity source findings were either non-blocking in actual production impact, contradicted and resolved through source evidence, or insufficiently proven.

## P2 — Important

### P2-01 — Mobile LCP and initial main-thread work exceed the desired performance envelope

- **Priority:** P2
- **Original severity:** High (LCP) and Medium (main-thread pressure)
- **Area:** Performance / Core Web Vitals
- **Affected file/component/page:** `/`; `index.html`; `src/App.tsx`; initial home-page and motion composition
- **Evidence:** A Chromium mobile Lighthouse run against a local production preview measured Performance 89, LCP 3.0 s, 1.26 s of LCP element render delay, 4.0 s aggregate main-thread work, and 170 ms TBT. Initial JavaScript was approximately 150 KiB gzip, including approximately 36 KiB gzip of Framer Motion. The LCP element was the hero introduction. CLS was 0.000 and TBT remained below the usual 200 ms “good” boundary.
- **Real-world impact:** Visitors on slower mobile CPUs may wait longer than the 2.5 s “good” target before the main introduction appears. The lab result does not prove poor field p75 LCP, so this is meaningful performance debt rather than a release blocker.
- **Root cause:** Visible content depends on client rendering from an initially empty application root, while a motion-heavy home composition adds early parse, execution, and render work.
- **Recommended fix:** Render a minimal visible hero shell before client startup through SSG/SSR or an equivalent static strategy; defer below-fold motion/effects until idle or intersection; then repeat the same Lighthouse profile and collect field data before making further bundle changes.
- **Source audit(s):** Web-quality

### P2-02 — SYS-mode deactivation bypasses its intended violet hold

- **Priority:** P2
- **Original severity:** High (functional/code); contradicted by a positive UI/UX observation
- **Area:** Functionality / signature interaction
- **Affected file/component/page:** `src/hooks/useSystemMode.ts`; `src/components/layout/SystemModeOverlay.tsx`; global SYS-mode tokens in `src/index.css`
- **Evidence:** On deactivation, `toggle()` sets `domIsVioletRef.current = false` and removes `data-system-mode` synchronously. The subsequent `active=false` effect can therefore never enter its `if (domIsVioletRef.current)` branch that sets `data-system-mode="off"` and holds violet for 460 ms. The `html[data-system-mode="off"]` CSS branch remains unreachable through the normal toggle path. The UI/UX audit only observed that blue was restored after deactivation; that does not establish that violet remained during the intervening wipe.
- **Real-world impact:** On browsers where the exit laser is enabled, the accent can switch to blue while the violet exit sweep is still running. This is visible on every SYS-off interaction but is cosmetic and confined to an optional decorative mode.
- **Root cause:** Synchronous DOM state ownership was added to `toggle()` without reconciling the effect-owned delayed deactivation path.
- **Recommended fix:** Give one path ownership of deactivation. Either have `toggle()` set the `off` state and let the existing timer remove it, or remove the delayed-hold design consistently. Add a timed regression assertion covering the 0–460 ms exit interval.
- **Source audit(s):** Functional/code; UI/UX (contradictory observation reviewed and narrowed)

### P2-03 — Resizing while SYS mode is active replays the particle-wordmark intro

- **Priority:** P2
- **Original severity:** Medium
- **Area:** UI behavior / animation
- **Affected file/component/page:** Home hero; `src/components/motion/ParticleText.tsx`
- **Evidence:** The `ResizeObserver` queues `sample()`. Sampling reconstructs every particle at its scattered coordinates and calls `setActiveState(activeNow)`. When SYS mode is already active, that function resets `gatherStart`, sets `gathering = true`, and moves all particles back to their scatter positions.
- **Real-world impact:** A desktop resize, orientation change, or breakpoint transition can make an already settled wordmark visibly scatter and gather again, creating a jarring replay in a flagship visual feature.
- **Root cause:** Resampling does not distinguish initial activation from geometry changes while already active and settled.
- **Recommended fix:** Preserve whether the particle field was settled before rebuilding. On active resizes, remap or interpolate current particles to new targets without restarting the gather state. Add resize/orientation regression coverage.
- **Source audit(s):** Functional/code

### P2-04 — Partial PDF page-render failures bypass the CV recovery state

- **Priority:** P2
- **Original severity:** Medium
- **Area:** Functionality / error handling
- **Affected file/component/page:** `/cv`; `src/pages/CvPage.tsx`
- **Evidence:** `<Document>` handles `onLoadError`, but `<Page pageNumber={1}>` has no page-level error handler or themed `error` rendering. In addition, the asynchronous `onLoadSuccess` calls `document.getPage(1)` without `try/catch`; a rejection does not set `failed`.
- **Real-world impact:** A corrupt, truncated, or partially deployed PDF may show react-pdf's default error and no recovery link instead of the site's existing browser-viewer fallback. The current reviewed PDF is valid, so this is an edge-case resilience gap.
- **Root cause:** Error handling covers document acquisition but not page acquisition or page rasterization.
- **Recommended fix:** Route both `<Page>` load/render errors and `getPage(1)` failures into the existing `failed` state. Test with a document that loads but cannot supply/render page 1.
- **Source audit(s):** Functional/code

### P2-05 — CSP permits arbitrary inline JavaScript

- **Priority:** P2
- **Original severity:** Medium (web-quality and security); Informational (functional/code)
- **Area:** Security / defense in depth
- **Affected file/component/page:** `vercel.json`; deployed responses for `/`, `/cv`, note routes, and static assets covered by the global header
- **Evidence:** The deployed policy contains `script-src 'self' 'unsafe-inline'`. The security audit found one stable inline application boot script and calculated `sha256-RxjxcgDps8LAVvcXMyz5pGUokmSQbvgSgmaVkIQ06gY=` for the audited build. No HTML/script-injection primitive, untrusted-content pipeline, or dangerous DOM sink was found.
- **Real-world impact:** There is no demonstrated XSS vulnerability today, but a future HTML injection bug would have greater impact because the policy authorizes inline script execution.
- **Root cause:** A small pre-paint inline boot script is allowed through a broad source expression rather than a hash or nonce.
- **Recommended fix:** Replace script `'unsafe-inline'` with the audited script hash or move the boot logic to a same-origin external asset, then verify the deployed policy. Keep the style policy separate: current React/Framer Motion inline styles make `style-src 'unsafe-inline'` load-bearing.
- **Source audit(s):** Security; web-quality; functional/code

### P2-06 — A Firefox preloader test is not a deterministic release signal

- **Priority:** P2
- **Original severity:** Test-suite reliability; source auditor did not assign a conventional severity
- **Area:** Test reliability / release confidence
- **Affected file/component/page:** `tests/portfolio.spec.ts`, test “preloader remains static with reduced motion...”
- **Evidence:** The functional/code auditor saw the test fail on 2 of 3 focused Firefox reruns. Two other initially failing timing tests passed all three reruns. The suspected browser-cache bypass of request interception was not proven. A separate web-quality environment could not launch Playwright because browser binaries were absent, which is an environment limitation rather than application evidence.
- **Real-world impact:** Intermittent failure can either block a healthy release or be normalized and conceal a future real preloader regression. It does not establish a user-facing defect.
- **Root cause:** Unknown. Test isolation, cached image behavior, and timing are plausible but unconfirmed.
- **Recommended fix:** Reproduce with tracing and a fresh Firefox context/cache, replace image-cache-dependent holding with a deterministic readiness gate or unique request, and require multiple clean reruns before treating the test as stable.
- **Source audit(s):** Functional/code; web-quality (environmental context only)

## P3 — Improvements

### P3-01 — Vercel dependency installation does not fail closed on lockfile drift

- **Priority:** P3
- **Original severity:** Low
- **Area:** Security / supply-chain reproducibility
- **Affected file/component/page:** `vercel.json`
- **Evidence:** `installCommand` is `npm install` even though a committed `package-lock.json` exists and is used elsewhere. Both full and production dependency audits reported zero known vulnerabilities.
- **Real-world impact:** A manifest/lock mismatch may be reconciled during deployment instead of failing deterministically. Current dependency state is not known to be compromised.
- **Root cause:** A developer-oriented install command is used in CI/deployment.
- **Recommended fix:** Change the Vercel install command to `npm ci` and retain lockfile validation in CI.
- **Source audit(s):** Security

### P3-02 — Project and note content swaps lack exit-transition orchestration

- **Priority:** P3
- **Original severity:** Medium for each occurrence
- **Area:** UI/UX / motion polish
- **Affected file/component/page:** Project detail in `src/components/sections/Projects.tsx`; note route in `src/pages/NotePage.tsx` and `src/App.tsx`
- **Evidence:** `ProjectDetail` keys a newly entering motion article but has no surrounding `AnimatePresence`, so the previous detail is removed immediately while the next fades in. The full-screen note page and route tree likewise have no enter/exit wrapper despite extensive motion elsewhere.
- **Real-world impact:** Project changes can briefly expose the panel background, and note navigation feels abrupt relative to the rest of the site. Content remains available and navigable.
- **Root cause:** Entrance animation was implemented without coordinating outgoing content at either swap boundary.
- **Recommended fix:** Add short, asymmetric, reduced-motion-aware exit/enter handling at the project-detail and route boundaries. Avoid delaying navigation or focus transfer solely for decoration.
- **Source audit(s):** UI/UX

### P3-03 — Shared carousel motion has inconsistent perceived speed and slow keyboard sequencing

- **Priority:** P3
- **Original severity:** Medium (radius/speed mismatch) and Low (540 ms response and focus-triggered rotations)
- **Area:** UI/UX / keyboard interaction
- **Affected file/component/page:** Projects and Toolkit; `src/components/ui/CircularCarousel.tsx`; `src/components/sections/Projects.tsx`; `src/components/sections/TechStack.tsx`
- **Evidence:** Both instances use a 540 ms selection duration, while Projects uses `radiusScale={0.68}` and Toolkit uses the default `1`. Each focus-visible card calls `select(index)`, so sequential Tab navigation can trigger multiple full-duration rotations.
- **Real-world impact:** The two visually related carousels feel differently paced, and keyboard traversal can feel sluggish. Focus remains visible and the controls remain operable.
- **Root cause:** One fixed angular transition duration is reused across different radii and focus-driven navigation.
- **Recommended fix:** Establish one perceived-speed policy, shorten deliberate selection toward roughly 350–400 ms, and scale or otherwise tune duration for radius. Verify that focus-triggered selection remains fast and reduced-motion behavior stays intact.
- **Source audit(s):** UI/UX

### P3-04 — Certification hover animates layout instead of a compositor-friendly property

- **Priority:** P3
- **Original severity:** Medium
- **Area:** Performance polish / visual consistency
- **Affected file/component/page:** Certifications; `.cert-row` in `src/index.css`
- **Evidence:** Hover/focus transitions `padding-left` over 280 ms, while the analogous Notes treatment uses `transform: translateX(...)`.
- **Real-world impact:** This causes avoidable layout work and makes two adjacent interaction patterns feel slightly inconsistent. No measurable page-level regression was reported.
- **Root cause:** Equivalent visual behavior was implemented with two different CSS mechanisms.
- **Recommended fix:** Replace the padding animation with an equivalent transform while preserving reduced-motion and focus-visible behavior.
- **Source audit(s):** UI/UX

### P3-05 — Clipboard failure feedback is invisible to sighted users

- **Priority:** P3
- **Original severity:** Low
- **Area:** UI feedback / accessibility
- **Affected file/component/page:** Footer copy controls; `src/components/layout/Footer.tsx`
- **Evidence:** On clipboard rejection, `copyMessage` changes only inside an `sr-only` live region. Success changes the visible button; failure produces no visible state.
- **Real-world impact:** In browsers or embedded contexts that deny clipboard access, sighted visitors cannot tell why the action appeared to do nothing. Screen-reader users do receive the message.
- **Root cause:** Failure feedback was implemented only through the accessibility announcement channel.
- **Recommended fix:** Display the same fallback message visibly near or inside the copy control for a short interval while retaining the live-region announcement.
- **Source audit(s):** UI/UX

### P3-06 — Hero `<picture>` elements lack a final raster fallback

- **Priority:** P3
- **Original severity:** Low
- **Area:** Compatibility / resilient media delivery
- **Affected file/component/page:** Hero portrait; `src/components/ui/AdaptiveHeroObject.tsx`
- **Evidence:** Each `<picture>` has AVIF and WebP `<source>` elements, but its `<img>` has no `src` fallback. The omission is partly deliberate so phone-sized layouts do not fetch a hidden portrait.
- **Real-world impact:** A browser that supports neither format, or cannot resolve either source, renders no portrait. Modern codec support makes the practical audience small.
- **Root cause:** The fetch-avoidance strategy gates every candidate and leaves no legacy fallback candidate.
- **Recommended fix:** Add an appropriately media-gated raster fallback without reintroducing the unwanted mobile download; verify network behavior below and above the hero breakpoint.
- **Source audit(s):** Functional/code

### P3-07 — Pointer-effect cleanup does not reset the last visual state

- **Priority:** P3
- **Original severity:** Low
- **Area:** UI state cleanup
- **Affected file/component/page:** `src/hooks/usePointerFrames.ts`; `src/components/motion/BorderGlow.tsx`
- **Evidence:** `pointerleave` calls `handler.current(null)`, but effect cleanup only removes listeners and cancels the pending frame. If pointer capability is revoked mid-hover, the last edge-light value remains.
- **Real-world impact:** On a narrow hybrid-device or media-query transition, a card glow can remain visually stuck until another state change.
- **Root cause:** Cleanup handles resources but not the externally rendered state those resources last produced.
- **Recommended fix:** Emit one final `handler.current(null)` during cleanup and add a capability-change test.
- **Source audit(s):** Functional/code

### P3-08 — The favicon is always revalidated

- **Priority:** P3
- **Original severity:** Low
- **Area:** Caching / repeat-visit performance
- **Affected file/component/page:** `public/favicon.ico`; `vercel.json`
- **Evidence:** Production served the 32 KiB favicon with `Cache-Control: public, max-age=0, must-revalidate`, while hashed assets receive a one-year immutable policy.
- **Real-world impact:** Repeat visits incur a small avoidable conditional request.
- **Root cause:** The stable favicon URL has no versioning or specific long-lived cache rule.
- **Recommended fix:** Version the favicon URL or asset name and serve it with a long immutable lifetime.
- **Source audit(s):** Web-quality

### P3-09 — Visible note dates are not machine-readable

- **Priority:** P3
- **Original severity:** Low
- **Area:** Semantic HTML / accessibility
- **Affected file/component/page:** `/notes/:slug`; `src/pages/NotePage.tsx`
- **Evidence:** Date and reading time are rendered in a plain paragraph. Article JSON-LD carries structured date information separately, but the visible DOM does not use `<time dateTime="...">`.
- **Real-world impact:** Assistive technology and DOM consumers receive an opaque display string. SEO impact is minimal because JSON-LD is already present.
- **Root cause:** Display metadata and structured metadata are generated through separate markup paths.
- **Recommended fix:** Wrap the visible date in `<time>` with an ISO `dateTime` value and retain the current human-readable text.
- **Source audit(s):** UI/UX

### P3-10 — The mobile Capabilities section is difficult to skim

- **Priority:** P3
- **Original severity:** Low
- **Area:** Mobile information density
- **Affected file/component/page:** Home `#expertise`; `src/components/sections/Expertise.tsx`
- **Evidence:** At 390×844, all five capability entries are expanded and the section measures approximately 3,055 px, about 3.6 viewports. The desktop legend/selection UI is hidden on mobile.
- **Real-world impact:** Mobile readers must traverse a long uninterrupted block before reaching Projects. This is a content-density concern, not a navigation or overflow defect.
- **Root cause:** Desktop progressive disclosure is replaced with a fully expanded small-screen layout.
- **Recommended fix:** Consider an accessible tap-to-expand summary pattern on small screens, with content available by default when scripting is unavailable and state/focus behavior tested.
- **Source audit(s):** UI/UX

### P3-11 — One timeline paragraph forms a conspicuous desktop orphan

- **Priority:** P3
- **Original severity:** Low
- **Area:** Typography / visual polish
- **Affected file/component/page:** Home `#journey`, “Private tutoring, Modena”; timeline content/layout
- **Evidence:** At 1440 px the description wrapped to a third line containing only “for years.”, substantially shorter than the other measured final lines.
- **Real-world impact:** The isolated two-word line weakens an otherwise highly controlled composition at one tested width.
- **Root cause:** Copy length and the current text-column constraint combine poorly at that viewport.
- **Recommended fix:** Reword the ending or tune wrapping/column width, then check nearby desktop widths to avoid moving the orphan elsewhere.
- **Source audit(s):** UI/UX

### P3-12 — TypeScript strictness is not enforced despite strict-clean code

- **Priority:** P3
- **Original severity:** Low / improvement
- **Area:** Code quality / type safety
- **Affected file/component/page:** `tsconfig.app.json`; `tsconfig.node.json`
- **Evidence:** Strict mode is disabled. The functional/code auditor built with scratch configurations enabling `strict` and reported zero new errors.
- **Real-world impact:** Future changes can weaken nullability and boundary guarantees without failing CI, even though the current code already meets the stricter standard.
- **Root cause:** Compiler policy lags behind the codebase's actual type discipline.
- **Recommended fix:** Enable `strict` in the committed TypeScript configurations and keep build/typecheck in CI.
- **Source audit(s):** Functional/code

### P3-13 — Manually duplicated content and documentation can drift

- **Priority:** P3
- **Original severity:** Informational (OG-card copy) and Low (stale comment)
- **Area:** Code quality / content maintenance
- **Affected file/component/page:** `scripts/generate-og-card.mjs`; `src/data/site.ts`; comment in `src/data/stackLogos.ts`; `src/data/techStack.ts`
- **Evidence:** The OG-card generator duplicates copy instead of reading canonical site data. Separately, the stack-logo comment says only “Prompt design” lacks a mark while “Linux” also lacks one. Neither mismatch changes current runtime output.
- **Real-world impact:** Future content changes can silently leave generated social copy or maintainer guidance stale.
- **Root cause:** The same content assumptions are maintained manually in more than one location.
- **Recommended fix:** Source generated copy from canonical data where practical and correct or remove comments that enumerate data facts already represented in code.
- **Source audit(s):** Functional/code

## Rejected or Unproven Findings

### Capability legend permanently desynchronizes after rapid clicks

**Disposition:** Unproven; do not implement the proposed fix yet. The UI audit's browser had a documented intermittent `requestAnimationFrame` stall. The legend code queues scroll synchronization through one rAF token; a stalled callback would leave that token non-null and reproduce the reported freeze. The proposed source explanation—overlapping `scrollIntoView` calls causing the IntersectionObserver to fail to reattach the listener—is not supported by the implementation, which removes the listener only when the section stops intersecting. Reproduce in a normal browser with rAF tracing before accepting this as an application defect.

### Carousel accessible names do not contain their visible labels

**Disposition:** Contradictory and insufficiently reproduced. The web-quality audit reported a Lighthouse `label-content-name-mismatch`, but its own example accessible name contains the visible project title verbatim, the same run scored Accessibility 100, and the functional audit's route-wide serious/critical axe checks passed. The card's broad `article role="button"` semantics may still deserve review, but the claimed speech-control failure is not established. Retest the exact node with the full axe result and a speech-control/manual accessibility pass before changing labels or semantics.

### SYS-mode deactivation correctly preserves violet for 460 ms

**Disposition:** Rejected as evidence against P2-02. The UI/UX audit's positive observation confirms eventual return to blue, not the intermediate hold. Current source deterministically clears the ref and attribute before the effect can enter the hold branch.

### Mobile navigation links do not navigate

**Disposition:** Rejected and explicitly disproven by the UI/UX auditor. The links issue the expected smooth-scroll calls; the original observation came from the audit browser's stalled animation frames.

### Escape does not close the mobile menu

**Disposition:** Rejected and explicitly disproven by live retesting and source inspection.

### Add Arrow-key roving to the capability legend

**Disposition:** Optional design alternative, not a defect. The legend is a list of ordinary buttons rather than a tablist/listbox composite, so Tab navigation is the expected keyboard model.

### Add Escape-to-close to note pages

**Disposition:** Not accepted as a production issue. The note is a routed page with a visible Back control even though its layout is full-viewport. Escape navigation is not a general page requirement; adding it would be a product choice rather than a correction.

### Replace every newline in project titles

**Disposition:** Future-only and speculative. Every current project title contains at most one newline, so the existing non-global replacement produces the intended label today. Revisit if title shape changes.

### Home portrait readiness becomes stale across a breakpoint resize

**Disposition:** Insufficiently evidenced. The report identified a narrow timing possibility but no reproduced failure, and the readiness hook fails open after six seconds rather than trapping the application.

### Remove `style-src 'unsafe-inline'` together with script inline allowance

**Disposition:** Rejected as a current remediation. Inline style writes are load-bearing for React/Framer Motion. P2-05 intentionally limits the immediate CSP change to JavaScript.

### Treat missing Core Web Vitals field data as a confirmed INP defect

**Disposition:** Rejected. A load-only lab run cannot establish visit-level INP, and no field dataset was available.

## Not Verified

- **Real WebKit/Safari:** No native or Docker WebKit run was completed. Safari-specific safe-rendering behavior was inferred or UA-spoofed, not exercised in the real engine.
- **Real mobile hardware:** Touch, orientation, device-pixel-ratio behavior, haptics, embedded browsers, and device thermal/CPU constraints were emulated rather than tested on physical devices.
- **Manual assistive technology:** No screen-reader, switch-control, or speech-control pass was reported. Automated Lighthouse/axe results cannot establish end-to-end usability.
- **Field Core Web Vitals:** There was no CrUX, Search Console, or first-party RUM dataset. Production p75 LCP and INP therefore remain unknown.
- **Firefox preloader-test root cause:** Cache isolation is only a theory; tracing did not establish it.
- **Fault-injected PDF behavior:** The valid public PDF was inspected, but page-1 acquisition/rasterization failure was inferred from source rather than reproduced with a partial/corrupt artifact.
- **Generated OG-card output:** The generator was inspected but not run and visually compared with its source data.
- **Vercel account-level configuration outside the repository:** The deployed routes and headers were checked, but external rewrites/functions, WAF/CDN controls, analytics, or future integrations not represented in this repository were outside scope.
- **Future dynamic features:** Authentication, authorization, CSRF, rate limiting, uploads, databases, and user-input sanitization are not applicable to the current static site and would require a new review if introduced.

## Final Scores

| Area | Score | Evidence-based rationale |
| --- | ---: | --- |
| Functionality | **88/100** | Core routes, navigation, links, error boundary, carousel, CV happy path, and reduced-motion paths were exercised successfully; deductions reflect the SYS defects, CV edge-case handling, and unreliable Firefox check. |
| UI/UX | **86/100** | Strong visual system, focus treatment, responsive composition, and signature interactions; deductions reflect two confirmed SYS/motion defects and several transition/pacing inconsistencies. The unproven legend freeze was not scored as a defect. |
| Mobile | **89/100** | No overflow, controls meet touch-size expectations, and mobile navigation was reverified; the long Capabilities section and lack of physical-device testing limit confidence. |
| Accessibility | **94/100** | Lighthouse scored 100 and serious/critical axe checks passed across routes and two widths, with strong landmarks, focus, reduced-motion, and live-region support. No manual AT pass occurred, and clipboard failure lacks visible feedback. |
| Performance | **84/100** | Lighthouse Performance was 89 with zero CLS and acceptable TBT, but 3.0 s mobile lab LCP, 1.26 s render delay, and substantial early main-thread work are material. Field results are unknown. |
| SEO | **98/100** | Canonicals, route-specific metadata, crawler shells, sitemap, robots, structured data, redirects, and true 404 behavior were verified. The deduction reflects lack of field/search-console validation rather than a known metadata defect. |
| Security | **92/100** | No exploitable issue, secret, vulnerable dependency, unsafe content sink, or backend attack surface was found; strong production headers are deployed. Inline-script CSP and non-immutable deployment installation remain defense-in-depth gaps. |
| Code Quality | **89/100** | Lint/build pass, source review found careful cleanup and motion handling, and strict mode already compiles cleanly. State ownership in SYS mode, partial error coverage, a flaky test, and unenforced strictness reduce the score. |
| Production Readiness | **87/100** | The core static portfolio is deployable and the accepted issues are non-blocking, but important performance, signature-interaction, resilience, test-confidence, and browser/device coverage gaps remain. |

## Recommended Fix Order

1. **P2-06 — Stabilize the Firefox preloader test** so subsequent changes have a trustworthy release signal.
2. **P2-02 — Unify SYS-mode deactivation ownership** and add an assertion for the 460 ms color-hold interval.
3. **P2-03 — Preserve settled particle state on resize** and add resize/orientation regression coverage while the SYS test surface is already being changed.
4. **P2-04 — Complete PDF page-level error handling** and add a partial-document failure fixture/test.
5. **P2-01 — Establish the performance baseline and ship a visible static hero shell**, then defer below-fold motion and re-measure before further optimization.
6. **P2-05 — Remove script `'unsafe-inline'` with a hash or external boot asset** and validate the policy on a Vercel Preview.
7. **P3-01 — Switch Vercel installation to `npm ci`** in the same deployment-hardening pass.
8. **P3-05 — Add visible clipboard-failure feedback** because it closes a real user-facing failure path with low implementation risk.
9. **P3-07 — Reset pointer visuals during cleanup** and verify hybrid capability changes.
10. **P3-06 — Add a media-gated raster portrait fallback** without restoring hidden mobile downloads.
11. **P3-02 — Add coordinated exit/enter transitions** for project details and note navigation.
12. **P3-03 — Normalize carousel pacing and keyboard-triggered rotation duration** after transition timing is treated as one shared motion pass.
13. **P3-04 — Replace certification padding animation with transform** in that same motion/performance pass.
14. **P3-09 — Add semantic `<time>` markup** to visible note metadata.
15. **P3-10 — Prototype and test mobile Capabilities progressive disclosure** before committing to an accordion interaction.
16. **P3-11 — Correct the timeline orphan** after checking adjacent desktop widths.
17. **P3-08 — Version and cache the favicon** with the next static-asset revision.
18. **P3-12 — Enable TypeScript strict mode** as a separate, easily reversible policy change.
19. **P3-13 — Remove duplicated content/documentation drift** after the behavior and deployment work is complete.

## Final Verdict

**PRODUCTION READY**

The accepted issues do not block the current static portfolio's core user journey or establish a presently exploitable security flaw. P2 items should be scheduled promptly, and WebKit, physical-device, manual-AT, and field-performance evidence should be added before claiming comprehensive cross-platform readiness.
