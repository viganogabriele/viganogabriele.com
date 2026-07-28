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
    eyebrow: "Self-hosting / sysadmin",
    title: "Homelab &\nRemote Dev",
    description: "Two machines at home and an Oracle VPS, running since December 2025. Storage for 6 people, and an environment where coding agents keep working when my laptop is shut.",
    role: "Solo: build it, break it, fix it",
    contribution: "TrueNAS with 4x4TB in RAIDZ1, scheduled scrubs, encrypted off-site backup. Proxmox runs WireGuard, CUPS and Home Assistant in LXC. Claude Code and Codex sit on the VPS, reachable over Tailscale from a browser or my phone.",
    outcome: "The VPN container is stopped by default and a Telegram bot locked to my account starts it. A forwarded port into an always-on tunnel is a door left open.",
    proof: "Bot source is public. Only my Telegram account can talk to it.",
    stack: ["Proxmox", "TrueNAS / ZFS", "WireGuard", "Tailscale"],
    status: "Running since 12/2025",
    link: "https://github.com/viganogabriele/telegram-proxmox-vpn",
    artifact: "network",
    metrics: [{ value: "16TB", label: "raw in RAIDZ1" }, { value: "6", label: "users on the storage" }],
    accent: "blue",
    buildMeta: "Proxmox / TrueNAS / VPN off by default",
  },
  {
    index: "02",
    eyebrow: "Personal site / interaction design",
    title: "Interactive\nPortfolio",
    description: "This site. Every interaction pattern and animation is mine from scratch, and the hard part turned out to be the browsers that lie about what they are.",
    role: "Solo: design, direction, review",
    contribution: "The 3D carousel, the custom cursor, the system-mode overlay, and a motion profile that steps down on weak devices instead of stuttering through the same animations.",
    outcome: "Holds up on low-power phones, on touch, and in Telegram's in-app browser, which is where it broke first.",
    proof: "Brave and Telegram's webview report a fine pointer while being touch-only. Every mobile mitigation here hangs off a touch check, not a media query.",
    stack: ["React 19", "TypeScript", "Framer Motion", "Vite"],
    status: "Live · still editing",
    link: "https://github.com/viganogabriele/viganogabriele.com",
    artifact: "portfolio",
    metrics: [{ value: "3", label: "motion tiers by device capability" }, { value: "AA", label: "accessibility target" }],
    accent: "violet",
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
  {
    index: "04",
    eyebrow: "Volunteer work / product ownership",
    title: "PoliNetwork\nEcosystem",
    description: "An independent student network of 500+ group chats, plus the site, bot and tools around it. I'm on the board, and product and QA are mine.",
    role: "Board Member & Treasurer at PoliNetwork",
    contribution: "Scoped the site rebuild to feature parity plus the services that had gone dead, deferred every new idea, and defined the UX, information architecture and flows in Figma.",
    outcome: "The site takes 6.7K clicks and 52.6K impressions a month from Google. The rebuild launches September 2026.",
    proof: "30+ volunteers recruited across 5 teams, through interviews I designed and ran.",
    stack: ["Product", "UX", "Figma", "QA"],
    status: "In build · launch 09/2026",
    link: "https://github.com/PoliNetworkOrg",
    artifact: "network",
    metrics: [{ value: "500+", label: "group chats across Telegram and WhatsApp" }, { value: "6.7K", label: "monthly clicks from Google" }],
    accent: "violet",
    buildMeta: "500+ groups / 5 volunteer teams",
  },
];
