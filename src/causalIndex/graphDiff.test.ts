import { describe, expect, it } from 'vitest';
import { runKernel } from '../executionKernel/runKernel';
import { indexTrace } from './indexTrace';
import { computeGraphDiff } from './graphDiff';
import type { KernelInput } from '../executionKernel/types';

describe('computeGraphDiff', () => {
  it('reports equal for two indexings of the same trace', () => {
    const input: KernelInput = {
      dt: 0.01,
      notes: [{ id: 'n0', lane: 0, tOn: 1.0 }],
      inputEvents: [{ t: 1.0, lane: 0, kind: 'on', vel: 1, seq: 0 }],
      targetSongT: 2.0,
      hitWindow: 0.05,
    };
    const trace = runKernel(input);
    const diff = computeGraphDiff(indexTrace(trace), indexTrace(trace));
    expect(diff.equal).toBe(true);
    expect(diff.firstDivergence).toBeNull();
    expect(diff.graphHashA).toEqual(diff.graphHashB);
  });

  it('isolates a HIT-vs-MISS divergence to the causal edge, not the node set', () => {
    const notes = [{ id: 'n0' as const, lane: 0 as const, tOn: 1.0 }];
    const inputEvents = [{ t: 1.03, lane: 0 as const, kind: 'on' as const, vel: 1, seq: 0 }];

    // Same note, same input event; only the hit window differs, flipping HIT -> MISS.
    const traceHit = runKernel({ dt: 0.01, notes, inputEvents, targetSongT: 2.0, hitWindow: 0.05 });
    const traceMiss = runKernel({ dt: 0.01, notes, inputEvents, targetSongT: 2.0, hitWindow: 0.02 });

    const diff = computeGraphDiff(indexTrace(traceHit), indexTrace(traceMiss));

    expect(diff.equal).toBe(false);
    expect(diff.nodeDiffs).toEqual([]);
    expect(diff.edgeDiffs).toEqual([{ key: 'INFLUENCE:event:0:outcome:0:0', inA: true, inB: false }]);
    expect(diff.firstDivergence).toEqual({ kind: 'EDGE', key: 'INFLUENCE:event:0:outcome:0:0', inA: true, inB: false });
  });

  it('surfaces an extra note as a node-level divergence', () => {
    const traceA = runKernel({
      dt: 0.01,
      notes: [{ id: 'n0', lane: 0, tOn: 1.0 }],
      inputEvents: [],
      targetSongT: 2.0,
      hitWindow: 0.05,
    });
    const traceB = runKernel({
      dt: 0.01,
      notes: [
        { id: 'n0', lane: 0, tOn: 1.0 },
        { id: 'n1', lane: 1, tOn: 1.0 },
      ],
      inputEvents: [],
      targetSongT: 2.0,
      hitWindow: 0.05,
    });

    const diff = computeGraphDiff(indexTrace(traceA), indexTrace(traceB));

    expect(diff.equal).toBe(false);
    expect(diff.nodeDiffs).toEqual([{ id: 'outcome:1', inA: false, inB: true }]);
    expect(diff.firstDivergence).toEqual({ kind: 'NODE', id: 'outcome:1', inA: false, inB: true });
  });
});
