export interface NoteItem {
  slug: string;
  title: string;
  date: string;
  readingTime: string;
  preview: string;
  tags: string[];
  body: string[];
}

export const notes: NoteItem[] = [
  {
    slug: "event-operations-from-zero",
    title: "How I Organized Events Without Ever Doing It Before",
    date: "Apr 2026",
    readingTime: "7 min",
    preview: "The operating system I built while learning event operations on the fly.",
    tags: ["Events", "Operations", "Leadership"],
    body: [
      "When I started, I had zero event operations experience. So I treated it like an engineering problem: map constraints, define owners, and build repeatable checklists.",
      "The biggest win was creating clear workflows across teams before event day. That reduced chaos more than any last-minute fix could.",
      "Scaling from 150 to 1,000+ attendees taught me one thing: good operations are not loud; they are invisible when done right.",
    ],
  },
  {
    slug: "portfolio-vibe-coding-to-production",
    title: "How I Built This Website with Vibe Coding",
    date: "Mar 2026",
    readingTime: "6 min",
    preview: "From rough experiments to a polished experience: the process and trade-offs.",
    tags: ["Frontend", "UX", "Vibe coding"],
    body: [
      "This portfolio started fast: ideas first, polish later. The first versions were fun, but messy in architecture and performance.",
      "Then came the engineering pass: simplify flows, reduce visual noise, and keep only interactions that add real value.",
      "Vibe coding was the spark; disciplined iteration made it usable.",
    ],
  },
  {
    slug: "homelab-security-first",
    title: "Homelab: Security First",
    date: "Feb 2026",
    readingTime: "5 min",
    preview: "How I designed my self-hosted setup around recovery and defensive defaults.",
    tags: ["Homelab", "Security", "Infrastructure"],
    body: [
      "My rule is simple: no service is truly running if I cannot recover it quickly. Backups are part of design, not an afterthought.",
      "I use layered protection: local redundancy, replication to a second TrueNAS node, and encrypted cloud sync.",
      "Security-first does not mean paranoia; it means making safe choices the default path.",
    ],
  },
];

export const noteBySlug = new Map(notes.map((note) => [note.slug, note]));
