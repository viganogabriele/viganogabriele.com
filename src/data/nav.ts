// Ordered to match the sections as they actually appear on the page; CV links
// to its own route.
//
// `sections` is what the navbar's scroll spy tracks, and it has to name every
// section on the home page — not only the ones with an entry of their own.
// Expertise, Notes and Certifications were tracked by nobody, so across those
// stretches the probe matched nothing, no entry ever updated, and the
// highlight stayed on whatever had been correct before. Each unlisted section
// now belongs to the entry a reader would say they are in.
export interface NavItem {
  label: string;
  href: string;
  sections?: string[];
}

export const navItems: NavItem[] = [
  { label: "Profile", href: "#about", sections: ["about", "expertise"] },
  { label: "Projects", href: "#projects", sections: ["projects"] },
  { label: "Skills", href: "#stack", sections: ["stack"] },
  { label: "Experience", href: "#journey", sections: ["journey"] },
  { label: "Notes", href: "#notes", sections: ["notes", "certifications"] },
  { label: "CV", href: "/cv" },
];
