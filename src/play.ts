import { runKernel } from './executionKernel/runKernel';
import type { ExecutionTrace, InputEvent, KernelInput, Note } from './executionKernel/types';

const NOTES: Note[] = [
  { id: 'n0', lane: 0, tOn: 1.0 },
  { id: 'n1', lane: 0, tOn: 2.0 },
  { id: 'n2', lane: 0, tOn: 3.0 },
  { id: 'n3', lane: 0, tOn: 4.0 },
];
const HIT_WINDOW = 0.1;
const TARGET_SONG_T = 4.6;
const DT = 0.01;
const SCHEDULE_BUFFER = 0.3; // audio scheduling look-ahead in seconds

type PlayState = 'idle' | 'running' | 'done';

let ac: AudioContext | null = null;
let startTime = 0; // audioCtx.currentTime at song t=0; 0 means not yet set
let sessionReady = false; // true after AudioContext.resume() resolves
let tapSeq = 0;
const tapEvents: InputEvent[] = [];
let playState: PlayState = 'idle';

const statusEl = document.getElementById('status')!;
const outputEl = document.getElementById('output')!;

function scheduleClicks(audioCtx: AudioContext): void {
  for (const note of NOTES) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const t = startTime + note.tOn;
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.start(t);
    osc.stop(t + 0.07);
  }
}

function updateStatus(): void {
  statusEl.textContent =
    playState === 'idle'
      ? 'Press Space or tap to start.'
      : playState === 'running'
        ? `Running — ${tapEvents.length} tap(s) recorded`
        : 'Done.';
}

function renderResults(traceA: ExecutionTrace, traceB: ExecutionTrace): void {
  const snap = traceA.stateSnapshots[traceA.stateSnapshots.length - 1];
  const outcomeLines = traceA.outcomes.map((o) =>
    o.type === 'HIT'
      ? `  HIT  ${o.noteId}  Δ=${o.error.toFixed(3)} s`
      : `  MISS ${o.noteId}`,
  );
  const replayOk = traceA.traceHash === traceB.traceHash;
  outputEl.textContent = [
    `score  ${snap.score.toFixed(2)}`,
    `combo  ${snap.combo}`,
    '',
    ...outcomeLines,
    '',
    `hash   ${traceA.traceHash ?? '—'}`,
    `replay ${replayOk ? 'OK ✓' : 'MISMATCH ✗  ' + (traceB.traceHash ?? '—')}`,
  ].join('\n');
}

function finalize(): void {
  if (playState !== 'running') return;
  playState = 'done';
  updateStatus();

  const input: KernelInput = {
    dt: DT,
    notes: NOTES,
    inputEvents: tapEvents,
    targetSongT: TARGET_SONG_T,
    hitWindow: HIT_WINDOW,
  };
  const traceA = runKernel(input);
  // Serialize and re-parse to confirm hash stability across a round-trip.
  const replayEvents = JSON.parse(JSON.stringify(tapEvents)) as InputEvent[];
  const traceB = runKernel({ ...input, inputEvents: replayEvents });
  renderResults(traceA, traceB);
}

function startSession(): void {
  if (playState !== 'idle') return;
  playState = 'running';
  const audioCtx = new AudioContext();
  ac = audioCtx;
  updateStatus();

  audioCtx
    .resume()
    .then(() => {
      startTime = audioCtx.currentTime + SCHEDULE_BUFFER;
      sessionReady = true;
      scheduleClicks(audioCtx);
      setTimeout(finalize, (TARGET_SONG_T + SCHEDULE_BUFFER) * 1000 + 200);
    })
    .catch((err: unknown) => {
      console.error('AudioContext.resume() failed:', err);
      playState = 'idle';
      sessionReady = false;
      updateStatus();
    });
}

function recordTap(): void {
  if (playState !== 'running' || !ac || !sessionReady) return;
  const t = ac.currentTime - startTime;
  tapEvents.push({ t, lane: 0, kind: 'on', vel: 1, seq: tapSeq++ });
  updateStatus();
}

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.repeat) return;
  if (playState === 'idle') startSession();
  else recordTap();
});

document.addEventListener('pointerdown', () => {
  if (playState === 'idle') startSession();
  else recordTap();
});

updateStatus();
