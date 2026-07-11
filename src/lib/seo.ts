import { useEffect } from "react";

export const SITE_URL = "https://viganogabriele.com";

export function PageMeta({ title, description, path }: { title: string; description: string; path: string }) {
  useEffect(() => {
    document.title = title;
    const setMeta = (selector: string, content: string, attribute: "name" | "property", value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
      }
      element.content = content;
    };
    setMeta('meta[name="description"]', description, "name", "description");
    setMeta('meta[property="og:title"]', title, "property", "og:title");
    setMeta('meta[property="og:description"]', description, "property", "og:description");
    setMeta('meta[property="og:url"]', `${SITE_URL}${path}`, "property", "og:url");
    setMeta('meta[name="twitter:card"]', "summary_large_image", "name", "twitter:card");
    setMeta('meta[name="twitter:title"]', title, "name", "twitter:title");
    setMeta('meta[name="twitter:description"]', description, "name", "twitter:description");
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}${path}`;
  }, [description, path, title]);
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
