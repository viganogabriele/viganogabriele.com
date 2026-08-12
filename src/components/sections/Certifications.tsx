import { certifications } from "../../data/certifications";
import { certificationsSection } from "../../data/sections";
import { FadeIn } from "../motion/FadeIn";
import { CertRow } from "../ui/CertRow";
import { SectionHeader } from "../ui/SectionHeader";

export function Certifications() {
  return (
    <section id="certifications" className="relative mx-auto mt-32 max-w-7xl px-5 sm:px-8 lg:mt-40 lg:px-10">
      {/* Header shaped like every other section: index, title, then the line
          under it — it used to sit in a column beside the list instead. */}
      <SectionHeader
        index={certificationsSection.index}
        title={certificationsSection.title}
        subtitle={certificationsSection.subtitle}
      />
      <div className="cert-list border-t border-white/[0.08]">
        {certifications.map((certification, index) => (
          <FadeIn key={certification.title} delay={index * 0.08}>
            <CertRow certification={certification} index={index} />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
