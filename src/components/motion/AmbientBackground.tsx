import { useMotionProfile } from "../../hooks/useMotionProfile";

export function AmbientBackground() {
  const { level, isCompact } = useMotionProfile();
  return (
    <div className="ambient-layer fixed inset-0 z-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(45,70,135,0.3),transparent_72%)]" />
      {level === "full" && !isCompact && <>
        <div className="ambient-blob absolute top-[30%] left-[-12%] h-[38rem] w-[38rem] rounded-full bg-blue/[0.04] blur-[140px]" />
        <div className="ambient-blob absolute bottom-[-8%] right-[-10%] h-[34rem] w-[34rem] rounded-full bg-accent/[0.045] blur-[150px]" />
      </>}
    </div>
  );
}
