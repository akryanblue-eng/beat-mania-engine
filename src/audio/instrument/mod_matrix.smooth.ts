export type SmootherState = {
  current: number;
};

export function smoothValue(
  state: SmootherState,
  target: number,
  coefficient: number
): SmootherState {
  return {
    current: state.current + coefficient * (target - state.current),
  };
}

// alpha = 1 - e^(-1 / (fs * tau)); see MOD_MATRIX.md.
// fs: control evaluation rate in Hz (> 0). tau: response time in seconds (>= 0).
// tau = 0 means instant response (alpha = 1). Result is finite and in [0, 1].
export function coefficientFromResponseTime(
  evaluationRateHz: number,
  responseTimeS: number
): number {
  if (!Number.isFinite(evaluationRateHz) || evaluationRateHz <= 0) {
    throw new RangeError("evaluationRateHz must be a finite number > 0");
  }
  if (!Number.isFinite(responseTimeS) || responseTimeS < 0) {
    throw new RangeError("responseTimeS must be a finite number >= 0");
  }
  if (responseTimeS === 0) return 1;
  const alpha = 1 - Math.exp(-1 / (evaluationRateHz * responseTimeS));
  return Math.min(1, Math.max(0, alpha));
}
