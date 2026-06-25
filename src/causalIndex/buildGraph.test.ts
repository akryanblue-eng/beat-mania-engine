import { describe, expect, it } from 'vitest';
import { runKernel } from '../executionKernel/runKernel';
import { indexTrace } from './indexTrace';
import type { InputEvent, KernelInput, Note } from '../executionKernel/types';

const notes: Note[] = [
  { id: 'n0', lane: 0, tOn: 0.1 },
  { id: 'n1', lane: 1, tOn: 0.5 },
  { id: 'n2', lane: 2, tOn: 0.9 },
];

const inputEvents: InputEvent[] = [
  { t: 0.1, lane: 0, kind: 'on', vel: 1, seq: 0 },
  { t: 0.5, lane: 1, kind: 'on', vel: 1, seq: 1 },
];

const baseInput: KernelInput = {
  dt: 0.01,
  notes,
  inputEvents,
  targetSongT: 1.5,
  hitWindow: 0.05,
};

describe('indexTrace', () => {
  it('is deterministic: indexing the same trace twice yields an identical graph and hash', () => {
    const trace = runKernel(baseInput);
    const graphA = indexTrace(trace);
    const graphB = indexTrace(trace);
    expect(graphA).toEqual(graphB);
    expect(graphA.graphHash).toEqual(graphB.graphHash);
  });

  it('is replay-invariant: rerunning the kernel on identical input yields an identical graph', () => {
    const traceA = runKernel(baseInput);
    const traceB = runKernel(baseInput);
    expect(indexTrace(traceA)).toEqual(indexTrace(traceB));
  });

  it('is stable under input reordering: shuffled-but-equivalent inputEvents produce the same graph', () => {
    const shuffledInput: KernelInput = { ...baseInput, inputEvents: [inputEvents[1], inputEvents[0]] };
    const traceA = runKernel(baseInput);
    const traceB = runKernel(shuffledInput);
    expect(indexTrace(traceA)).toEqual(indexTrace(traceB));
  });

  it('only emits edges between nodes that actually exist in the graph', () => {
    const trace = runKernel(baseInput);
    const graph = indexTrace(trace);
    const nodeIds = new Set(graph.nodes.map((n) => n.id));
    for (const edge of graph.edges) {
      expect(nodeIds.has(edge.from)).toBe(true);
      expect(nodeIds.has(edge.to)).toBe(true);
    }
  });
});
