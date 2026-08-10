import type { Location } from "react-router-dom";

export interface ScrollSnapshot {
  y: number;
  anchor?: { id: string; offset: number };
}

export interface NoteNavigationState {
  noteReturn: {
    key: string;
    pathname: string;
    search: string;
    hash: string;
    snapshot: ScrollSnapshot;
  };
}

const noteReturnSnapshots = new Map<string, ScrollSnapshot>();
let pendingNoteReturn: ScrollSnapshot | null = null;

/**
 * Document-space top of an element, from layout boxes only.
 *
 * getBoundingClientRect() folds in ancestor transforms, and the entrance
 * animations are transforms: FadeIn translates 16px (10px on the lite motion
 * profile). So a snapshot captured after a reveal had finished and a restore
 * measured while one was still pending described the same element 16px apart,
 * and the page settled that far from where it was left. offsetTop ignores
 * transforms, so both ends of the comparison talk about the same layout.
 */
export function layoutTop(element: HTMLElement) {
  let top = 0;
  let current: HTMLElement | null = element;
  while (current) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
}

/** Where the anchor sits relative to the current scroll offset, transform-free. */
function anchorViewportOffset(element: HTMLElement) {
  return layoutTop(element) - window.scrollY;
}

export function getScrollSnapshot(): ScrollSnapshot {
  const anchors = Array.from(document.querySelectorAll<HTMLElement>("main section[id], [data-scroll-anchor]"));
  const closest = anchors.reduce<HTMLElement | null>((candidate, element) => {
    if (!candidate) return element;
    return Math.abs(anchorViewportOffset(element)) < Math.abs(anchorViewportOffset(candidate)) ? element : candidate;
  }, null);
  const anchorId = closest?.dataset.scrollAnchor ?? closest?.id;

  return {
    y: window.scrollY,
    anchor: closest && anchorId ? { id: anchorId, offset: anchorViewportOffset(closest) } : undefined,
  };
}

export function createNoteNavigationState(location: Location, anchor?: HTMLElement): NoteNavigationState {
  const snapshot = getScrollSnapshot();
  const anchorId = anchor?.dataset.scrollAnchor ?? anchor?.id;
  if (anchor && anchorId) snapshot.anchor = { id: anchorId, offset: anchorViewportOffset(anchor) };
  return {
    noteReturn: {
      key: location.key,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      snapshot,
    },
  };
}

export function readNoteNavigationState(value: unknown): NoteNavigationState | null {
  if (!value || typeof value !== "object" || !("noteReturn" in value)) return null;
  const noteReturn = (value as { noteReturn?: unknown }).noteReturn;
  if (!noteReturn || typeof noteReturn !== "object") return null;
  const candidate = noteReturn as Partial<NoteNavigationState["noteReturn"]>;
  if (
    typeof candidate.key !== "string" ||
    typeof candidate.pathname !== "string" ||
    typeof candidate.search !== "string" ||
    typeof candidate.hash !== "string" ||
    !candidate.snapshot ||
    typeof candidate.snapshot.y !== "number"
  ) return null;
  const anchor = candidate.snapshot.anchor;
  if (anchor && (typeof anchor.id !== "string" || typeof anchor.offset !== "number")) return null;
  return value as NoteNavigationState;
}

export function registerNoteReturn(state: NoteNavigationState) {
  noteReturnSnapshots.set(state.noteReturn.key, state.noteReturn.snapshot);
}

export function queueNoteReturn(snapshot: ScrollSnapshot) {
  pendingNoteReturn = snapshot;
}

export function takeQueuedNoteReturn() {
  const snapshot = pendingNoteReturn;
  pendingNoteReturn = null;
  return snapshot;
}

export function getRegisteredNoteReturn(key: string) {
  return noteReturnSnapshots.get(key);
}

export function findScrollAnchor(id: string) {
  return document.getElementById(id) ?? document.querySelector<HTMLElement>(`[data-scroll-anchor="${CSS.escape(id)}"]`);
}
