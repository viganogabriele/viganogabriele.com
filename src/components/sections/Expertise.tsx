import { m, useInView } from "framer-motion";
import { useRef } from "react";
import { activities } from "../../data/activities";
import { useMotionProfile } from "../../hooks/useMotionProfile";
import { ease } from "../../lib/motion";
import { SectionHeader } from "../ui/SectionHeader";

function Capability({ activity, index }: { activity: (typeof activities)[number]; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const { level } = useMotionProfile();
  const staticMotion = level === "static";

  return (
    <m.article
      ref={ref as never}
      initial={staticMotion ? false : { opacity: 0, y: 16 }}
      animate={staticMotion ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: ease.softSettle }}
      className={`border-t border-white/[0.08] py-7 ${index === activities.length - 1 ? "md:col-span-2" : ""}`}
    >
      <div className="flex items-start gap-4">
        <span className="font-mono text-[10px] text-zinc-600">{activity.index}</span>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">{activity.role}</p>
          <h3 className="mt-2 text-2xl tracking-[-0.045em] text-bone">{activity.title}</h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">{activity.description}</p>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[9px] uppercase tracking-[0.08em] text-zinc-600" aria-label={`${activity.title} skills`}>
            {activity.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        </div>
      </div>
    </m.article>
  );
}

export function Expertise() {
  return (
    <section id="expertise" className="relative mx-auto mt-36 max-w-7xl px-5 sm:px-8 lg:mt-48 lg:px-10">
      <div className="lg:grid lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <SectionHeader
            index="03 / HOW I WORK"
            title="How I work."
            subtitle="Across product, quality, people, operations, and practical automation."
          />
        </div>
        <div className="grid md:grid-cols-2 md:gap-x-8">
          {activities.map((activity, index) => <Capability key={activity.title} activity={activity} index={index} />)}
        </div>
      </div>
    </section>
  );
}
