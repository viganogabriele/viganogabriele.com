export interface ToolGroup {
  label: string;
  description: string;
  tools: readonly string[];
}

export const toolGroups: ToolGroup[] = [
  {
    label: "Code & markup",
    description: "C from the coursework, HTML and CSS from building things with them. JavaScript is what I'm adding now.",
    tools: ["C", "HTML", "CSS", "JavaScript (in progress)"],
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
    description: "I pay for and use all three assistants; prompt design is the practice around them. Mostly they act as a tutor that explains and refactors, not a vending machine for code.",
    tools: ["Claude Code", "Codex", "Gemini", "Prompt design"],
  },
];
