import { certifications } from "../../data/certifications";
import { certificationsSection } from "../../data/sections";
import { FadeIn } from "../motion/FadeIn";
import { ScrollReveal } from "../motion/ScrollReveal";
import { CertRow } from "../ui/CertRow";
import { SectionHeader } from "../ui/SectionHeader";

export function Certifications() {
  return (
    <section id="certifications" className="relative mx-auto mt-32 max-w-7xl px-5 sm:px-8 lg:mt-40 lg:px-10">
      <SectionHeader index={certificationsSection.index} title={certificationsSection.title} />
      <div className="grid gap-5 border-y border-white/[0.08] py-5 md:grid-cols-[.8fr_1.2fr]">
        <ScrollReveal>
          <p className="max-w-xs font-mono text-[10px] uppercase leading-relaxed tracking-[0.15em] text-zinc-500">
            {certificationsSection.aside}
          </p>
        </ScrollReveal>
        <div className="cert-row">
          {certifications.map((certification, index) => (
            <FadeIn key={certification.title} delay={index * 0.08}>
              <CertRow certification={certification} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
