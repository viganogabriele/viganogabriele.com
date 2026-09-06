import assert from "node:assert/strict";
import test from "node:test";
import { sha256Source, verifyPolicy } from "./csp-verification.mjs";

const boot = "document.documentElement.dataset.ready = 'true';";
const policy = `default-src 'self'; script-src 'self' '${sha256Source(boot)}'; style-src 'self' 'unsafe-inline'`;

test("CSP authorizes only the exact executable inline script", () => {
  assert.doesNotThrow(() => verifyPolicy(policy, [{ name: "index.html", html: `<script>${boot}</script><script type="application/ld+json">{}</script>` }]));
  assert.throws(() => verifyPolicy(policy, [{ name: "index.html", html: `<script>${boot}</script><script>alert(1)</script>` }]), /not authorized/);
});
