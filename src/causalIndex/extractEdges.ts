import type { ExecutionTrace } from '../executionKernel/types';
import type { CausalEdge } from './types';

export function extractEdges(trace: ExecutionTrace): CausalEdge[] {
  const edges: CausalEdge[] = [];

  for (let i = 1; i < trace.ticks.length; i++) {
    edges.push({
      from: `tick:${trace.ticks[i - 1].i}`,
      to: `tick:${trace.ticks[i].i}`,
      type: 'TEMPORAL',
    });
  }

  trace.outcomes.forEach((o, index) => {
    edges.push({ from: `tick:${o.tickI}`, to: `outcome:${index}`, type: 'RESOLUTION' });
    if (o.type === 'HIT' || o.type === 'RELEASE') {
      edges.push({ from: `event:${o.eventSeq}`, to: `outcome:${index}`, type: 'INFLUENCE', lane: o.lane });
    }
  });

  return edges;
}
