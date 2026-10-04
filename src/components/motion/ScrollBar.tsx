import { m, useScroll } from "framer-motion";
import type { RefObject } from "react";

export function ScrollBar({ container }: { container?: RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll(container ? { container } : {});
  return <m.div aria-hidden="true" data-reading-progress className="fixed top-0 left-0 right-0 z-[95] h-px origin-left bg-gradient-to-r from-blue via-accent to-violet" style={{ scaleX: scrollYProgress }} />;
}
