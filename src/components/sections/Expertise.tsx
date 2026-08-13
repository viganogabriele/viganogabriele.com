import { m, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { activities } from "../../data/activities";
import { expertiseSection } from "../../data/sections";
import { dur, ease } from "../../lib/motion";
import { ArtifactSVG } from "../ui/ArtifactSVG";
import { SectionHeader } from "../ui/SectionHeader";
import { useMotionProfile } from "../../hooks/useMotionProfile";

type ActivityItem = typeof activities[number];

function ExpertiseItem({
  activity,
  index,
  activeIndex,
  staticMotion,
  onActivate,
  onDeactivate,
}: {
  activity: ActivityItem;
  index: number;
  activeIndex: number;
  staticMotion: boolean;
  onActivate: (index: number) => void;
  onDeactivate: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const Icon = activity.icon;

  return (
    <m.article
      ref={ref as never}
      data-index={index}
      data-active={activeIndex === index}
      initial={staticMotion ? false : { opacity: 0, y: 20 }}
      animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: dur.reveal, delay: index * 0.05, ease: ease.cinematic }}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") onActivate(index); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") onDeactivate(); }}
      className={`expertise-item group grid gap-5 py-8 md:grid-cols-[auto_1fr_11rem] md:gap-7 md:py-10 ${activeIndex === index ? "is-focused" : ""}`}
    >
      <span aria-hidden className="expertise-dot absolute" />
      <div className="flex gap-3">
        <span className="font-mono text-[10px] text-zinc-600">{activity.index}</span>
        <Icon className="h-4 w-4 text-accent/75" />
      </div>
      <div>
        <m.p
          className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400"
          initial={staticMotion ? false : { opacity: 0, y: 8 }}
          animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.4, delay: 0.05, ease: ease.softSettle }}
        >
          {activity.role}
        </m.p>
        <m.h3
          className="mt-2 text-2xl tracking-[-0.05em] text-bone md:text-3xl"
          initial={staticMotion ? false : { opacity: 0, y: 10 }}
          animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.12, ease: ease.softSettle }}
        >
          {activity.title}
        </m.h3>
        <m.p
          className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400"
          initial={staticMotion ? false : { opacity: 0, y: 8 }}
          animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.45, delay: 0.2, ease: ease.softSettle }}
        >
          {activity.description}
        </m.p>
        <m.div
          className="mt-5 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[9px] uppercase tracking-[0.1em] text-zinc-600"
          initial={staticMotion ? false : { opacity: 0 }}
          animate={staticMotion ? undefined : inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.28, ease: ease.softSettle }}
        >
          {activity.tags.map((tag) => <span key={tag}>/{tag}</span>)}
        </m.div>
      </div>
      <div className="capability-artifact" data-capability-artifact={activity.artifact}>
        <ArtifactSVG
          type={activity.artifact}
          className="relative z-[1] h-24 w-full text-accent/45 transition-colors duration-500 group-hover:text-accent/90 md:h-28"
        />
      </div>
    </m.article>
  );
}

export function Expertise() {
  const { level } = useMotionProfile();
  const staticMotion = level === "static";
  const [autoIndex, setAutoIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const activeIndex = hoveredIndex ?? autoIndex;

  // Five rows of schematic artifacts loop continuously — floating cards,
  // flowing dash patterns, pulsing nodes, a scanning row highlight. Those are
  // SVG stroke and background repaints, not compositor work, and they used to
  // run for the whole life of the page whether or not the section was anywhere
  // near the viewport. `data-inview` parks all of them in CSS.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Keep both the rail and its sticky readout tied to what the visitor is
  // actually reading. The previous 2.25s interval advanced independently of
  // scrolling, so the highlighted legend and visible row could disagree for
  // a full cycle. One passive listener queues at most one layout read per
  // frame, and it is only active while this section intersects the viewport.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const rows = Array.from(section.querySelectorAll<HTMLElement>("[data-index]"));
    let frame: number | null = null;

    const syncToScroll = () => {
      frame = null;
      const sectionRect = section.getBoundingClientRect();
      if (sectionRect.bottom <= 0 || sectionRect.top >= window.innerHeight) return;

      const readingLine = Math.min(Math.max(window.innerHeight * 0.46, 150), window.innerHeight - 120);
      let nextIndex = 0;
      let closestDistance = Infinity;
      for (const row of rows) {
        const rect = row.getBoundingClientRect();
        const distance = rect.top <= readingLine && rect.bottom >= readingLine
          ? 0
          : Math.min(Math.abs(rect.top - readingLine), Math.abs(rect.bottom - readingLine));
        if (distance < closestDistance) {
          closestDistance = distance;
          nextIndex = Number(row.dataset.index);
        }
      }
      setAutoIndex((current) => current === nextIndex ? current : nextIndex);
    };
    const queueSync = () => {
      if (frame === null) frame = requestAnimationFrame(syncToScroll);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener("scroll", queueSync, { passive: true });
        queueSync();
      } else {
        window.removeEventListener("scroll", queueSync);
      }
    });
    const resize = new ResizeObserver(queueSync);
    observer.observe(section);
    resize.observe(section);
    window.addEventListener("resize", queueSync, { passive: true });
    queueSync();
    return () => {
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", queueSync);
      window.removeEventListener("resize", queueSync);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  const activate = (index: number) => {
    if (staticMotion) return;
    setHoveredIndex(index);
  };

  const scrollToActivity = (index: number) => {
    const row = sectionRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    setAutoIndex(index);
    row?.scrollIntoView({ behavior: staticMotion ? "auto" : "smooth", block: "center" });
  };

  return (
    <section ref={sectionRef as never} id="expertise" data-inview={inView || undefined} className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10">
      <div className="lg:grid lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <SectionHeader
            index={expertiseSection.index}
            title={expertiseSection.title}
            subtitle={expertiseSection.subtitle}
          />
          <ol aria-label="Capabilities" className="capability-legend mt-5 hidden border-t border-white/[0.08] lg:block">
            {activities.map((activity, index) => (
              <li
                key={activity.title}
                data-active={activeIndex === index}
                className="capability-legend-row border-b border-white/[0.06] font-mono text-[10px] uppercase tracking-[0.13em] text-zinc-600"
              >
                <button
                  type="button"
                  onClick={() => scrollToActivity(index)}
                  onPointerEnter={(event) => { if (event.pointerType === "mouse") activate(index); }}
                  onPointerLeave={(event) => { if (event.pointerType === "mouse") setHoveredIndex(null); }}
                  aria-current={activeIndex === index ? "true" : undefined}
                  className="flex w-full items-baseline gap-3 py-2.5 text-left"
                >
                  <span className="capability-legend-index">{activity.index}</span>
                  <span className="capability-legend-title">{activity.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="expertise-rail relative">
          {activities.map((activity, index) => (
            <ExpertiseItem
              key={activity.title}
              activity={activity}
              index={index}
              activeIndex={activeIndex}
              staticMotion={staticMotion}
              onActivate={activate}
              onDeactivate={() => setHoveredIndex(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
