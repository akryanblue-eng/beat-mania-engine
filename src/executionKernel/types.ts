export type Lane = 0 | 1 | 2 | 3;

export type SimulationTick = {
  i: number;
  dt: number;
  t: number;
};

export type InputEvent =
  | { t: number; lane: Lane; kind: 'off'; seq: number }
  | { t: number; lane: Lane; kind: 'on'; vel: number; seq: number }
  | { t: number; kind: 'meta'; metaType: string; data?: unknown; seq: number };

export type Note = {
  id: string;
  lane: Lane;
  tOn: number;
  tOff?: number;
};

export type Outcome =
  | { tickI: number; type: 'HIT'; noteId: string; lane: Lane; eventSeq: number; error: number }
  | { tickI: number; type: 'MISS'; noteId: string; lane: Lane }
  | { tickI: number; type: 'RELEASE'; noteId: string; lane: Lane; eventSeq: number; error: number };

export type StateSnapshot = {
  tickI: number;
  score: number;
  combo: number;
  activeHoldCount: number;
};

export type ExecutionTrace = {
  dt: number;
  ticks: SimulationTick[];
  inputs: InputEvent[];
  outcomes: Outcome[];
  stateSnapshots: StateSnapshot[];
  traceHash?: string;
};

export type KernelInput = {
  dt: number;
  notes: Note[];
  inputEvents: InputEvent[];
  targetSongT: number;
  hitWindow: number;
};
