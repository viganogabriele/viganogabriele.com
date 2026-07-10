import { Code2, GitMerge, Globe, HardDrive, Palette, Server, Terminal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TechSkill {
  label: string;
  icon: LucideIcon;
  color: string;
  x: number;
  y: number;
}

export const techSkills: TechSkill[] = [
  { label: "JavaScript", icon: Code2, color: "#F7DF1E", x: 100, y: 100 },
  { label: "HTML", icon: Globe, color: "#E44D26", x: 300, y: 150 },
  { label: "CSS", icon: Palette, color: "#7FE7FF", x: 500, y: 120 },
  { label: "C", icon: Terminal, color: "#a8b9cc", x: 200, y: 250 },
  { label: "Git", icon: GitMerge, color: "#F05032", x: 450, y: 280 },
  { label: "Linux", icon: Terminal, color: "#fcc624", x: 650, y: 180 },
  { label: "Proxmox", icon: Server, color: "#E57000", x: 350, y: 80 },
  { label: "TrueNAS", icon: HardDrive, color: "#0095D5", x: 600, y: 250 },
];

export const secondaryTools = ["Figma", "Canva", "Photoshop", "Notion", "Excel", "PowerPoint"];
