import { Bot, CheckCircle2, Code2, Server, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ExpertiseArtifact = "network" | "checklist" | "scale" | "constellation";

export interface Activity {
  index: string;
  title: string;
  role: string;
  description: string;
  tags: string[];
  icon: LucideIcon;
  artifact: ExpertiseArtifact;
}

export const activities: Activity[] = [
  {
    index: "01",
    title: "Self-Hosting & Infrastructure",
    role: "My homelab, since December 2025",
    description:
      "TrueNAS with 4x4TB in RAIDZ1, scrubbed on a schedule and backed up encrypted off-site. Proxmox runs the rest in LXC. The WireGuard container stays stopped until a Telegram bot locked to my account starts it, so the tunnel only exists while I'm using it.",
    tags: ["Proxmox", "ZFS", "WireGuard", "Linux"],
    icon: Server,
    artifact: "network",
  },
  {
    index: "02",
    title: "AI-Assisted Development",
    role: "Agents that don't run on my laptop",
    description:
      "Claude Code and Codex run on an Oracle VPS I reach over Tailscale from my desktop, a browser or my phone. They open the pull requests and run the deploys; I review the previews on Vercel. Models don't do what you ask a good fraction of the time, so the part that matters is clicking through the output and catching what's subtly wrong.",
    tags: ["Claude Code", "Codex", "Tailscale", "Verification"],
    icon: Bot,
    artifact: "constellation",
  },
  {
    index: "03",
    title: "Front-End & Interaction Design",
    role: "This site, screen by screen",
    description:
      "I designed the layout and the motion, then specified both precisely enough for a model to build, and reviewed the output until it matched. JavaScript is in progress and React comes after it, so the next one is written by me. I study the front-end because I can't spec a fix for something I don't understand.",
    tags: ["HTML", "CSS", "Figma", "Motion design"],
    icon: Code2,
    artifact: "network",
  },
  {
    index: "04",
    title: "Product & Quality",
    role: "polinetwork.org and the services around it",
    description:
      "I'm the product manager for a rebuild scoped to feature parity plus the services that had gone dead, with every new idea written down and deferred, because a rebuild that grows while it rebuilds never ships. I also own the testing across the site, the bot, the shortener and the dashboard, from filing the issue to following the fix to release.",
    tags: ["Product scoping", "Information architecture", "QA"],
    icon: CheckCircle2,
    artifact: "checklist",
  },
  {
    index: "05",
    title: "Teams & Events",
    role: "From 150 people to 1,000",
    description:
      "On my second day at university I asked to run a meetup for Computer Engineering freshmen and 150 to 200 came. The year after, about 1,000. Then I built a team, designed a multi-stage interview process in Italian and English, and recruited 30+ volunteers into 5 teams, because one person carrying an event can't run the next one.",
    tags: ["Event ops", "Recruitment", "Coaching"],
    icon: Users,
    artifact: "scale",
  },
];
