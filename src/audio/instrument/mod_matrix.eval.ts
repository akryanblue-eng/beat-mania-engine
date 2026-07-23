import type {
  DestinationModulation,
  EvaluationInput,
  ModCurve,
} from "./mod_matrix.types";

// Canonical curve shapes over magnitude in [0, 1] (see MOD_MATRIX.md).
export function applyCurve(magnitude: number, curve: ModCurve): number {
  switch (curve) {
    case "linear":
      return magnitude;
    case "expo":
      return magnitude * magnitude;
    case "log":
      return Math.sqrt(magnitude);
  }
}

export function evaluateRoutes(input: EvaluationInput): DestinationModulation {
  const totals: DestinationModulation = {};
  for (const route of input.routes) {
    if (!route.enabled) continue;
    const raw = input.sources[route.source] ?? 0;
    const value = Math.min(1, Math.max(-1, raw));
    const sign = value < 0 ? -1 : 1;
    const magnitude = Math.abs(value);
    const curvedMagnitude = applyCurve(magnitude, route.curve);
    const transformed =
      route.polarity === "bipolar" ? sign * curvedMagnitude : curvedMagnitude;
    const output = transformed * route.amount;
    totals[route.destination] = (totals[route.destination] ?? 0) + output;
  }
  return totals;
}
