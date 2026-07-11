import { Boxes, BrainCircuit, Code2, GitMerge, Globe, HardDrive, Palette, Server, Smartphone, Terminal } from "lucide-react";
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
  { label: "TypeScript", icon: Code2, color: "#7FE7FF", x: 215, y: 130 },
  { label: "React", icon: Boxes, color: "#61DAFB", x: 330, y: 90 },
  { label: "HTML", icon: Globe, color: "#E44D26", x: 300, y: 150 },
  { label: "CSS", icon: Palette, color: "#7FE7FF", x: 500, y: 120 },
  { label: "C", icon: Terminal, color: "#a8b9cc", x: 200, y: 250 },
  { label: "Git", icon: GitMerge, color: "#F05032", x: 450, y: 280 },
  { label: "Linux", icon: Terminal, color: "#fcc624", x: 650, y: 180 },
  { label: "Proxmox", icon: Server, color: "#E57000", x: 350, y: 80 },
  { label: "TrueNAS", icon: HardDrive, color: "#0095D5", x: 600, y: 250 },
  { label: "React Native", icon: Smartphone, color: "#8be9fd", x: 170, y: 210 },
  { label: "Gemini API", icon: BrainCircuit, color: "#a78bfa", x: 520, y: 220 },
];

export const toolGroups = [
  { label: "Development", tools: ["JavaScript", "TypeScript", "React", "Vite", "Framer Motion", "React Native", "Expo", "Zustand", "Gemini API", "HTML", "CSS", "C"] },
  { label: "Infrastructure", tools: ["Git", "Linux", "Proxmox", "TrueNAS", "LXC", "Virtual machines"] },
  { label: "Design", tools: ["Figma", "Canva", "Photoshop"] },
  { label: "Productivity", tools: ["Notion", "Excel", "Word", "PowerPoint"] },
] as const;

export const secondaryTools = ["Figma", "Canva", "Photoshop", "Notion", "Excel", "PowerPoint"];
