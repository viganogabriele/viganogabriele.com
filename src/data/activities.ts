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
      "I led the platform redesign for a 45,000+ student community, connecting existing services through clearer information architecture and user flows.",
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
      "I pair planning with practical execution for community events with up to 1,000+ attendees and structured feedback at every edition.",
    tags: ["Event ops", "Execution", "Governance"],
    icon: Orbit,
    artifact: "scale",
  },
  {
    index: "04",
    title: "Cross-Team Coordination",
    role: "People, process, momentum",
    description:
      "I recruited 30+ volunteers across five teams, appointed leads, and built a multi-stage interview process in Italian and English.",
    tags: ["Leadership", "Delivery", "Teams"],
    icon: Users,
    artifact: "constellation",
  },
];
