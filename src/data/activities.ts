import { Bot, CheckCircle2, Network, Orbit, Users } from "lucide-react";
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
    title: "Product & UX Direction",
    role: "polinetwork.org, rebuilt from scratch",
    description:
      "I defined the UX, the information architecture and the user flows, and scoped the rebuild to feature parity plus the services that had gone dead. A parser for the housing group and a laptop guide for engineering students are both written down and both deferred, because a rebuild that grows while it rebuilds never ships.",
    tags: ["Product scoping", "Information architecture", "Figma"],
    icon: Network,
    artifact: "network",
  },
  {
    index: "02",
    title: "Quality & Testing",
    role: "Site, bot, shortener, dashboard",
    description:
      "I own end-to-end testing across every service the association runs. I file the issue in the open-source repo, write the technical spec for the fix, and follow it to release. This is also why I study the front-end at all: to write a useful bug report you have to know what's actually broken.",
    tags: ["QA", "Issue specs", "Open source"],
    icon: CheckCircle2,
    artifact: "checklist",
  },
  {
    index: "03",
    title: "Event-Scale Operations",
    role: "From 150 people to 1,000",
    description:
      "On my second day at university I asked to run a meetup for Computer Engineering freshmen and 150 to 200 came. The year after, open to all freshmen with a venue partnership, about 1,000 did. Then I built a team, because one person carrying an event can't run the next one.",
    tags: ["Event ops", "Partnerships", "Feedback loops"],
    icon: Orbit,
    artifact: "scale",
  },
  {
    index: "04",
    title: "Cross-Team Coordination",
    role: "5 teams, 40-person assembly",
    description:
      "I designed and ran a multi-stage interview process in Italian and English, recruited 30+ volunteers into 5 teams, and appointed and coached the leads, international members included. I chair the members' assembly and take the annual budget through it for approval.",
    tags: ["Recruitment", "Coaching", "Governance"],
    icon: Users,
    artifact: "constellation",
  },
  {
    index: "05",
    title: "AI-Assisted Development",
    role: "Agents that don't run on my laptop",
    description:
      "Claude Code and Codex run on an Oracle VPS I reach over Tailscale from my desktop, a browser or my phone. They open the pull requests and run the deploys; I review the previews on Vercel. Models don't do what you ask a good fraction of the time, so the part that matters is clicking through the output and catching what's subtly wrong.",
    tags: ["Claude Code", "Codex", "Tailscale", "Verification"],
    icon: Bot,
    artifact: "network",
  },
];
