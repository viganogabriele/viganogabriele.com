import { Code2, Cpu, Network, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TimelineItem {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  current?: boolean;
}

export const timelineItems: TimelineItem[] = [
  {
    year: "NOW",
    title: "Politecnico di Milano",
    subtitle: "Computer engineering",
    description: "Turning theory into practical systems and better decisions.",
    icon: Code2,
    current: true,
  },
  {
    year: "CURRENT",
    title: "PoliNetwork",
    subtitle: "Product, leadership & operations",
    description: "Coordinating product direction, operations, and team execution.",
    icon: Network,
    current: true,
  },
  {
    year: "BUILDER MODE",
    title: "Homelab Infrastructure",
    subtitle: "Reliability mindset",
    description: "A self-hosted environment where recovery and maintainability matter.",
    icon: Server,
  },
  {
    year: "ALWAYS",
    title: "Teaching & communication",
    subtitle: "C, algorithms & public speaking",
    description: "Making complex concepts clearer and more useful to other people.",
    icon: Cpu,
  },
];
