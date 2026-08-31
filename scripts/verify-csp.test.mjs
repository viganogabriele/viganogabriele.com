import assert from "node:assert/strict";
import test from "node:test";
import { sha256Source, verifyPolicy } from "./csp-verification.mjs";

const bootScript = "document.documentElement.dataset.ready = 'true';";
const bootHash = sha256Source(bootScript);
const policy = `default-src 'self'; script-src 'self' '${bootHash}'; style-src 'self' 'unsafe-inline'`;

test("accepts only the exact executable inline script authorized by CSP", () => {
  const result = verifyPolicy(policy, [{
    name: "dist/index.html",
    html: `<script>${bootScript}</script><script type="application/ld+json">{"name":"test"}</script>`,
  }]);
  assert.deepEqual(result.emittedHashes, [bootHash]);
});

test("rejects arbitrary additional inline JavaScript", () => {
  assert.throws(() => verifyPolicy(policy, [{
    name: "dist/index.html",
    html: `<script>${bootScript}</script><script>alert('not authorized')</script>`,
  }]), /executable inline script is not authorized by CSP/);
});

test("rejects broad inline JavaScript authorization", () => {
  assert.throws(
    () => verifyPolicy("script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'", []),
    /must not contain 'unsafe-inline'/,
  );
});
