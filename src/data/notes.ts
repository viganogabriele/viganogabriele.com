import { noteIndex } from "./noteIndex.ts";

const bodies = {
  "noticing-what-the-association-wasnt-using": [
    "My first event happened on my second day at Politecnico. I asked older PoliNetwork members whether I could run a meetup for incoming Computer Engineering students, put together an invite, and somewhere between 150 and 200 people showed up through Google Calendar RSVPs. What I took from it wasn't that I could pull a crowd. It was that the association had a whole dimension, events, that nobody was really touching.",
    "The next year I ran it wider, opening it to all freshmen and partnering with a pizzeria near Piazza Leonardo, and roughly a thousand people came. Lines down the street, the place full. It was still essentially a one-person operation on the organizing side, and that was the ceiling I'd hit: a thing that works once because I carried it isn't a thing that repeats.",
    "So I stopped running them alone. I built a team and ran two more that year, smaller by design at around 400 people each, but with structure underneath: a second venue partnership, and feedback collected systematically instead of judged by feel, so I had real numbers instead of a guess about whether it went well. I also built an ongoing partnership with University Network that got us a stand at their student festival, and I brought four other associations along with us. The honest tension through all of it was never a crisis to fix. It was the plainer discomfort of promoting something and not knowing if anyone would come, and the work was turning a thing that happened to work into a thing built to.",
  ],
  "the-prompt-was-never-the-hard-part": [
    "When I rebuilt my site I didn't type one prompt and accept whatever came back. I'd browse reference sites I liked, screenshot the specific things that worked, the layout, the motion, the type, and feed those screenshots to one model to get a careful description back. Then I'd take that description into a separate session to generate the actual build prompts. A pipeline of chained steps, each one narrowing the gap between a reference I could see and a prompt a model could act on.",
    "I built a first prototype a while ago and recently went back to push it toward the tier of site that gets featured rather than one that merely passes as a portfolio, running the same screenshot-to-description-to-prompt loop with a much higher bar for what I'd accept.",
    "The honest part is where the work actually lives. Models don't do what you ask a good fraction of the time, and what separates a decent result from a broken one is clicking through what came out and catching the things that are subtly wrong, far more than the wording of the prompt. That's the one opinion I'll defend here: writing the prompt is the cheap step, and verifying the output is the job. The stack was React with TypeScript, Vite and Framer Motion, but the stack is the least interesting thing about how the site got made.",
  ],
  "vpn-off-by-default": [
    "Remote access to my home network runs over a WireGuard tunnel, and my one firm decision about it was that it stays closed. A tunnel left running is an open door whether or not anyone is walking through it, so I don't leave it running. I toggle it from a small Telegram bot I wrote, which means the tunnel only exists as an attack surface for the few minutes I actually need it. It's a modest piece of engineering, but it changed how I think about exposure: the safest service is the one that isn't listening.",
    "Storage is a TrueNAS box, four 4TB drives with one disk of parity, so a dead drive means a degraded pool and a replacement rather than a restore from backup. A separate mini PC runs the things that shouldn't share fate with the storage: the printers, Home Assistant, and the bot that controls the VPN. I'm now building a second TrueNAS box to physically replicate the main pool. For now non-critical data just goes to encrypted cloud backup, because I don't yet keep anything sensitive enough to justify the cost of full local replication. That part matters to me. I'd rather size the redundancy to the actual data than build a mirror because a mirror looks serious.",
  ],
  "the-part-of-the-hackathon-we-got-wrong": [
    "StudyQuest was a 24-hour build: an AI study planner with spaced repetition and gamification, on React Native with Expo, the Gemini API, and Zustand for state. Four of us, and only one had done a hackathon before. We picked React Native even though our shared background was React on the web, so we knew going in it would cost us time on unfamiliar problems. I still think choosing it on purpose beat defaulting to what we already knew, and I'd defend the time we lost to it as tuition.",
    "The mistake that actually mattered was cheaper to avoid, and I made it anyway. We didn't read the challenge track closely enough, and the project drifted from the brief. Teams that stayed tight to the track scored better with less interesting builds than ours. That's the real lesson of a judged hackathon, and it's an uncomfortable one for anyone who likes building: the score rewards fit to the brief before it rewards the strongest thing you can make.",
    "What I held was the order of work, the timeline, and the conversations with the judges and with other teams. The others used AI freely on their own parts and I kept the shape of the thing. If I ran it again I'd spend the first hour re-reading the track out loud with the whole team before a line of code, because that hour was the cheapest leverage we had and we skipped it.",
  ],
} satisfies Record<(typeof noteIndex)[number]["slug"], string[]>;

export const notes = noteIndex.map((note) => ({ ...note, body: bodies[note.slug] }));
export type NoteItem = (typeof notes)[number];

export const noteBySlug = new Map<string, NoteItem>(notes.map((note) => [note.slug, note]));

// Mirrored in vercel.json's `redirects` so crawlers and no-JS requests get a
// real 301 instead of the client-side navigate() below serving a 404 shell.
export const legacySlugRedirects: Record<string, string> = {
  "homelab-security-first": "vpn-off-by-default",
  "portfolio-vibe-coding-to-production": "the-prompt-was-never-the-hard-part",
  "event-operations-from-zero": "noticing-what-the-association-wasnt-using",
};
