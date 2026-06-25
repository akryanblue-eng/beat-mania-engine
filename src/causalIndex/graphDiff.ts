import type { CausalEdge, CausalGraph } from './types';

export type NodeDiff = { id: string; inA: boolean; inB: boolean };
export type EdgeDiff = { key: string; inA: boolean; inB: boolean };

export type CausalDivergence =
  | { kind: 'NODE'; id: string; inA: boolean; inB: boolean }
  | { kind: 'EDGE'; key: string; inA: boolean; inB: boolean };

export type GraphDiff = {
  equal: boolean;
  graphHashA: string;
  graphHashB: string;
  nodeDiffs: NodeDiff[];
  edgeDiffs: EdgeDiff[];
  firstDivergence: CausalDivergence | null;
};

function edgeKey(e: CausalEdge): string {
  const lane = e.type === 'INFLUENCE' ? `:${e.lane}` : '';
  return `${e.type}:${e.from}:${e.to}${lane}`;
}

// Diffs two sorted-by-construction key sets, returning only the keys whose
// presence differs. The result is already in lexicographic order, which is
// what makes "first divergence" well-defined without extra sorting.
function diffPresence(keysA: string[], keysB: string[]): { key: string; inA: boolean; inB: boolean }[] {
  const setA = new Set(keysA);
  const setB = new Set(keysB);
  const union = [...new Set([...keysA, ...keysB])].sort();
  return union
    .map((key) => ({ key, inA: setA.has(key), inB: setB.has(key) }))
    .filter((d) => d.inA !== d.inB);
}

export function computeGraphDiff(graphA: CausalGraph, graphB: CausalGraph): GraphDiff {
  const nodeDiffs: NodeDiff[] = diffPresence(graphA.nodes.map((n) => n.id), graphB.nodes.map((n) => n.id)).map(
    (d) => ({ id: d.key, inA: d.inA, inB: d.inB }),
  );

  const edgeDiffs: EdgeDiff[] = diffPresence(graphA.edges.map(edgeKey), graphB.edges.map(edgeKey));

  const firstDivergence: CausalDivergence | null =
    nodeDiffs.length > 0
      ? { kind: 'NODE', ...nodeDiffs[0] }
      : edgeDiffs.length > 0
        ? { kind: 'EDGE', ...edgeDiffs[0] }
        : null;

  return {
    equal: nodeDiffs.length === 0 && edgeDiffs.length === 0,
    graphHashA: graphA.graphHash,
    graphHashB: graphB.graphHash,
    nodeDiffs,
    edgeDiffs,
    firstDivergence,
  };
}
