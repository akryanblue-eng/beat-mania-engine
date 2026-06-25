import type { SimulationTick } from './types';

const EPS = 1e-6;

export function generateTicks(dt: number, targetSongT: number): SimulationTick[] {
  const ticks: SimulationTick[] = [];
  let i = 1;
  while (i * dt <= targetSongT + EPS) {
    ticks.push({ i, dt, t: i * dt });
    i++;
  }
  return ticks;
}
