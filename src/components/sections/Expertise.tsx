import { m, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { activities } from "../../data/activities";
import { expertiseSection } from "../../data/sections";
import { dur, ease } from "../../lib/motion";
import { onViewportWidthChange } from "../../lib/viewport";
import { ArtifactSVG } from "../ui/ArtifactSVG";
import { SectionHeader } from "../ui/SectionHeader";
import { useMotionProfile } from "../../hooks/useMotionProfile";

type ActivityItem = typeof activities[number];

function ExpertiseItem({
  activity,
  index,
  activeIndex,
  staticMotion,
  detailedMotion,
}: {
  activity: ActivityItem;
  index: number;
  activeIndex: number;
  staticMotion: boolean;
  detailedMotion: boolean;
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
          initial={detailedMotion ? { opacity: 0, y: 8 } : false}
          animate={detailedMotion ? inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 } : undefined}
          transition={{ duration: 0.4, delay: 0.05, ease: ease.softSettle }}
        >
          {activity.role}
        </m.p>
        <m.h3
          className="mt-2 text-2xl tracking-[-0.05em] text-bone md:text-3xl"
          initial={detailedMotion ? { opacity: 0, y: 10 } : false}
          animate={detailedMotion ? inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 } : undefined}
          transition={{ duration: 0.5, delay: 0.12, ease: ease.softSettle }}
        >
          {activity.title}
        </m.h3>
        <m.p
          className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400"
          initial={detailedMotion ? { opacity: 0, y: 8 } : false}
          animate={detailedMotion ? inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 } : undefined}
          transition={{ duration: 0.45, delay: 0.2, ease: ease.softSettle }}
        >
          {activity.description}
        </m.p>
        <m.div
          className="mt-5 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[9px] uppercase tracking-[0.1em] text-zinc-600"
          initial={detailedMotion ? { opacity: 0 } : false}
          animate={detailedMotion ? inView ? { opacity: 1 } : { opacity: 0 } : undefined}
          transition={{ duration: 0.4, delay: 0.28, ease: ease.softSettle }}
        >
          {activity.tags.map((tag) => <span key={tag}>/{tag}</span>)}
        </m.div>
      </div>
      <ArtifactSVG
        type={activity.artifact}
        className="h-24 w-full self-center text-accent/45 transition-colors duration-500 group-hover:text-accent/90 md:h-28"
      />
    </m.article>
  );
}

export function Expertise() {
  const { level } = useMotionProfile();
  const staticMotion = level === "static";
  // Lite/touch hardware gets one reveal on the row. Stacking four staggered
  // child fades on top of the row fade causes a visible second brightness
  // pulse on mobile compositors after the content has already appeared.
  const detailedMotion = level === "full";
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const updateActive = () => {
      const probe = window.innerHeight * 0.42;
      const available = Array.from(sectionRef.current?.querySelectorAll<HTMLElement>("[data-index]") ?? []);
      if (!available.length) return;
      let nextIndex = 0;
      let nearest = Number.POSITIVE_INFINITY;
      for (const row of available) {
        const rect = row.getBoundingClientRect();
        const index = Number(row.dataset.index);
        const distance = rect.top <= probe && rect.bottom >= probe ? 0 : Math.min(Math.abs(rect.top - probe), Math.abs(rect.bottom - probe));
        if (distance < nearest) { nearest = distance; nextIndex = index; }
      }
      setActiveIndex((current) => current === nextIndex ? current : nextIndex);
    };
    const scheduleUpdate = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        updateActive();
      });
    };
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    const visibilityObserver = new IntersectionObserver(scheduleUpdate, { threshold: 0 });
    const rows = Array.from(sectionRef.current?.querySelectorAll<HTMLElement>("[data-index]") ?? []);
    rows.forEach((row) => {
      if (!row) return;
      resizeObserver.observe(row);
      visibilityObserver.observe(row);
    });
    updateActive();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    const removeResizeListener = onViewportWidthChange(scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      removeResizeListener();
      window.removeEventListener("hashchange", scheduleUpdate);
    };
  }, []);

  return (
    <section ref={sectionRef as never} id="expertise" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10">
      <div className="lg:grid lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <SectionHeader
            index={expertiseSection.index}
            title={expertiseSection.title}
            subtitle={expertiseSection.subtitle}
          />
          <p data-sys-reveal className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            02.{String(activeIndex + 1).padStart(2, "0")} / active capability trace
          </p>
        </div>
        <div className="expertise-rail relative">
          {activities.map((activity, index) => (
            <ExpertiseItem
              key={activity.title}
              activity={activity}
              index={index}
              activeIndex={activeIndex}
              staticMotion={staticMotion}
              detailedMotion={detailedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
