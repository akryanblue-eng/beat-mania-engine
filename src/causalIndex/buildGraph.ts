import type { ExecutionTrace } from '../executionKernel/types';
import { canonicalHash } from '../shared/hash';
import type { CausalGraph, CausalNode } from './types';
import { extractEdges } from './extractEdges';
import { segmentLanes } from './segmentLanes';
import { canonicalizeGraph } from './canonicalizeGraph';

export function buildGraph(trace: ExecutionTrace): CausalGraph {
  const nodes: CausalNode[] = [
    ...trace.ticks.map((t): CausalNode => ({ id: `tick:${t.i}`, type: 'TICK', tickI: t.i })),
    ...trace.inputs.map((e): CausalNode => ({ id: `event:${e.seq}`, type: 'EVENT', seq: e.seq })),
    ...trace.outcomes.map(
      (o, index): CausalNode => ({ id: `outcome:${index}`, type: 'OUTCOME', tickI: o.tickI, outcomeIndex: index }),
    ),
  ];

  const unhashed = canonicalizeGraph({
    nodes,
    edges: extractEdges(trace),
    laneSegments: segmentLanes(trace),
    traceHash: trace.traceHash ?? '',
    graphHash: '',
  });

  const { graphHash, ...withoutHash } = unhashed;
  void graphHash;
  return { ...unhashed, graphHash: canonicalHash(withoutHash) };
}
