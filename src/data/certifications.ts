import { Award, Mic2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Certification {
  title: string;
  issuer: string;
  year: string;
  link: string;
  icon: LucideIcon;
}

export const certifications: Certification[] = [
  {
    title: "Leadership",
    issuer: "Learnn",
    year: "2025",
    link: "https://learnn.com/v/9813f284-0595-4463-b5cc-a6052a7c072d/",
    icon: Award,
  },
  {
    title: "Public Speaking",
    issuer: "Learnn",
    year: "2025",
    link: "https://learnn.com/v/1552498e-33d6-44be-be8c-0b462876c6e1/",
    icon: Mic2,
  },
];
