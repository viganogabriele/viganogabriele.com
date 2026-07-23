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
    description: "Platform and operating model for a 45,000-student community.",
    role: "Board Member & Treasurer · Product & Operations Lead",
    contribution: "Set the product/UX direction; recruited and structured the teams that run it.",
    outcome: "Runs on one platform and process instead of ad-hoc tools, up to 1,000+ person events.",
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
    description: "This site — designed and built solo, not templated.",
    role: "Solo — design, build, iterate",
    contribution: "Built the 3D carousel, motion profiling, custom cursor, and system-mode overlay from scratch.",
    outcome: "Fast and accessible on low-power devices, touch, and in-app browsers like Telegram.",
    proof: "Lint and production build pass clean; tested on touch and Telegram's in-app browser.",
    stack: ["React 19", "TypeScript", "Framer Motion", "Vite"],
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
    description: "AI study planner built in a 24-hour hackathon.",
    role: "Team Lead & Full-stack Developer",
    contribution: "Led a 4-person team; scoped, built, and shipped the app in a day.",
    outcome: "Working app pairing AI guidance with spaced-repetition habits.",
    proof: "Built and demoed by a 4-person team in 24 hours.",
    stack: ["React Native", "Expo", "Gemini API", "Zustand"],
    status: "Hackathon build",
    link: "https://github.com/viganogabriele/gdg2026",
    artifact: "studyquest",
    metrics: [{ value: "24H", label: "build time" }, { value: "4", label: "team members" }],
    accent: "bone",
    buildMeta: "24H delivery / 4-person build cell",
  },
];
