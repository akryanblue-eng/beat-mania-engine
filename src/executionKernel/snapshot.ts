import type { StateSnapshot } from './types';

export type KernelState = {
  score: number;
  combo: number;
  activeHolds: Record<string, true>;
};

export function snapshot(state: KernelState, tickI: number): StateSnapshot {
  return {
    tickI,
    score: state.score,
    combo: state.combo,
    activeHoldCount: Object.keys(state.activeHolds).length,
  };
}
