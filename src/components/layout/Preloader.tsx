import { motion } from "framer-motion";
import logo from "../../assets/logo-dark.png";
import { ease } from "../../lib/motion";

export function Preloader({ progress, reducedMotion }: { progress: number; reducedMotion: boolean | null }) {
  return <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, filter: reducedMotion ? "none" : "blur(12px)" }} transition={{ duration: 0.45, ease: ease.softSettle }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050608]"><div className="w-[min(28rem,82vw)]"><img src={logo} alt="Loading" className="mx-auto h-8 w-auto invert opacity-90" /><div className="mt-8 h-px overflow-hidden bg-white/15"><motion.div className="h-full bg-gradient-to-r from-cyan-200 via-white to-violet-400" animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} /></div><div className="mt-3 flex justify-between font-mono text-[10px] tracking-[0.18em] text-zinc-500"><span>LOADING / SYSTEM</span><span>{String(Math.round(progress)).padStart(3, "0")}</span></div></div></motion.div>;
}
