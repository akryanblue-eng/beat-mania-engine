import type { Note } from './types';

export type HitResolution = { hit: true; note: Note; delta: number } | { hit: false };

export function resolveHit(
  laneNotes: Note[],
  cursor: number,
  hitWindow: number,
  t: number,
): HitResolution {
  const note = laneNotes[cursor];
  if (!note) return { hit: false };
  const delta = Math.abs(t - note.tOn);
  if (delta <= hitWindow) {
    return { hit: true, note, delta };
  }
  return { hit: false };
}
