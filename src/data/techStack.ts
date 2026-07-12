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
  { label: "HTML", icon: Globe, color: "#E44D26", x: 280, y: 80 },
  { label: "CSS", icon: Palette, color: "#7FE7FF", x: 460, y: 120 },
  { label: "C", icon: Terminal, color: "#a8b9cc", x: 200, y: 220 },
  { label: "Git", icon: GitMerge, color: "#F05032", x: 390, y: 230 },
  { label: "Linux", icon: Terminal, color: "#fcc624", x: 580, y: 160 },
  { label: "Proxmox", icon: Server, color: "#E57000", x: 150, y: 160 },
  { label: "TrueNAS", icon: HardDrive, color: "#0095D5", x: 520, y: 260 },
];

export const toolGroups = [
  { label: "Development", tools: ["JavaScript", "HTML", "CSS", "C"] },
  { label: "Infrastructure", tools: ["Git", "Linux", "Proxmox", "TrueNAS"] },
  { label: "Design", tools: ["Figma", "Canva", "Photoshop"] },
  { label: "Productivity", tools: ["Notion", "Excel", "Word", "PowerPoint"] },
] as const;

export const secondaryTools = ["Figma", "Canva", "Photoshop", "Notion", "Excel", "PowerPoint"];

export const toolHeat = new Set(["JavaScript", "HTML", "CSS", "Git", "Linux", "Figma", "Notion"]);
