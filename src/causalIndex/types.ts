import type { Lane } from '../executionKernel/types';

export type CausalNode =
  | { id: string; type: 'TICK'; tickI: number }
  | { id: string; type: 'EVENT'; seq: number }
  | { id: string; type: 'OUTCOME'; tickI: number; outcomeIndex: number };

export type CausalEdge =
  | { from: string; to: string; type: 'TEMPORAL' }
  | { from: string; to: string; type: 'INFLUENCE'; lane: Lane }
  | { from: string; to: string; type: 'RESOLUTION' };

export type LaneSegment = {
  lane: Lane;
  eventSeqs: number[];
  outcomeIndices: number[];
};

export type CausalGraph = {
  nodes: CausalNode[];
  edges: CausalEdge[];
  laneSegments: LaneSegment[];
  traceHash: string;
  graphHash: string;
};
