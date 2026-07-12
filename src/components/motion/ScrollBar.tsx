import { m, useScroll } from "framer-motion";

export function ScrollBar() {
  const { scrollYProgress } = useScroll();
  return <m.div className="fixed top-0 left-0 right-0 z-[70] h-px origin-left bg-gradient-to-r from-ember via-ember-bright to-phosphor" style={{ scaleX: scrollYProgress }} />;
}
