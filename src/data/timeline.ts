import { Code2, Mic2, Network, Server } from "lucide-react";
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
    year: "CURRENT",
    title: "Politecnico di Milano",
    subtitle: "Computer engineering",
    description: "Turning theory into practical systems and better decisions.",
    icon: Code2,
    current: true,
  },
  {
    year: "09/2024 — PRESENT",
    title: "PoliNetwork",
    subtitle: "Product, leadership & operations",
    description: "Board Member & Treasurer, leading product direction, QA, operations, and cross-team execution.",
    icon: Network,
    current: true,
  },
  {
    year: "ONGOING",
    title: "Homelab Infrastructure",
    subtitle: "Reliability mindset",
    description: "Proxmox and TrueNAS with LXC containers, VMs, local redundancy, and encrypted cloud backup.",
    icon: Server,
  },
  {
    year: "ALWAYS",
    title: "Communication & leadership",
    subtitle: "Public speaking · people · clarity",
    description: "Making complex decisions clearer in Italian and English, on stage and across teams.",
    icon: Mic2,
  },
];
