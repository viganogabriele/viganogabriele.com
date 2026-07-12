export type ProjectArtifact = "network" | "portfolio" | "studyquest";

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
  metrics: Array<{ value: string; label: string }>;
  accent: "blue" | "violet" | "bone";
  buildMeta: string;
}

export const projects: Project[] = [
  {
    index: "01",
    eyebrow: "Student community / product system",
    title: "PoliNetwork\nEcosystem",
    description:
      "A connected web and operations ecosystem for a fast-moving student community.",
    role: "Board Member & Treasurer · Product & Operations Lead",
    contribution:
      "Information architecture, UX direction, and coordination across design, engineering, and operations.",
    outcome:
      "A coherent platform direction supporting a 45,000+ student community and events with up to 1,000+ attendees.",
    proof: "30+ volunteers recruited across 5 teams.",
    stack: ["Product", "UX", "Figma", "Operations"],
    status: "In progress · ongoing",
    link: "https://github.com/PoliNetworkOrg",
    artifact: "network",
    metrics: [{ value: "45K+", label: "students" }, { value: "1K+", label: "event attendees" }],
    accent: "violet",
    buildMeta: "45K network / 5 active teams",
  },
  {
    index: "02",
    eyebrow: "Personal laboratory / interaction design",
    title: "Interactive\nPortfolio",
    description:
      "A portfolio treated as a product: designed, built, stress-tested, and continuously refined in public.",
    role: "Solo — design, build, iterate",
    contribution:
      "React 19, Vite, Framer Motion, and Matter.js shaped into a hardened cinematic build.",
    outcome:
      "Interactive without trading away accessibility, reduced-motion paths, or a smooth mobile experience.",
    proof: "Lint + production build clean; guarded for touch and Telegram webviews.",
    stack: ["React 19", "Framer Motion", "Vite", "Matter.js"],
    status: "Continuously evolving",
    link: "https://github.com/viganogabriele/viganogabriele.com",
    artifact: "portfolio",
    metrics: [{ value: "A–Z", label: "design & build" }, { value: "AA", label: "accessibility target" }],
    accent: "blue",
    buildMeta: "React 19 / Vite 8 / Motion profile",
  },
  {
    index: "03",
    eyebrow: "24-hour hackathon / AI learning",
    title: "Study\nQuest",
    description:
      "An AI-powered study planner combining spaced repetition, planning, and gamification.",
    role: "Team Lead & Full-stack Developer",
    contribution: "Coordinated a four-person team and shipped the React Native experience in a 24-hour hackathon.",
    outcome: "A working study-planning concept built around useful AI guidance and repeatable learning habits.",
    proof: "Designed and shipped by a team of 4 in 24 hours.",
    stack: ["React Native", "Expo", "Gemini API", "Zustand"],
    status: "Hackathon build",
    artifact: "studyquest",
    metrics: [{ value: "24H", label: "build time" }, { value: "4", label: "team members" }],
    accent: "bone",
    buildMeta: "24H delivery / 4-person build cell",
  },
];
