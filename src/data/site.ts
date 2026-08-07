import type { NoteItem } from "./notes";

export const site = {
  name: "Gabriele Viganò",
  url: "https://www.viganogabriele.com",
  locale: "en_US",
  language: "en",
  title: "Gabriele Viganò",
  description: "Computer Engineering student at Politecnico di Milano. I run self-hosted infrastructure and own product and QA for a student network of 500+ group chats.",
  socialImage: {
    path: "/og-cover.jpg",
    width: 1200,
    height: 630,
    type: "image/jpeg",
    alt: "Gabriele Viganò · infrastructure, front-end and product.",
  },
} as const;

/**
 * `lastmod` for the pages that have no date of their own (`/` and `/cv`).
 *
 * This used to be a hand-written constant, which is a date nobody remembers to
 * change: it read 2026-07-13 while the site had been redeployed many times
 * since, so every crawl was told the home page had not moved. The build date is
 * the honest answer for a site that ships on every merge — notes keep their own
 * `datePublished`, which is a real editorial date and stays hand-written.
 */
export function buildDate() {
  return new Date().toISOString().slice(0, 10);
}

export type PageMetadata = {
  title: string;
  description: string;
  path: string;
  canonical: boolean;
  robots: string;
  type: "website" | "article";
  image?: typeof site.socialImage;
  publishedTime?: string;
  modifiedTime?: string;
};

export function pageUrl(path: string) {
  return new URL(path, site.url).toString();
}

export const homeMetadata: PageMetadata = {
  title: site.title,
  description: site.description,
  path: "/",
  canonical: true,
  robots: "index, follow, max-image-preview:large",
  type: "website",
  image: site.socialImage,
};

export const cvMetadata: PageMetadata = {
  title: `${site.name} · CV`,
  description: "Curriculum vitae of Gabriele Viganò: Computer Engineering at Politecnico di Milano, self-hosted infrastructure, product and QA for a student network.",
  path: "/cv",
  canonical: true,
  robots: "index, follow, max-image-preview:large",
  type: "website",
  image: site.socialImage,
};

export function noteMetadata(note: NoteItem): PageMetadata {
  return {
    title: `${note.title} | ${site.name}`,
    description: note.preview,
    path: `/notes/${note.slug}`,
    canonical: true,
    robots: "index, follow, max-image-preview:large",
    type: "article",
    image: site.socialImage,
    publishedTime: note.datePublished,
    modifiedTime: note.datePublished,
  };
}

export const notFoundMetadata: PageMetadata = {
  title: `Page Not Found | ${site.name}`,
  description: "The requested page is not available.",
  path: "/404",
  canonical: false,
  robots: "noindex, nofollow",
  type: "website",
};

export const websitePersonJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: pageUrl("/"),
      description: "Portfolio of Gabriele Viganò: self-hosted infrastructure, front-end and product work, and notes on the decisions behind them.",
      inLanguage: site.language,
    },
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
      url: pageUrl("/"),
      image: pageUrl(site.socialImage.path),
      jobTitle: "Computer Engineering Student",
      affiliation: { "@type": "CollegeOrUniversity", name: "Politecnico di Milano" },
      sameAs: ["https://github.com/viganogabriele", "https://linkedin.com/in/viganogabriele"],
    },
  ],
} as const;

export function noteJsonLd(note: NoteItem) {
  const metadata = noteMetadata(note);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${pageUrl(metadata.path)}#article`,
    headline: note.title,
    description: note.preview,
    url: pageUrl(metadata.path),
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl(metadata.path) },
    image: pageUrl(site.socialImage.path),
    datePublished: note.datePublished,
    dateModified: note.datePublished,
    inLanguage: site.language,
    author: { "@id": `${site.url}/#person` },
  } as const;
}
