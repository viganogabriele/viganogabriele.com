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
    eyebrow: "Student network / product ownership",
    title: "PoliNetwork\nEcosystem",
    description: "500+ Telegram and WhatsApp groups for Politecnico students, 18,000 of them in the main one, plus the site, bot and tools around it.",
    role: "Board Member & Treasurer · Product & Operations",
    contribution: "Scoped the site rebuild to feature parity plus the services that had gone dead, deferred every new idea, and defined the UX, information architecture and flows in Figma.",
    outcome: "The site takes 6.7K clicks and 52.6K impressions a month from Google. The rebuild launches September 2026.",
    proof: "30+ volunteers recruited across 5 teams, through interviews I designed and ran.",
    stack: ["Product", "UX", "Figma", "QA"],
    status: "In build · launch 09/2026",
    link: "https://github.com/PoliNetworkOrg",
    artifact: "network",
    metrics: [{ value: "18,000", label: "members in the main group" }, { value: "6.7K", label: "monthly clicks from Google" }],
    accent: "violet",
    buildMeta: "500+ groups / 5 volunteer teams",
  },
  {
    index: "02",
    eyebrow: "Personal site / interaction design",
    title: "Interactive\nPortfolio",
    description: "This site. I designed every screen, animation and interaction; a model wrote most of the code.",
    role: "Solo: design, direction, review",
    contribution: "Specified the 3D carousel, the custom cursor, the system-mode overlay, and a motion profile that steps down on weak devices instead of stuttering. Then reviewed the output until it matched.",
    outcome: "Holds up on low-power phones, touch, and Telegram's in-app browser, which is where it broke first.",
    proof: "Brave and Telegram's webview report a fine pointer while being touch-only. Every mobile mitigation here hangs off a touch check, not a media query.",
    stack: ["React 19", "TypeScript", "Framer Motion", "Vite"],
    status: "Live · still editing",
    link: "https://github.com/viganogabriele/viganogabriele.com",
    artifact: "portfolio",
    metrics: [{ value: "3", label: "motion tiers by device capability" }, { value: "AA", label: "accessibility target" }],
    accent: "blue",
    buildMeta: "React 19 / Vite 8 / Motion profile",
  },
  {
    index: "03",
    eyebrow: "GDG AI Hack Milan / 24 hours",
    title: "Study\nQuest",
    description: "A gamified study planner with spaced repetition, built in 24 hours at Google's GDG AI Hack alongside 160 other participants.",
    role: "Team lead",
    contribution: "Set the timeline, chose the feature set and assigned the work for four people. We picked React Native knowing our shared background was React on the web, and paid for it in time.",
    outcome: "Shipped and demoed. We didn't place: the build drifted from the challenge track, and the judges scored fit to the brief before ambition.",
    proof: "Screenshots and a demo video in the repo.",
    stack: ["React Native", "Expo", "Gemini API", "Zustand"],
    status: "Hackathon build",
    link: "https://github.com/viganogabriele/gdg2026",
    artifact: "studyquest",
    metrics: [{ value: "24H", label: "build time" }, { value: "4", label: "team members" }],
    accent: "bone",
    buildMeta: "24h build / 4-person team",
  },
];
