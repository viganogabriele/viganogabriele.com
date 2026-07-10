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
      "I turn fragmented requirements into clear paths, useful structure, and a consistent experience across tools.",
    tags: ["UX strategy", "Information architecture", "Product"],
    icon: Network,
    artifact: "network",
  },
  {
    index: "02",
    title: "Quality & Testing",
    role: "Design quality / bug hunting",
    description:
      "I look for the edge cases and small visual misses that separate a functional release from a finished one.",
    tags: ["QA", "UX review", "Debugging"],
    icon: CheckCircle2,
    artifact: "checklist",
  },
  {
    index: "03",
    title: "Event-Scale Operations",
    role: "Plans that hold under pressure",
    description:
      "I pair strategic planning with practical execution, helping event operations grow without becoming chaotic.",
    tags: ["Event ops", "Execution", "Governance"],
    icon: Orbit,
    artifact: "scale",
  },
  {
    index: "04",
    title: "Cross-Team Coordination",
    role: "People, process, momentum",
    description:
      "I align design, engineering, and operations so that capable people can move together with less friction.",
    tags: ["Leadership", "Delivery", "Teams"],
    icon: Users,
    artifact: "constellation",
  },
];
