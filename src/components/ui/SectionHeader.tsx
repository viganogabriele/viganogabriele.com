import { m, useInView } from "framer-motion";
import { useMemo, useRef } from "react";
import { ease } from "../../lib/motion";
import { useMotionProfile } from "../../hooks/useMotionProfile";

export function SectionHeader({ index, title, subtitle }: { index: string; title: string; subtitle?: string }) {
  const { level } = useMotionProfile();
  const disableMotion = level === "static";
  const ref = useRef<HTMLDivElement>(null);
  // useInView + concrete `animate` targets: the reveal path that actually fires
  // in this app (plain `whileInView` / undefined animate never applies `initial`).
  const inView = useInView(ref, { once: true, margin: "-60px" });

  // Split by whitespace but preserve explicit newlines
  const words = useMemo(() => {
    return title.split(/(\s+)/).flatMap((chunk) =>
      chunk.split(/(\n)/).filter((w) => w.length > 0),
    );
  }, [title]);

  const wordHidden = { opacity: 0, y: level === "lite" ? 16 : 24, filter: level === "lite" ? "none" : "blur(3px)" };
  const wordShown = { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <div ref={ref} className="mb-12 md:mb-16">
      <m.div
        className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, ease: ease.softSettle }}
      >
        <span>{index}</span>
        <span className="h-px w-10 bg-zinc-700" />
        <span className="section-anchor-label text-accent">GRID / {index}</span>
      </m.div>

      <div className="relative mt-4 overflow-hidden pb-2">
        {disableMotion ? (
          // Reduced-motion: fade the whole title in on scroll (no per-word travel).
          <m.h2
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-4xl whitespace-pre-line text-4xl font-medium tracking-[-0.06em] text-bone sm:text-5xl md:text-7xl"
          >
            {title}
          </m.h2>
        ) : (
          <h2 className="max-w-4xl whitespace-pre-line text-4xl font-medium tracking-[-0.06em] text-bone sm:text-5xl md:text-7xl">
            {words.map((word, i) =>
              word === "\n" ? (
                <br key={`br-${i}`} />
              ) : word.trim().length === 0 ? (
                <span key={`sp-${i}`}>{word}</span>
              ) : (
                <m.span
                  key={`w-${i}`}
                  className="inline-block"
                  initial={wordHidden}
                  animate={inView ? wordShown : wordHidden}
                  transition={{ duration: 0.7, delay: i * 0.045, ease: [0.16, 1, 0.3, 1] }}
                >
                  {word}
                </m.span>
              ),
            )}
          </h2>
        )}

        {/* Underline sweep */}
        {!disableMotion && (
          <m.span
            className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-accent/70 via-white/20 to-transparent"
            style={{ width: "100%", transformOrigin: "left" }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </div>

      {subtitle && (
        <m.p
          className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.6, delay: 0.3, ease: ease.softSettle }}
        >
          {subtitle}
        </m.p>
      )}
    </div>
  );
}
