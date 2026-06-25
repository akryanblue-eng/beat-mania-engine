import { runKernel } from './executionKernel/runKernel';
import type { KernelInput } from './executionKernel/types';

const input: KernelInput = {
  dt: 0.01,
  notes: [
    { id: 'n0', lane: 0, tOn: 0.5 },
    { id: 'n1', lane: 1, tOn: 1.0 },
    { id: 'n2', lane: 2, tOn: 1.5 },
    { id: 'n3', lane: 3, tOn: 2.0 },
  ],
  inputEvents: [
    { t: 0.5, lane: 0, kind: 'on', vel: 1, seq: 0 },
    { t: 1.0, lane: 1, kind: 'on', vel: 1, seq: 1 },
  ],
  targetSongT: 2.5,
  hitWindow: 0.05,
};

const trace = runKernel(input);
const finalState = trace.stateSnapshots[trace.stateSnapshots.length - 1];

const app = document.querySelector<HTMLDivElement>('#app')!;
app.textContent =
  `Beat Mania Engine — score ${finalState.score.toFixed(2)}, ` +
  `combo ${finalState.combo}, trace ${trace.traceHash}`;
