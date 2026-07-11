import { useMotionProfile } from "../../hooks/useMotionProfile";

export function AmbientBackground() {
  const { level } = useMotionProfile();
  return (
    <div className="ambient-layer fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(26,43,60,0.33),transparent_72%)]" />
      {level === "full" && <>
        <div className="ambient-blob absolute top-[30%] left-[-12%] h-[38rem] w-[38rem] rounded-full bg-cyan-400/[0.035] blur-[140px]" />
        <div className="ambient-blob absolute bottom-[-8%] right-[-10%] h-[34rem] w-[34rem] rounded-full bg-violet-500/[0.045] blur-[150px]" />
      </>}
    </div>
  );
}
