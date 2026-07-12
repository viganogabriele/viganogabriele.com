import { m } from "framer-motion";
import { useMemo } from "react";
import { ScrollReveal } from "../motion/ScrollReveal";
import { useMotionProfile } from "../../hooks/useMotionProfile";

export function SectionHeader({ index, title, subtitle }: { index: string; title: string; subtitle?: string }) {
  const { level } = useMotionProfile();
  const disableMotion = level === "static";

  // Split by whitespace but preserve explicit newlines
  const words = useMemo(() => {
    return title.split(/(\s+)/).flatMap((chunk) =>
      chunk.split(/(\n)/).filter((w) => w.length > 0),
    );
  }, [title]);

  return (
    <ScrollReveal className="mb-12 md:mb-16">
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        <span>{index}</span>
        <span className="h-px w-10 bg-zinc-700" />
        <span className="section-anchor-label text-accent">GRID / {index}</span>
      </div>

      <div className="relative mt-4 overflow-hidden pb-2">
        {disableMotion ? (
          <h2 className="max-w-4xl whitespace-pre-line text-4xl font-medium tracking-[-0.06em] text-bone sm:text-5xl md:text-7xl">
            {title}
          </h2>
        ) : (
          <m.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
            }}
            className="max-w-4xl whitespace-pre-line text-4xl font-medium tracking-[-0.06em] text-bone sm:text-5xl md:text-7xl"
          >
            {words.map((word, i) =>
              word === "\n" ? (
                <br key={`br-${i}`} />
              ) : word.trim().length === 0 ? (
                <span key={`sp-${i}`}>{word}</span>
              ) : (
                <m.span
                  key={`w-${i}`}
                  className="inline-block will-change-transform"
                  variants={{
                    hidden: { opacity: 0, y: level === "lite" ? 16 : 24, filter: level === "lite" ? "none" : "blur(3px)" },
                    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                  }}
                >
                  {word}
                </m.span>
              ),
            )}
          </m.h2>
        )}

        {/* Underline sweep */}
        <m.span
          className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-accent/70 via-white/20 to-transparent"
          style={{ width: "100%", transformOrigin: "left" }}
          initial={disableMotion ? false : { scaleX: 0 }}
          whileInView={disableMotion ? undefined : { scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {subtitle && (
        <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">{subtitle}</p>
      )}
    </ScrollReveal>
  );
}
