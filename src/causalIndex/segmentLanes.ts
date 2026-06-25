import type { ExecutionTrace } from '../executionKernel/types';
import type { LaneSegment } from './types';

const LANES = [0, 1, 2, 3] as const;

export function segmentLanes(trace: ExecutionTrace): LaneSegment[] {
  return LANES.map((lane) => ({
    lane,
    eventSeqs: trace.inputs.filter((e) => 'lane' in e && e.lane === lane).map((e) => e.seq),
    outcomeIndices: trace.outcomes.reduce<number[]>((acc, o, index) => {
      if (o.lane === lane) acc.push(index);
      return acc;
    }, []),
  }));
}
