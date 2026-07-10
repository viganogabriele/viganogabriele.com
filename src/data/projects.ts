export type ProjectArtifact = "network" | "portfolio" | "reserved";

export interface Project {
  title: string;
  index: string;
  eyebrow: string;
  description: string;
  role: string;
  contribution: string;
  outcome: string;
  proof: string;
  stack: string[];
  status: string;
  link?: string;
  artifact: ProjectArtifact;
}

export const projects: Project[] = [
  {
    index: "01",
    eyebrow: "Student community / product system",
    title: "PoliNetwork\nEcosystem",
    description:
      "A connected web and operations ecosystem for a fast-moving student community.",
    role: "Product & UX lead",
    contribution:
      "Information architecture, UX direction, and coordination across design, engineering, and operations.",
    outcome:
      "Scaled events from ~150 to 1,000+ attendees and recruited the IT and design teams that sustain the work.",
    proof: "Owns the web ecosystem’s product direction.",
    stack: ["Product", "UX", "Figma", "Operations"],
    status: "In progress · ongoing",
    link: "https://github.com/PoliNetworkOrg",
    artifact: "network",
  },
  {
    index: "02",
    eyebrow: "Personal laboratory / interaction design",
    title: "Interactive\nPortfolio",
    description:
      "A portfolio treated as a product: designed, built, stress-tested, and continuously refined in public.",
    role: "Solo — design, build, iterate",
    contribution:
      "React 19, Vite, Framer Motion, Lenis, and Matter.js shaped into a hardened cinematic build.",
    outcome:
      "Interactive without trading away accessibility, reduced-motion paths, or a smooth mobile experience.",
    proof: "Lint + production build clean; guarded for touch and Telegram webviews.",
    stack: ["React 19", "Framer Motion", "Vite", "Matter.js"],
    status: "Continuously evolving",
    link: "https://github.com/viganogabriele/viganogabriele.com",
    artifact: "portfolio",
  },
  {
    index: "03",
    eyebrow: "An intentional empty slot",
    title: "Next\nBuild",
    description:
      "Room for the next thing worth shipping. A deliberate blank, not a broken card.",
    role: "Reserved",
    contribution: "The brief is still being earned.",
    outcome: "A new proof point belongs here when it is real.",
    proof: "Status: waiting for the right problem.",
    stack: ["R&D", "Curiosity", "Next release"],
    status: "Reserved",
    artifact: "reserved",
  },
];
