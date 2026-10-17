import { createHash } from "node:crypto";

const cspHashPattern = /^sha(?:256|384|512)-[A-Za-z0-9+/]+={0,2}$/;

export function parseDirectives(policy) {
  return new Map(policy.split(";").map((part) => {
    const [name, ...sources] = part.trim().split(/\s+/);
    return [name, sources.map((source) => source.replace(/^'|'$/g, ""))];
  }).filter(([name]) => name));
}

export function executableInlineScripts(html) {
  const scripts = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (/\bsrc\s*=/i.test(match[1])) continue;
    const typeMatch = match[1].match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const type = (typeMatch?.[1] ?? typeMatch?.[2] ?? typeMatch?.[3] ?? "").trim().toLowerCase();
    if (type && type !== "module" && type !== "text/javascript" && type !== "application/javascript") continue;
    scripts.push(match[2]);
  }
  return scripts;
}

export function sha256Source(script) {
  return `sha256-${createHash("sha256").update(script).digest("base64")}`;
}

export function verifyPolicy(policy, documents) {
  const directives = parseDirectives(policy);
  const scripts = directives.get("script-src") ?? [];
  if (scripts.includes("unsafe-inline")) throw new Error("CSP script-src must not contain 'unsafe-inline'.");
  // Reported, not enforced. React writes element styles through the style
  // attribute — framer-motion does it every frame — and style-src
  // 'unsafe-inline' is what permits that, so this used to be a hard
  // requirement. That made the security check fail the day someone removed the
  // last inline style and tightened the policy: a verifier that rejects an
  // improvement to the thing it verifies. Whether inline styles are still
  // needed is a runtime question, and tests/csp-headers.spec.ts answers it in a
  // browser under these exact headers.
  const notes = [];
  if (!(directives.get("style-src") ?? []).includes("unsafe-inline")) {
    notes.push("style-src no longer allows 'unsafe-inline': confirm nothing inline is being blocked at runtime (npm run test:e2e:csp).");
  }
  const authorized = new Set(scripts.filter((source) => cspHashPattern.test(source)));
  const emitted = new Set();
  for (const { name, html } of documents) for (const script of executableInlineScripts(html)) {
    const hash = sha256Source(script);
    emitted.add(hash);
    if (!authorized.has(hash)) throw new Error(`${name}: executable inline script is not authorized by CSP (${hash}).`);
  }
  for (const hash of authorized) if (!emitted.has(hash)) throw new Error(`CSP authorizes ${hash}, but no built executable inline script has those bytes.`);
  return { emittedHashes: [...emitted], notes };
}
