import { describe, expect, it } from 'vitest';
import { generateTicks } from './tick';
import { sortEvents } from './eventQueue';
import { runKernel } from './runKernel';
import type { InputEvent, KernelInput, Note } from './types';

describe('generateTicks', () => {
  it('is deterministic for the same dt and targetSongT', () => {
    expect(generateTicks(0.01, 2.0)).toEqual(generateTicks(0.01, 2.0));
  });
});

describe('sortEvents', () => {
  it('produces the same order regardless of input array order (off < on < meta, then t, then seq)', () => {
    const events: InputEvent[] = [
      { t: 1, lane: 0, kind: 'on', vel: 1, seq: 3 },
      { t: 0.5, lane: 1, kind: 'off', seq: 1 },
      { t: 1, lane: 0, kind: 'off', seq: 2 },
      { t: 0, kind: 'meta', metaType: 'start', seq: 0 },
    ];
    const shuffled = [events[2], events[0], events[3], events[1]];
    expect(sortEvents(shuffled)).toEqual(sortEvents(events));
    expect(sortEvents(events).map((e) => e.seq)).toEqual([0, 1, 2, 3]);
  });
});

describe('runKernel', () => {
  const baseNotes: Note[] = [
    { id: 'n0', lane: 0, tOn: 0.1 },
    { id: 'n1', lane: 0, tOn: 0.5 },
    { id: 'n2', lane: 0, tOn: 0.9 },
  ];

  it('resolves a note in the hit window as HIT with the expected error', () => {
    const input: KernelInput = {
      dt: 0.01,
      notes: [{ id: 'n0', lane: 0, tOn: 1.0 }],
      inputEvents: [{ t: 1.0, lane: 0, kind: 'on', vel: 1, seq: 0 }],
      targetSongT: 2.0,
      hitWindow: 0.05,
    };
    const trace = runKernel(input);
    expect(trace.outcomes).toEqual([
      { tickI: 100, type: 'HIT', noteId: 'n0', lane: 0, eventSeq: 0, error: 0 },
    ]);
  });

  it('marks notes as MISS when no input arrives before the window closes', () => {
    const input: KernelInput = {
      dt: 0.01,
      notes: [
        { id: 'n0', lane: 0, tOn: 1.0 },
        { id: 'n1', lane: 1, tOn: 1.2 },
      ],
      inputEvents: [],
      targetSongT: 2.0,
      hitWindow: 0.05,
    };
    const trace = runKernel(input);
    expect(trace.outcomes).toHaveLength(2);
    expect(trace.outcomes.every((o) => o.type === 'MISS')).toBe(true);
  });

  it('keeps the per-lane cursor monotonic: notes resolve strictly in chart order', () => {
    const input: KernelInput = {
      dt: 0.01,
      notes: baseNotes,
      // only n1 (the middle note) has a matching input; n0 and n2 must MISS.
      inputEvents: [{ t: 0.5, lane: 0, kind: 'on', vel: 1, seq: 0 }],
      targetSongT: 2.0,
      hitWindow: 0.03,
    };
    const trace = runKernel(input);
    expect(trace.outcomes.map((o) => o.noteId)).toEqual(['n0', 'n1', 'n2']);
    expect(trace.outcomes.map((o) => o.type)).toEqual(['MISS', 'HIT', 'MISS']);
  });

  it('produces an identical stateSnapshots array and traceHash across repeated runs', () => {
    const input: KernelInput = {
      dt: 0.01,
      notes: baseNotes,
      inputEvents: [
        { t: 0.1, lane: 0, kind: 'on', vel: 1, seq: 0 },
        { t: 0.5, lane: 0, kind: 'on', vel: 1, seq: 1 },
        { t: 0.9, lane: 0, kind: 'on', vel: 1, seq: 2 },
      ],
      targetSongT: 1.0,
      hitWindow: 0.03,
    };
    const traces = Array.from({ length: 10 }, () => runKernel(input));
    const hashes = new Set(traces.map((t) => t.traceHash));
    expect(hashes.size).toBe(1);
    expect(traces[0].traceHash).toBeTruthy();
    for (const trace of traces.slice(1)) {
      expect(trace.stateSnapshots).toEqual(traces[0].stateSnapshots);
    }
  });
});
