export function Preloader({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div
      data-preloader
      data-reduced-motion={reducedMotion}
      aria-busy="true"
      role="status"
      className="fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center bg-background px-6"
    >
      <div className="w-[min(26rem,82vw)]">
        <div className="h-px overflow-hidden bg-white/10" role="progressbar" aria-label="Loading page">
          <div className="route-progress-bar h-full w-2/5 bg-gradient-to-r from-accent to-violet" />
        </div>
      </div>
    </div>
  );
}
