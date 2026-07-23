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
      "The platform and operating model behind a fast-growing student community — turning a loosely organized volunteer network into one coherent product, process, and events engine.",
    role: "Board Member & Treasurer · Product & Operations Lead",
    contribution:
      "Set the information architecture and UX direction for the platform, then built the operating model behind it — recruiting and structuring the design, engineering, and events teams that run it.",
    outcome:
      "One coherent platform and process now carries the community from routine updates to 1,000+ person events, run by a distributed team instead of a single person.",
    proof: "30+ volunteers recruited and organized into 5 functioning teams.",
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
      "This site: a portfolio treated as a product — designed, engineered, stress-tested, and refined in public rather than assembled from a template.",
    role: "Solo — design, build, iterate",
    contribution:
      "Built every layer myself: a physics-feeling 3D carousel, a motion profile that scales animation to each device's GPU and the user's reduced-motion preference, and a custom cursor and system-mode overlay with no UI library underneath.",
    outcome:
      "Stays fast and accessible under real constraints — reduced-motion and low-power paths, a clean production build, and no compromises on touch devices or in-app browsers like Telegram.",
    proof: "Lint and production build pass clean; verified on touch devices and in Telegram's in-app browser.",
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
    description:
      "An AI-assisted study planner built in a single 24-hour hackathon — spaced repetition, planning, and gamification wrapped in a working React Native app.",
    role: "Team Lead & Full-stack Developer",
    contribution: "Led a four-person team through the full 24 hours — split the workload, kept scope realistic, and shipped the React Native app end to end.",
    outcome: "A working, demoable study-planning app pairing useful AI guidance with habits designed to actually stick.",
    proof: "Scoped, built, and demoed by a 4-person team in 24 hours.",
    stack: ["React Native", "Expo", "Gemini API", "Zustand"],
    status: "Hackathon build",
    link: "https://github.com/viganogabriele/gdg2026",
    artifact: "studyquest",
    metrics: [{ value: "24H", label: "build time" }, { value: "4", label: "team members" }],
    accent: "bone",
    buildMeta: "24H delivery / 4-person build cell",
  },
];
