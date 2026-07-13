import { useEffect } from "react";
import { pageUrl, site, type PageMetadata } from "../data/site";

export { pageUrl, site };
export const SITE_URL = site.url;

type MetaAttribute = "name" | "property";

function setMeta(selector: string, attribute: MetaAttribute, value: string, content?: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (content === undefined) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(url?: string) {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!url) {
    canonical?.remove();
    return;
  }
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

export function PageMeta({ metadata }: { metadata: PageMetadata }) {
  useEffect(() => {
    const url = metadata.canonical ? pageUrl(metadata.path) : undefined;
    const image = metadata.image ? pageUrl(metadata.image.path) : undefined;

    document.title = metadata.title;
    setMeta('meta[name="description"]', "name", "description", metadata.description);
    setMeta('meta[name="robots"]', "name", "robots", metadata.robots);
    setCanonical(url);

    setMeta('meta[property="og:title"]', "property", "og:title", url ? metadata.title : undefined);
    setMeta('meta[property="og:description"]', "property", "og:description", url ? metadata.description : undefined);
    setMeta('meta[property="og:type"]', "property", "og:type", url ? metadata.type : undefined);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", url ? site.name : undefined);
    setMeta('meta[property="og:locale"]', "property", "og:locale", url ? site.locale : undefined);
    setMeta('meta[property="og:image"]', "property", "og:image", image);
    setMeta('meta[property="og:image:width"]', "property", "og:image:width", image ? String(metadata.image?.width) : undefined);
    setMeta('meta[property="og:image:height"]', "property", "og:image:height", image ? String(metadata.image?.height) : undefined);
    setMeta('meta[property="og:image:type"]', "property", "og:image:type", image ? metadata.image?.type : undefined);
    setMeta('meta[property="og:image:alt"]', "property", "og:image:alt", image ? metadata.image?.alt : undefined);
    setMeta('meta[property="article:published_time"]', "property", "article:published_time", metadata.publishedTime);
    setMeta('meta[property="article:modified_time"]', "property", "article:modified_time", metadata.modifiedTime);

    setMeta('meta[name="twitter:card"]', "name", "twitter:card", image ? "summary_large_image" : undefined);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", image ? metadata.title : undefined);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", image ? metadata.description : undefined);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", image);
    setMeta('meta[name="twitter:image:alt"]', "name", "twitter:image:alt", image ? metadata.image?.alt : undefined);
  }, [metadata]);
  return null;
}

export function JsonLd({ id, data }: { id: string; data: Record<string, unknown> }) {
  useEffect(() => {
    let script = document.head.querySelector<HTMLScriptElement>(`script[data-jsonld="${id}"]`);
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.jsonld = id;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
    return () => script?.remove();
  }, [data, id]);
  return null;
}
