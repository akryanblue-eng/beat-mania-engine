import type { ExecutionTrace } from '../executionKernel/types';
import type { CausalGraph } from './types';
import { buildGraph } from './buildGraph';

export function indexTrace(trace: ExecutionTrace): CausalGraph {
  return buildGraph(trace);
}
