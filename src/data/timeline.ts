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
    year: "09/2024 – 2028",
    title: "Politecnico di Milano",
    subtitle: "B.Sc. Computer engineering",
    description: "C and computer science fundamentals, computer architecture and operating systems, communications and internet. Graduation expected 2028.",
    icon: Code2,
    current: true,
  },
  {
    year: "08/2024 – PRESENT",
    title: "PoliNetwork",
    subtitle: "Product, QA & treasury",
    description: "Community admin from August 2024. The members' assembly elected me to the 7-person board that November, in my first year. Product, QA and the books are mine.",
    icon: Network,
    current: true,
  },
  {
    year: "12/2025 – PRESENT",
    title: "Homelab Infrastructure",
    subtitle: "Two machines and a VPS",
    description: "TrueNAS, 4x4TB in RAIDZ1, scrubbed on a schedule and backed up encrypted off-site for 6 users. Proxmox runs the rest in LXC, including a WireGuard container that stays stopped until a Telegram bot starts it.",
    icon: Server,
  },
  {
    year: "ALWAYS",
    title: "Communication & leadership",
    subtitle: "Assembly chair · hiring · budget",
    description: "I chair the members' assembly of 40 people, run hiring interviews in Italian and English, and take the annual budget through a board and an assembly for approval.",
    icon: Mic2,
  },
];
