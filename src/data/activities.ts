import { Bot, CheckCircle2, Code2, Server, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ExpertiseArtifact = "topology" | "agent-grid" | "interface" | "quality" | "community";

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
      "Six people keep their data on a box I administer, and that changes which decisions are worth making. Parity for the disk that dies, scheduled scrubs for the corruption you can't see yet, an encrypted off-site copy for the house itself. The next layer is a second node for local replication.",
    tags: ["Proxmox", "ZFS", "WireGuard", "Linux"],
    icon: Server,
    artifact: "topology",
  },
  {
    index: "02",
    title: "AI-Assisted Development",
    role: "Agents that don't run on my laptop",
    description:
      "Claude Code and Codex run on an Oracle VPS I reach over Tailscale from my desktop, a browser or my phone. They open the pull requests and run the deploys; I review the previews on Vercel. Models don't do what you ask a good fraction of the time, so the part that matters is clicking through the output and catching what's subtly wrong.",
    tags: ["Claude Code", "Codex", "Tailscale", "Verification"],
    icon: Bot,
    artifact: "agent-grid",
  },
  {
    index: "03",
    title: "Front-End & Interaction Design",
    role: "This site, screen by screen",
    description:
      "I designed the layout and the motion here, specified both down to the easing, and reviewed every screen until it matched the intent. The reason I go this deep on the front-end is upstream of the design: a bug report is only worth filing if you can name what's actually broken.",
    tags: ["HTML", "CSS", "Figma", "Motion design"],
    icon: Code2,
    artifact: "interface",
  },
  {
    index: "04",
    title: "Product & Quality",
    role: "polinetwork.org and the services around it",
    description:
      "I'm the product manager for a rebuild scoped to feature parity plus the services that had gone dead, with every new idea written down and deferred, because a rebuild that grows while it rebuilds never ships. I also own the testing across the site, the bot, the shortener and the dashboard, from filing the issue to following the fix to release.",
    tags: ["Product scoping", "Information architecture", "QA"],
    icon: CheckCircle2,
    artifact: "quality",
  },
  {
    index: "05",
    title: "Teams & Events",
    role: "From 150 people to 1,000",
    description:
      "On my second day at university I asked to run a meetup for Computer Engineering freshmen and 150 to 200 came. The year after, about 1,000. Then I built a team, designed a multi-stage interview process in Italian and English, and recruited 30+ volunteers into 5 teams, because one person carrying an event can't run the next one.",
    tags: ["Event ops", "Recruitment", "Coaching"],
    icon: Users,
    artifact: "community",
  },
];
