import { motion } from "framer-motion";
import { useMemo } from "react";
import { ScrollReveal } from "../motion/ScrollReveal";
import { useFeatureDetect } from "../../hooks/useFeatureDetect";
import { useReducedMotion } from "framer-motion";

export function SectionHeader({ index, title, subtitle }: { index: string; title: string; subtitle?: string }) {
  const reduced = useReducedMotion();
  const { isTouch, hasNoHover, isTelegramWebView, isCompact } = useFeatureDetect();
  const disableMotion = Boolean(reduced || isTouch || hasNoHover || isTelegramWebView || isCompact);

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
        <span className="section-anchor-label text-cyan-200">GRID / {index}</span>
        <span data-sys-reveal className="ml-auto text-fuchsia-300/70">
          NODE.OK · CHK 7F.31
        </span>
      </div>

      <div className="relative mt-4 overflow-hidden pb-2">
        {disableMotion ? (
          <h2 className="max-w-4xl whitespace-pre-line text-4xl font-medium tracking-[-0.06em] text-[#f2f3f5] sm:text-5xl md:text-7xl">
            {title}
          </h2>
        ) : (
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
            }}
            className="max-w-4xl whitespace-pre-line text-4xl font-medium tracking-[-0.06em] text-[#f2f3f5] sm:text-5xl md:text-7xl"
          >
            {words.map((word, i) =>
              word === "\n" ? (
                <br key={`br-${i}`} />
              ) : word.trim().length === 0 ? (
                <span key={`sp-${i}`}>{word}</span>
              ) : (
                <motion.span
                  key={`w-${i}`}
                  className="inline-block will-change-transform"
                  variants={{
                    hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
                    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                  }}
                >
                  {word}
                </motion.span>
              ),
            )}
          </motion.h2>
        )}

        {/* Underline sweep */}
        <motion.span
          className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-cyan-400/70 via-white/20 to-transparent"
          style={{ width: "100%", transformOrigin: "left" }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
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
