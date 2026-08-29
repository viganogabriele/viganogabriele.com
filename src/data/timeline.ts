import { Code2, GraduationCap, Network, Server } from "lucide-react";
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
    year: "12/2025 – PRESENT",
    title: "Homelab Infrastructure",
    subtitle: "Two machines and a VPS",
    description: "Built for my family, which is what makes the redundancy boring and the attack surface small on purpose.",
    icon: Server,
    current: true,
  },
  {
    year: "09/2024 – PRESENT",
    title: "Politecnico di Milano",
    subtitle: "B.Sc. Computer engineering",
    description: "The coursework is C and systems. Everything past that I've picked up because something already running needed it.",
    icon: Code2,
    current: true,
  },
  {
    year: "08/2024 – PRESENT",
    title: "PoliNetwork",
    subtitle: "Board member & treasurer",
    description: "The members' assembly elected me in November of my first year, when most of the board were master's students with years in the network behind them.",
    icon: Network,
    current: true,
  },
  {
    year: "07/2022 – 09/2024",
    title: "Private tutoring, Modena",
    subtitle: "C & computer fundamentals",
    description: "Three students, while I was in secondary school myself. All three passed. Years of building computers made explaining how they fit together the easy part.",
    icon: GraduationCap,
  },
];
