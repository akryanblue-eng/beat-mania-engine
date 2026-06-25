import type { CausalGraph } from './types';

export function canonicalizeGraph(graph: CausalGraph): CausalGraph {
  return {
    ...graph,
    nodes: [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...graph.edges].sort(
      (a, b) => a.type.localeCompare(b.type) || a.from.localeCompare(b.from) || a.to.localeCompare(b.to),
    ),
    laneSegments: [...graph.laneSegments].sort((a, b) => a.lane - b.lane),
  };
}
