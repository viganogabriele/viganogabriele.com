import { m, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { timelineItems } from "../../data/timeline";
import { ease } from "../../lib/motion";
import { onViewportWidthChange } from "../../lib/viewport";
import { SectionHeader } from "../ui/SectionHeader";
import { useMotionProfile } from "../../hooks/useMotionProfile";

type TimelineItem = typeof timelineItems[number];

function JourneyItem({
  item,
  index,
  staticMotion,
  level,
}: {
  item: TimelineItem;
  index: number;
  staticMotion: boolean;
  level: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  const Icon = item.icon;

  return (
    <article
      ref={ref as never}
      className="relative pb-12 last:pb-0"
    >
      <span
        data-journey-node
        className={`absolute top-1 h-4 w-4 -translate-x-1/2 rounded-full border ${item.current ? "border-accent bg-accent/20 shadow-[0_0_0_5px_color-mix(in_srgb,var(--accent)_10%,transparent)]" : "border-zinc-600 bg-background"}`}
        style={{ left: "calc(var(--journey-gutter) * -1)" }}
      >
        {item.current && level === "full" && <span className="absolute inset-1 animate-ping rounded-full bg-accent/50 motion-reduce:animate-none" />}
      </span>
      <m.div
        className="grid gap-3 md:grid-cols-[9rem_1fr]"
        initial={staticMotion ? false : { opacity: 0, x: -14 }}
        animate={staticMotion ? undefined : inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }}
        transition={{ duration: 0.55, delay: index * 0.07, ease: ease.softSettle }}
      >
        <m.p
          className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600 md:mb-0"
          initial={staticMotion ? false : { opacity: 0, y: 8 }}
          animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.45, delay: index * 0.07 + 0.15, ease: ease.softSettle }}
        >
          {item.year}
        </m.p>
        <m.div
          initial={staticMotion ? false : { opacity: 0, y: 8 }}
          animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.45, delay: index * 0.07 + 0.22, ease: ease.softSettle }}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-accent/75" />
            <h3 className="text-2xl tracking-[-0.045em] text-zinc-100">{item.title}</h3>
          </div>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-accent">{item.subtitle}</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">{item.description}</p>
        </m.div>
      </m.div>
    </article>
  );
}

export function Journey() {
  const { level } = useMotionProfile();
  const staticMotion = level === "static";
  const railRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const [scrollRange, setScrollRange] = useState<[number, number]>([0, 1]);
  const [railHeight, setRailHeight] = useState(0);

  useEffect(() => {
    // Reading innerHeight live on every resize would remap this rail's whole
    // scroll range mid-scroll whenever the mobile URL bar collapses/expands
    // (see lib/viewport.ts), snapping both the fill and the indicator to a
    // new position. Pin the height to the last real viewport change so the
    // mapping stays stable while scrolling.
    let viewportHeight = window.innerHeight;
    const measure = () => {
      if (!railRef.current) return;
      const rect = railRef.current.getBoundingClientRect();
      const pageTop = window.scrollY + rect.top;
      const pageBottom = window.scrollY + rect.bottom;
      const vh = viewportHeight;
      const nextStart = pageTop - vh * 0.95;
      const nextEnd = pageBottom - vh * 0.15;
      setScrollRange((current) => current[0] === nextStart && current[1] === nextEnd ? current : [nextStart, nextEnd]);
      setRailHeight(rect.height);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (railRef.current) observer.observe(railRef.current);
    const removeResizeListener = onViewportWidthChange(() => {
      viewportHeight = window.innerHeight;
      measure();
    });
    window.addEventListener("hashchange", measure);
    return () => {
      observer.disconnect();
      removeResizeListener();
      window.removeEventListener("hashchange", measure);
    };
  }, []);

  const fillScale = useTransform(scrollY, scrollRange, [0, 1]);
  // translateY in px (not `top` in %) — `top` is layout-triggering and was
  // forcing a reflow on every scroll frame for as long as this page has a
  // rail on screen. -4 offsets by half the dot's own height (h-2 = 8px) to
  // replicate the centering the old -translate-y-1/2 utility class gave it.
  const indicatorY = useTransform(scrollY, scrollRange, [-4, railHeight - 4]);

  return (
    <section id="journey" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10">
      <SectionHeader
        index="04 / EXPERIENCE"
        title="Experience."
        subtitle="What I’m learning, leading, and building now."
      />
      <div
        ref={railRef}
        data-journey-rail
        className="journey-rail relative ml-4 pl-[var(--journey-gutter)] [--journey-axis-x:0px] [--journey-gutter:2rem] md:ml-[15%] md:[--journey-gutter:3rem]"
      >
        <span data-journey-axis aria-hidden className="pointer-events-none absolute top-0 h-full w-px -translate-x-1/2 bg-white/[0.1]" style={{ left: "var(--journey-axis-x)" }} />
        {!staticMotion && (
          <>
            <m.span
              aria-hidden
              className="pointer-events-none absolute top-0 h-full w-px -translate-x-1/2 bg-accent/70"
              style={{ left: "var(--journey-axis-x)", scaleY: fillScale, originY: 0 }}
            />
            <m.span
              aria-hidden
              data-journey-indicator
              className="pointer-events-none absolute top-0 h-2 w-2 rounded-full bg-accent"
              style={{ left: "var(--journey-axis-x)", x: "-50%", y: indicatorY }}
            />
          </>
        )}

        {timelineItems.map((item, index) => (
          <JourneyItem
            key={item.title}
            item={item}
            index={index}
            staticMotion={staticMotion}
            level={level}
          />
        ))}
      </div>
    </section>
  );
}
