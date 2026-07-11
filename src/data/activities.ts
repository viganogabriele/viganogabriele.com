import { CheckCircle2, Network, Orbit, Users } from "lucide-react";
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
    role: "PoliNetwork web ecosystem",
    description:
      "I led a full platform redesign, defining information architecture and user flows to connect existing services into a coherent product.",
    tags: ["UX strategy", "Information architecture", "Product"],
    icon: Network,
    artifact: "network",
  },
  {
    index: "02",
    title: "Quality & Testing",
    role: "Design quality / bug hunting",
    description:
      "I own end-to-end QA across web, bot, and internal tools: finding edge cases, specifying fixes, and tracking them through release.",
    tags: ["QA", "UX review", "Debugging"],
    icon: CheckCircle2,
    artifact: "checklist",
  },
  {
    index: "03",
    title: "Event-Scale Operations",
    role: "Plans that hold under pressure",
    description:
      "I build event operations from scratch: planning, logistics, on-site execution, and structured feedback at every edition.",
    tags: ["Event ops", "Execution", "Governance"],
    icon: Orbit,
    artifact: "scale",
  },
  {
    index: "04",
    title: "Cross-Team Coordination",
    role: "People, process, momentum",
    description:
      "I build lean high-output teams from scratch: multi-stage interviews, appointed leads, and coaching toward autonomous delivery.",
    tags: ["Leadership", "Delivery", "Teams"],
    icon: Users,
    artifact: "constellation",
  },
];
