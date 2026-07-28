import type { NoteItem } from "./notes";

export const site = {
  name: "Gabriele Viganò",
  url: "https://www.viganogabriele.com",
  locale: "en_US",
  language: "en",
  title: "Gabriele Viganò",
  description: "Computer Engineering student at Politecnico di Milano. I run product and QA at PoliNetwork, the student network behind 500+ group chats and 18,000 members.",
  socialImage: {
    path: "/og-cover-v3.png",
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "Gabriele Viganò · product, QA and infrastructure.",
  },
  updatedAt: "2026-07-13",
} as const;

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
  description: "Curriculum vitae of Gabriele Viganò: product, QA and treasury at PoliNetwork, self-hosted infrastructure, Computer Engineering at Politecnico di Milano.",
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
      description: "Portfolio of Gabriele Viganò: product and QA work, self-hosted infrastructure, and notes on the decisions behind both.",
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
