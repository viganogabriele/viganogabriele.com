import { m } from "framer-motion";
import { certifications } from "../../data/certifications";
import { ease } from "../../lib/motion";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { FadeIn } from "../motion/FadeIn";
import { ScrollReveal } from "../motion/ScrollReveal";
import { CertRow } from "../ui/CertRow";

export function Certifications() {
  const { level } = useMotionProfile();
  const disableMotion = level === "static";

  return (
    <section id="certifications" className="relative mx-auto mt-32 max-w-7xl px-5 sm:px-8 lg:mt-40 lg:px-10">
      <div className="grid gap-5 border-y border-white/[0.08] py-5 md:grid-cols-[.8fr_1.2fr]">
        <ScrollReveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">07 / Recognition</p>
          <m.h2
            initial={disableMotion ? false : { opacity: 0, y: 14 }}
            whileInView={disableMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: ease.cinematic }}
            className="mt-2 text-2xl tracking-[-0.04em] text-zinc-200"
          >
            Credentials, lightly held.
          </m.h2>
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
