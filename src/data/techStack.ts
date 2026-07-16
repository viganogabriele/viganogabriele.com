export interface ToolGroup {
  label: string;
  description: string;
  tools: readonly string[];
}

export const toolGroups: ToolGroup[] = [
  {
    label: "Frontend & web",
    description: "Interfaces, foundations, and implementation detail.",
    tools: ["JavaScript", "HTML", "CSS", "C"],
  },
  {
    label: "Infrastructure & self-hosting",
    description: "Systems I run, maintain, and learn from directly.",
    tools: ["Linux", "Proxmox", "TrueNAS", "Git"],
  },
  {
    label: "Product & collaboration",
    description: "Tools for design, decisions, and clear handoffs.",
    tools: ["Figma", "Notion", "Excel", "Photoshop"],
  },
  {
    label: "AI-assisted workflows",
    description: "Coding agents, orchestration, automation, and verification in practice.",
    tools: ["Codex", "Claude Code", "OpenClaw (self-hosted)", "Agent workflows"],
  },
];
