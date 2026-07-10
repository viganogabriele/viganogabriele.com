import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 26 });
  return <motion.div className="fixed top-0 left-0 right-0 z-[70] h-px origin-left bg-gradient-to-r from-cyan-200 via-violet-400 to-amber-300" style={{ scaleX }} />;
}
