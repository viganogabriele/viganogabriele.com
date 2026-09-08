import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { verifyPolicy } from "./csp-verification.mjs";

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  }))).flat();
}

const root = resolve(import.meta.dirname, "..");
const config = JSON.parse(await readFile(resolve(root, "vercel.json"), "utf8"));
const headers = config.headers?.find((entry) => entry.source === "/(.*)")?.headers ?? [];
const policy = headers.find((header) => header.key.toLowerCase() === "content-security-policy")?.value;
if (!policy) throw new Error("Global Content-Security-Policy header not found in vercel.json.");
const paths = await htmlFiles(resolve(root, "dist"));
if (!paths.length) throw new Error("No built HTML documents found in dist; run the production build first.");
const documents = await Promise.all(paths.map(async (path) => ({ name: path.slice(root.length + 1), html: await readFile(path, "utf8") })));
const result = verifyPolicy(policy, documents);
console.log(`Verified CSP for ${documents.length} built HTML documents: ${result.emittedHashes.join(", ")}.`);
