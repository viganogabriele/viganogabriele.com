import type { NoteItem } from "./notes.ts";
import { profile } from "./profile.ts";

export const site = {
  name: "Gabriele Viganò",
  url: "https://www.viganogabriele.com",
  locale: "en_US",
  language: "en",
  title: "Gabriele Viganò",
  description: "Computer Engineering student at Politecnico di Milano. PoliNetwork board member, product and QA owner, building self-hosted infrastructure and remote AI workflows.",
  socialImage: {
    path: "/og-cover.jpg",
    width: 1200,
    height: 630,
    type: "image/jpeg",
    alt: "Gabriele Viganò · infrastructure, front-end and product.",
  },
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
  description: "CV of Gabriele Viganò: Computer Engineering at Politecnico di Milano, PoliNetwork board member and treasurer, product ownership, QA and self-hosted infrastructure.",
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
      description: site.description,
      inLanguage: site.language,
    },
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
      url: pageUrl("/"),
      image: pageUrl(site.socialImage.path),
      description: site.description,
      jobTitle: ["Computer Engineering Student", profile.currentRole],
      affiliation: [
        { "@type": "CollegeOrUniversity", name: "Politecnico di Milano" },
        { "@type": "Organization", name: "PoliNetwork" },
      ],
      knowsAbout: ["Self-hosted infrastructure", "Remote AI workflows", "Product ownership", "Quality assurance", "Front-end development"],
      sameAs: [profile.github, profile.linkedIn],
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
    // A plain @id reference only resolves if the referencing document also
    // defines that node. Notes ship as their own static page, never paired
    // with the Person node from websitePersonJsonLd (home-only), so structured
    // data parsers evaluating a note in isolation can't follow the reference —
    // inlined here instead so each note's Article stands on its own.
    author: { "@type": "Person", name: site.name, url: pageUrl("/") },
  } as const;
}
