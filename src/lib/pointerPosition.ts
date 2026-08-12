let last: { x: number; y: number } | null = null;
let tracking = false;

/**
 * Remembers where the pointer is, so something mounted by a click can appear
 * under it straight away instead of waiting for the next move. The SYS glass
 * lens is mounted by pressing a button: without this it stayed invisible until
 * the pointer happened to move, which read as the toggle doing nothing.
 */
export function startPointerTracking() {
  if (tracking || typeof window === "undefined") return;
  tracking = true;
  const remember = (event: PointerEvent) => { last = { x: event.clientX, y: event.clientY }; };
  window.addEventListener("pointermove", remember, { passive: true });
  window.addEventListener("pointerdown", remember, { passive: true });
}

export function getLastPointer() {
  return last;
}
