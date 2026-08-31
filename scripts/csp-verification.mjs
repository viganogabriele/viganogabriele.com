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
    const attributes = match[1];
    if (/\bsrc\s*=/i.test(attributes)) continue;

    const typeMatch = attributes.match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const type = (typeMatch?.[1] ?? typeMatch?.[2] ?? typeMatch?.[3] ?? "").trim().toLowerCase();
    if (type && type !== "module" && type !== "text/javascript" && type !== "application/javascript") continue;
    scripts.push(match[2]);
  }
  return scripts;
}

export function sha256Source(script) {
  return `sha256-${createHash("sha256").update(script).digest("base64")}`;
}

export function verifyPolicy(policy, htmlDocuments) {
  const directives = parseDirectives(policy);
  const scriptSources = directives.get("script-src") ?? [];
  const styleSources = directives.get("style-src") ?? [];

  if (scriptSources.includes("unsafe-inline")) {
    throw new Error("CSP script-src must not contain 'unsafe-inline'.");
  }
  if (!styleSources.includes("unsafe-inline")) {
    throw new Error("CSP style-src must retain 'unsafe-inline' for React and Framer Motion inline styles.");
  }

  const authorizedHashes = new Set(scriptSources.filter((source) => cspHashPattern.test(source)));
  const emittedHashes = new Set();
  for (const { name, html } of htmlDocuments) {
    for (const script of executableInlineScripts(html)) {
      const hash = sha256Source(script);
      emittedHashes.add(hash);
      if (!authorizedHashes.has(hash)) {
        throw new Error(`${name}: executable inline script is not authorized by CSP (${hash}).`);
      }
    }
  }

  for (const hash of authorizedHashes) {
    if (!emittedHashes.has(hash)) {
      throw new Error(`CSP authorizes ${hash}, but no built executable inline script has those bytes.`);
    }
  }

  return { authorizedHashes: [...authorizedHashes], emittedHashes: [...emittedHashes] };
}
