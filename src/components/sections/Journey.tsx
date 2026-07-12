import { m, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { timelineItems } from "../../data/timeline";
import { ease } from "../../lib/motion";
import { SectionHeader } from "../ui/SectionHeader";
import { useMotionProfile } from "../../hooks/useMotionProfile";

export function Journey() {
  const { level } = useMotionProfile();
  const staticMotion = level === "static";
  const railRef = useRef<HTMLDivElement>(null);

  // Use window-level scroll for reliable mobile tracking (native scroll on mobile
  // does not guarantee that target-based useScroll fires correctly when Lenis is
  // present, even with syncTouch: false).
  const { scrollY } = useScroll();
  const [scrollRange, setScrollRange] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    const measure = () => {
      if (!railRef.current) return;
      const rect = railRef.current.getBoundingClientRect();
      const pageTop = window.scrollY + rect.top;
      const pageBottom = window.scrollY + rect.bottom;
      const vh = window.innerHeight;
      // Start filling when the rail's top is 95% down the viewport;
      // finish when the rail's bottom is 15% from the top of the viewport.
      setScrollRange([pageTop - vh * 0.95, pageBottom - vh * 0.15]);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (railRef.current) observer.observe(railRef.current);
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("hashchange", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("hashchange", measure);
    };
  }, []);

  const fillScale = useTransform(scrollY, scrollRange, [0, 1]);
  const indicatorY = useTransform(scrollY, scrollRange, ["0%", "100%"]);

  return (
    <section id="journey" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10">
      <SectionHeader
        index="05 / SYSTEM TRACE"
        title="A path with branches."
        subtitle="A few live threads: what I’m learning, leading, and building next."
      />
      <div
        ref={railRef}
        data-journey-rail
        className="journey-rail relative ml-4 pl-[var(--journey-gutter)] [--journey-gutter:2rem] md:ml-[15%] md:[--journey-gutter:3rem]"
      >
        <span data-journey-axis aria-hidden className="pointer-events-none absolute left-0 top-0 h-full w-px -translate-x-1/2 bg-white/[0.1]" />
        {/* Scroll-driven fill on the timeline rail */}
        {!staticMotion && (
          <>
            <m.span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-blue via-accent to-violet"
              style={{ scaleY: fillScale, originY: 0 }}
            />
            <m.span
              aria-hidden
              data-journey-indicator
              className="pointer-events-none absolute left-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_85%,transparent)]"
              style={{ top: indicatorY }}
            />
          </>
        )}

        {timelineItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <m.article
              key={item.title}
              initial={staticMotion ? false : { opacity: 0, x: -14 }}
              whileInView={staticMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.55, delay: index * 0.07, ease: ease.softSettle }}
              className="relative pb-12 last:pb-0"
            >
              <span
                data-journey-node
                className={`absolute top-1 h-4 w-4 -translate-x-1/2 rounded-full border ${item.current ? "border-accent bg-accent/20 shadow-[0_0_0_5px_color-mix(in_srgb,var(--accent)_10%,transparent)]" : "border-zinc-600 bg-background"}`}
                style={{ left: "calc(var(--journey-gutter) * -1)" }}
              >
                {item.current && level === "full" && <span className="absolute inset-1 animate-ping rounded-full bg-accent/50 motion-reduce:animate-none" />}
              </span>
              <div className="grid gap-3 md:grid-cols-[9rem_1fr]">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600 md:mb-0">{item.year}</p>
                <div>
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-accent/75" />
                    <h3 className="text-2xl tracking-[-0.045em] text-zinc-100">{item.title}</h3>
                  </div>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-accent">{item.subtitle}</p>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">{item.description}</p>
                </div>
              </div>
            </m.article>
          );
        })}
      </div>
    </section>
  );
}
