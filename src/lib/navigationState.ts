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

export function getScrollSnapshot(): ScrollSnapshot {
  const anchors = Array.from(document.querySelectorAll<HTMLElement>("main section[id], [data-scroll-anchor]"));
  const closest = anchors.reduce<HTMLElement | null>((candidate, element) => {
    if (!candidate) return element;
    return Math.abs(element.getBoundingClientRect().top) < Math.abs(candidate.getBoundingClientRect().top) ? element : candidate;
  }, null);
  const anchorId = closest?.dataset.scrollAnchor ?? closest?.id;

  return {
    y: window.scrollY,
    anchor: closest && anchorId ? { id: anchorId, offset: closest.getBoundingClientRect().top } : undefined,
  };
}

export function createNoteNavigationState(location: Location): NoteNavigationState {
  return {
    noteReturn: {
      key: location.key,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      snapshot: getScrollSnapshot(),
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

export function getRegisteredNoteReturn(key: string) {
  return noteReturnSnapshots.get(key);
}

export function findScrollAnchor(id: string) {
  return document.getElementById(id) ?? document.querySelector<HTMLElement>(`[data-scroll-anchor="${CSS.escape(id)}"]`);
}
