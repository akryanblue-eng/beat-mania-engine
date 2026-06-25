import fs from 'fs';
import { runKernel } from '../src/executionKernel/runKernel';
import type { InputEvent, Note } from '../src/executionKernel/types';

const SEED = 1337;
const DT = 0.01;
const HIT_WINDOW = 0.05;

const notes: Note[] = [
  { id: 'n0', lane: 0, tOn: 0.5 },
  { id: 'n1', lane: 1, tOn: 1.0 },
  { id: 'n2', lane: 2, tOn: 1.5 },
  { id: 'n3', lane: 3, tOn: 2.0 },
];

const inputEvents: InputEvent[] = [
  { t: 0.5, lane: 0, kind: 'on', vel: 1, seq: 0 },
  { t: 1.0, lane: 1, kind: 'on', vel: 1, seq: 1 },
];

const trace = runKernel({
  dt: DT,
  notes,
  inputEvents,
  targetSongT: 2.5,
  hitWindow: HIT_WINDOW,
});

const snapshot = {
  schema: 'beat-mania-engine.engine-snapshot.v0',
  engineVersion: '0.1.0',
  state: {
    seed: SEED,
    tick: trace.ticks.length,
  },
  executionTrace: {
    traceHash: trace.traceHash,
    outcomeCount: trace.outcomes.length,
    finalScore: trace.stateSnapshots[trace.stateSnapshots.length - 1]?.score ?? 0,
    finalCombo: trace.stateSnapshots[trace.stateSnapshots.length - 1]?.combo ?? 0,
  },
};

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/engine.snapshot.json', JSON.stringify(snapshot, null, 2));
