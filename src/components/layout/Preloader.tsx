import { useEffect, useState } from "react";

const FINISH_MS = 260;

export function Preloader({ reducedMotion, active, onHidden }: { reducedMotion: boolean; active: boolean; onHidden: () => void }) {
  const [phase, setPhase] = useState<"growing" | "completing">("growing");
  const [runId, setRunId] = useState(0);
  const [previousActive, setPreviousActive] = useState(active);

  // Adjusted during render (React's documented pattern for state derived from
  // a prop change) rather than in an effect, to avoid an extra commit.
  if (active !== previousActive) {
    setPreviousActive(active);
    if (active) {
      setRunId((id) => id + 1);
      setPhase("growing");
    } else if (!reducedMotion) {
      // The route is ready, but the bar may only be partway through its
      // approach animation — snap it to the end instead of just vanishing
      // mid-motion; the effect below removes the overlay once that's
      // visibly finished.
      setPhase("completing");
    }
  }

  useEffect(() => {
    if (active) return;
    if (reducedMotion) {
      onHidden();
      return;
    }
    const timeout = window.setTimeout(onHidden, FINISH_MS);
    return () => window.clearTimeout(timeout);
  }, [active, reducedMotion, onHidden]);

  return (
    <div
      data-preloader
      data-phase={phase}
      data-reduced-motion={reducedMotion}
      aria-busy={phase === "growing"}
      role="status"
      className="fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center bg-background px-6"
    >
      <div className="w-[min(26rem,82vw)]">
        <div className="h-px overflow-hidden bg-white/10" role="progressbar" aria-label="Loading page">
          <div key={runId} data-phase={phase} className="route-progress-bar h-full w-full origin-left bg-gradient-to-r from-accent to-violet" />
        </div>
      </div>
    </div>
  );
}
