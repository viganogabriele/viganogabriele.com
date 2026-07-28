export interface ToolGroup {
  label: string;
  description: string;
  tools: readonly string[];
}

export const toolGroups: ToolGroup[] = [
  {
    label: "Code & markup",
    description: "C at the level the coursework has taken me. JavaScript is in progress, and it goes on this list properly once there's a project of mine behind it.",
    tools: ["C", "HTML", "CSS", "JavaScript (learning)"],
  },
  {
    label: "Infrastructure & self-hosting",
    description: "Two machines at home plus a cloud VPS, tied together over Tailscale. Six people keep their data on the storage, so downtime is a family problem.",
    tools: ["Linux", "Proxmox", "TrueNAS / ZFS", "WireGuard"],
  },
  {
    label: "Product & collaboration",
    description: "Every design output for the rebuild gets reviewed and edited by me directly in Figma. The rest is where specs, budgets and assets get made.",
    tools: ["Figma", "Notion", "Excel", "Photoshop"],
  },
  {
    label: "AI-assisted workflows",
    description: "I pay for all three and use all three, mostly as a tutor that explains and refactors rather than a vending machine for code.",
    tools: ["Claude Code", "Codex", "Gemini", "Prompt design"],
  },
];
