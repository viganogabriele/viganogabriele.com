export interface NoteItem {
  slug: string;
  title: string;
  date: string;
  datePublished: string;
  readingTime: string;
  preview: string;
  tags: string[];
  body: string[];
}

export const notes: NoteItem[] = [
  {
    slug: "noticing-what-the-association-wasnt-using",
    title: "Noticing What the Association Wasn't Using",
    date: "Apr 2026",
    datePublished: "2026-04-01",
    readingTime: "3 min",
    preview:
      "From 150 people on day two to a thousand on the street. What I built after I hit the ceiling of carrying an event alone.",
    tags: ["Events", "Operations", "Leadership"],
    body: [
      "My first event happened on my second day at Politecnico. I asked older PoliNetwork members whether I could run a meetup for incoming Computer Engineering students, put together an invite, and somewhere between 150 and 200 people showed up through Google Calendar RSVPs. What I took from it wasn't that I could pull a crowd. It was that the association had a whole dimension, events, that nobody was really touching.",
      "The next year I ran it wider, opening it to all freshmen and partnering with a bar near Piazza Leonardo, and roughly a thousand people came. Lines down the street, the place full. It was still essentially a one-person operation on the organizing side, and that was the ceiling I'd hit: a thing that works once because I carried it isn't a thing that repeats.",
      "So I stopped running them alone. I built a team and ran two more that year, smaller by design at around 400 people each, but with structure underneath: a second venue partnership, and feedback collected systematically instead of judged by feel, so I had real numbers instead of a guess about whether it went well. I also built an ongoing partnership with University Network that got us a stand at their student festival, and I brought four other associations along with us. The honest tension through all of it was never a crisis to fix. It was the plainer discomfort of promoting something and not knowing if anyone would come, and the work was turning a thing that happened to work into a thing built to.",
    ],
  },
  {
    slug: "the-prompt-was-never-the-hard-part",
    title: "The Prompt Was Never the Hard Part",
    date: "Mar 2026",
    datePublished: "2026-03-01",
    readingTime: "3 min",
    preview:
      "The screenshot-to-description-to-prompt pipeline I used to build this site, and why verifying the output is the real job.",
    tags: ["Frontend", "AI", "Process"],
    body: [
      "When I rebuilt my site I didn't type one prompt and accept whatever came back. I'd browse reference sites I liked, screenshot the specific things that worked, the layout, the motion, the type, and feed those screenshots to one model to get a careful description back. Then I'd take that description into a separate session to generate the actual build prompts. A pipeline of chained steps, each one narrowing the gap between a reference I could see and a prompt a model could act on.",
      "I built a first prototype a while ago and recently went back to push it toward the tier of site that gets featured rather than one that merely passes as a portfolio, running the same screenshot-to-description-to-prompt loop with a much higher bar for what I'd accept.",
      "The honest part is where the work actually lives. Models don't do what you ask a good fraction of the time, and what separates a decent result from a broken one is clicking through what came out and catching the things that are subtly wrong, far more than the wording of the prompt. That's the one opinion I'll defend here: writing the prompt is the cheap step, and verifying the output is the job. The stack was React with TypeScript, Vite and Framer Motion, but the stack is the least interesting thing about how the site got made.",
    ],
  },
  {
    slug: "vpn-off-by-default",
    title: "Why My Home VPN Is Off by Default",
    date: "Feb 2026",
    datePublished: "2026-02-01",
    readingTime: "2 min",
    preview:
      "A tunnel left running is an open door. Why I built a Telegram bot to keep my WireGuard VPN closed until the moment I need it.",
    tags: ["Homelab", "Security", "Infrastructure"],
    body: [
      "Remote access to my home network runs over a WireGuard tunnel, and my one firm decision about it was that it stays closed. A tunnel left running is an open door whether or not anyone is walking through it, so I don't leave it running. I toggle it from a small Telegram bot I wrote, which means the tunnel only exists as an attack surface for the few minutes I actually need it. It's a modest piece of engineering, but it changed how I think about exposure: the safest service is the one that isn't listening.",
      "Storage is a TrueNAS box, four 4TB drives in a parity setup so a single drive failure costs me nothing. A separate mini PC runs the things that shouldn't share fate with the storage: printers, a handful of Telegram bots, including the one that controls the VPN. I'm now building a second TrueNAS box to physically replicate the main pool. For now non-critical data just goes to encrypted cloud backup, because I don't yet keep anything sensitive enough to justify the cost of full local replication. That part matters to me. I'd rather size the redundancy to the actual data than build a mirror because a mirror looks serious.",
    ],
  },
  {
    slug: "the-part-of-the-hackathon-we-got-wrong",
    title: "The Part of the Hackathon We Got Wrong",
    date: "Jan 2026",
    datePublished: "2026-01-01",
    readingTime: "3 min",
    preview:
      "We built something better than the teams that beat us. What I learned from losing a judged hackathon while building the more interesting product.",
    tags: ["Hackathon", "AI", "Team"],
    body: [
      "StudyQuest was a 24-hour build: an AI study planner with spaced repetition and gamification, on React Native with Expo, the Gemini API, and Zustand for state. Four of us, and only one had done a hackathon before. We picked React Native even though our shared background was React on the web, so we knew going in it would cost us time on unfamiliar problems. I still think choosing it on purpose beat defaulting to what we already knew, and I'd defend the time we lost to it as tuition.",
      "The mistake that actually mattered was cheaper to avoid, and I made it anyway. We didn't read the challenge track closely enough, and the project drifted from the brief. Teams that stayed tight to the track scored better with less interesting builds than ours. That's the real lesson of a judged hackathon, and it's an uncomfortable one for anyone who likes building: the score rewards fit to the brief before it rewards the strongest thing you can make.",
      "My own role wasn't writing the code. I wrote less of it than anyone and let the others use AI freely on their parts. What I held was the order of work, the timeline, and the conversations with the judges and with other teams. I'd rather say that plainly than call it full-stack. If I ran it again I'd spend the first hour re-reading the track out loud with the whole team before a line of code, because that hour was the cheapest leverage we had and we skipped it.",
    ],
  },
];

export const noteBySlug = new Map(notes.map((note) => [note.slug, note]));
