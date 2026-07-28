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
    description: "TrueNAS, 4x4TB in RAIDZ1, scrubbed on a schedule and backed up encrypted off-site for 6 users. Proxmox runs the rest in LXC, including a WireGuard container that stays stopped until a Telegram bot starts it.",
    icon: Server,
    current: true,
  },
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
    subtitle: "Board member & treasurer",
    description: "Joined as a community admin in my first weeks. The members' assembly elected me to the 7-person board that November, when most of the board were master's students. Product, QA and the books are mine.",
    icon: Network,
    current: true,
  },
  {
    year: "07/2022 – 09/2024",
    title: "Private tutoring, Modena",
    subtitle: "C & computer fundamentals",
    description: "Paid to teach three secondary school students, around 30 hours, while I was still in secondary school myself. All three passed. Explaining how a computer goes together was easy: I'd been assembling them.",
    icon: GraduationCap,
  },
];
