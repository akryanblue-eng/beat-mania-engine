import { generateTicks } from './tick';
import { sortEvents, drainEvents } from './eventQueue';
import { resolveHit } from './resolver';
import { snapshot, type KernelState } from './snapshot';
import { canonicalizeTrace } from './canonicalize';
import type { ExecutionTrace, KernelInput, Note, Outcome } from './types';

const LANES = [0, 1, 2, 3] as const;

export function runKernel(input: KernelInput): ExecutionTrace {
  const { dt, notes, inputEvents, targetSongT, hitWindow } = input;

  const ticks = generateTicks(dt, targetSongT);
  const events = sortEvents(inputEvents);

  const notesByLane: Note[][] = LANES.map((l) => notes.filter((n) => n.lane === l));
  const cursor: number[] = LANES.map(() => 0);
  const outcomes: Outcome[] = [];
  const stateSnapshots: ExecutionTrace['stateSnapshots'] = [];
  const state: KernelState = { score: 0, combo: 0, activeHolds: {} };

  let eventCursor = 0;

  for (const tick of ticks) {
    // 1. MISS phase — expire notes whose hit window has closed before any input is considered.
    for (const l of LANES) {
      const note = notesByLane[l][cursor[l]];
      if (note && tick.t > note.tOn + hitWindow) {
        outcomes.push({ tickI: tick.i, type: 'MISS', noteId: note.id, lane: l });
        cursor[l]++;
        state.combo = 0;
      }
    }

    // 2. DRAIN — consume input events up to this tick's time, monotonically.
    const { batch, nextCursor } = drainEvents(events, eventCursor, tick.t);
    eventCursor = nextCursor;

    // 3. MATCH/TRANSITION — resolve drained "on" events against the cursor-selected note only.
    for (const e of batch) {
      if (e.kind !== 'on') continue;
      const l = e.lane;
      const res = resolveHit(notesByLane[l], cursor[l], hitWindow, e.t);
      if (res.hit) {
        outcomes.push({
          tickI: tick.i,
          type: 'HIT',
          noteId: res.note.id,
          lane: l,
          eventSeq: e.seq,
          error: res.delta,
        });
        cursor[l]++;
        state.combo++;
        state.score += Math.max(0, 1 - res.delta);
      }
    }

    // 4. SNAPSHOT — freeze state for this tick.
    stateSnapshots.push(snapshot(state, tick.i));
  }

  const trace: ExecutionTrace = { dt, ticks, inputs: events, outcomes, stateSnapshots };
  trace.traceHash = canonicalizeTrace(trace);
  return trace;
}
