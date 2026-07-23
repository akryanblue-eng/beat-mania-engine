export type ModCurve = "linear" | "expo" | "log";
export type ModPolarity = "unipolar" | "bipolar";

export type ModSourceId =
  | "lfo1"
  | "lfo2"
  | "env1"
  | "env2"
  | "velocity"
  | "aftertouch"
  | "modwheel";

export type ModDestinationId =
  | "osc1.pitch"
  | "osc2.pitch"
  | "filter.cutoff"
  | "filter.resonance"
  | "amp.level"
  | "lfo1.rate";

export type ModRoute = {
  id: string; // opaque UUID/ULID
  source: ModSourceId;
  destination: ModDestinationId;
  amount: number; // -1.0 to 1.0
  curve: ModCurve;
  polarity: ModPolarity;
  enabled: boolean;
};

export type RouteMutationError =
  | "duplicate-id"
  | "duplicate-route"
  | "invalid-source"
  | "invalid-destination"
  | "invalid-amount"
  | "invalid-curve"
  | "invalid-polarity"
  | "route-not-found";

export type MutationResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: RouteMutationError };

export type SourceValues = Partial<Record<ModSourceId, number>>;

export type EvaluationInput = {
  routes: readonly ModRoute[];
  sources: SourceValues;
};

export type DestinationModulation = Partial<Record<ModDestinationId, number>>;

export const MOD_SOURCES: readonly ModSourceId[] = [
  "lfo1",
  "lfo2",
  "env1",
  "env2",
  "velocity",
  "aftertouch",
  "modwheel",
];

export const MOD_DESTINATIONS: readonly ModDestinationId[] = [
  "osc1.pitch",
  "osc2.pitch",
  "filter.cutoff",
  "filter.resonance",
  "amp.level",
  "lfo1.rate",
];

export const MOD_CURVES: readonly ModCurve[] = ["linear", "expo", "log"];

export const MOD_POLARITIES: readonly ModPolarity[] = ["unipolar", "bipolar"];
