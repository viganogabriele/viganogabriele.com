// Header copy and body prose for the home page sections. Everything a copy edit
// touches lives here with the rest of the content, so changing wording never
// means opening a component.

export interface SectionHeaderCopy {
  index: string;
  title: string;
  subtitle?: string;
}

export const aboutSection = {
  header: {
    index: "01 / ABOUT",
    title: "I learn it\nby running it.",
  } satisfies SectionHeaderCopy,
  body:
    "I keep 16TB of storage alive for six people who would notice inside an hour if it stopped. I write the specs and the bug reports for a student network of 500+ group chats, one per course and programme across a 45,000-student university. My desktop is Arch and Hyprland, picked against the default on purpose.",
  curiosity: {
    label: "Current curiosity",
    text: "Coding agents that run somewhere other than my laptop. Claude Code and Codex live on a VPS I reach over Tailscale; they open the pull requests, I review the previews.",
  },
  stats: [
    { value: "16TB", label: "of RAIDZ1 storage I keep alive for 6 people" },
    { value: "500+", label: "group chats in the network whose product I own" },
    { value: "1,000", label: "people at the freshman event I organised" },
    { value: "Education", label: "Computer Engineering at Politecnico di Milano", link: "https://www.polimi.it/en" },
  ] as Array<{ value: string; label: string; link?: string }>,
  principles: [
    "A rebuild that grows while it rebuilds never ships.",
    "The safest service is the one that isn’t listening.",
    "Verifying the output is the job.",
  ],
};

export const expertiseSection = {
  index: "02 / CAPABILITIES",
  title: "What I'm responsible for.",
  subtitle: "Five things I own, and the decisions that came with them.",
} satisfies SectionHeaderCopy;

export const projectsSection = {
  index: "03 / SELECTED WORK",
  title: "What I've built so far.",
} satisfies SectionHeaderCopy;

export const techStackSection = {
  index: "04 / TOOLKIT",
  title: "The workshop bench.",
  subtitle: "If it's on this list, I can defend it in an interview.",
} satisfies SectionHeaderCopy;

export const journeySection = {
  index: "05 / SYSTEM TRACE",
  title: "The trace, in order.",
  subtitle: "Four threads, three of them still open.",
} satisfies SectionHeaderCopy;

export const notesSection = {
  index: "06 / FIELD NOTES",
  title: "Notes from the build.",
  subtitle: "Four decisions I made and why, written short.",
} satisfies SectionHeaderCopy;

export const certificationsSection = {
  index: "07 / Recognition",
  title: "Credentials, lightly held.",
  // Sits beside the list, where the other sections put a subtitle.
  aside: "Worth listing, not worth leading with. The work above is the evidence.",
};

export const heroCopy = {
  summary: "I run my own infrastructure, and the product for 500+ student group chats.",
  portraitLabel: { idle: "PORTRAIT · ENTER SYS", active: "IDENTIFIED · TAP TO EXIT SYS" },
};

export const cvPageCopy = {
  eyebrow: "Document / CV",
  title: "Curriculum\nVitae.",
  summary: "One page, because a CV has to be one page. The detail it had to cut is on the rest of this site.",
  systemAside: {
    eyebrow: "SYS / trace available",
    text: "Every line on that page has a longer version. Here are three of them.",
    link: "Explore selected work",
  },
};

export const footerCopy = {
  eyebrow: "End of transmission / start a conversation",
  heading: "Write to me. I'll write back.",
};
