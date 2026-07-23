import { describe, expect, it } from "vitest";
import {
  coefficientFromResponseTime,
  smoothValue,
  type SmootherState,
} from "./mod_matrix.smooth";

const ALPHA = coefficientFromResponseTime(1000, 0.01); // 1 kHz control rate, 10 ms

function run(
  start: number,
  target: number,
  steps: number,
  alpha = ALPHA
): SmootherState[] {
  const states: SmootherState[] = [{ current: start }];
  for (let i = 0; i < steps; i++) {
    states.push(smoothValue(states[states.length - 1], target, alpha));
  }
  return states;
}

describe("coefficientFromResponseTime", () => {
  it("produces a finite alpha in [0, 1] across control rates and response times", () => {
    for (const fs of [100, 1000, 48000]) {
      for (const tau of [0.001, 0.01, 0.1, 1]) {
        const alpha = coefficientFromResponseTime(fs, tau);
        expect(Number.isFinite(alpha)).toBe(true);
        expect(alpha).toBeGreaterThan(0);
        expect(alpha).toBeLessThanOrEqual(1);
      }
    }
  });

  it("treats tau = 0 as instant response (alpha = 1)", () => {
    expect(coefficientFromResponseTime(1000, 0)).toBe(1);
  });

  it("rejects invalid domains", () => {
    expect(() => coefficientFromResponseTime(0, 0.01)).toThrow(RangeError);
    expect(() => coefficientFromResponseTime(-1, 0.01)).toThrow(RangeError);
    expect(() => coefficientFromResponseTime(Number.NaN, 0.01)).toThrow(
      RangeError
    );
    expect(() => coefficientFromResponseTime(1000, -0.01)).toThrow(RangeError);
    expect(() => coefficientFromResponseTime(1000, Number.NaN)).toThrow(
      RangeError
    );
  });
});

describe("smoothValue", () => {
  it("a step from 0 to 1 does not jump directly to 1", () => {
    const next = smoothValue({ current: 0 }, 1, ALPHA);
    expect(next.current).toBeGreaterThan(0);
    expect(next.current).toBeLessThan(1);
  });

  it("moves monotonically toward the target without overshoot", () => {
    const states = run(0, 1, 200);
    for (let i = 1; i < states.length; i++) {
      expect(states[i].current).toBeGreaterThan(states[i - 1].current);
      expect(states[i].current).toBeLessThanOrEqual(1);
    }
  });

  it("converges within tolerance", () => {
    const states = run(0, 1, 200);
    expect(Math.abs(states[states.length - 1].current - 1)).toBeLessThan(1e-6);
  });

  it("repeated identical targets do not drift once the target is reached", () => {
    let state: SmootherState = { current: 0.5 };
    for (let i = 0; i < 1000; i++) {
      state = smoothValue(state, 0.5, ALPHA);
      expect(state.current).toBe(0.5);
    }
  });

  it("smooths negative targets symmetrically", () => {
    const up = run(0, 1, 50);
    const down = run(0, -1, 50);
    for (let i = 0; i < up.length; i++) {
      expect(down[i].current).toBe(-up[i].current + 0); // +0 normalizes -0

    }
  });

  it("remains stable when direction changes mid-ramp", () => {
    const ramp = run(0, 1, 20);
    let state = ramp[ramp.length - 1];
    let previous = state.current;
    for (let i = 0; i < 200; i++) {
      state = smoothValue(state, -1, ALPHA);
      expect(Number.isFinite(state.current)).toBe(true);
      expect(state.current).toBeLessThan(previous);
      expect(state.current).toBeGreaterThanOrEqual(-1);
      previous = state.current;
    }
    expect(Math.abs(state.current - -1)).toBeLessThan(1e-3);
  });

  it("is independent per destination", () => {
    let cutoff: SmootherState = { current: 0 };
    let amp: SmootherState = { current: 0 };
    for (let i = 0; i < 50; i++) {
      cutoff = smoothValue(cutoff, 1, ALPHA);
      amp = smoothValue(amp, -1, ALPHA);
    }
    const cutoffAlone = run(0, 1, 50);
    const ampAlone = run(0, -1, 50);
    expect(cutoff.current).toBe(cutoffAlone[cutoffAlone.length - 1].current);
    expect(amp.current).toBe(ampAlone[ampAlone.length - 1].current);
  });

  it("produces no NaN, infinity, or overshoot under valid inputs", () => {
    for (const [start, target] of [
      [0, 1],
      [1, 0],
      [-1, 1],
      [0.25, -0.75],
    ] as const) {
      const lo = Math.min(start, target);
      const hi = Math.max(start, target);
      for (const state of run(start, target, 500)) {
        expect(Number.isFinite(state.current)).toBe(true);
        expect(state.current).toBeGreaterThanOrEqual(lo);
        expect(state.current).toBeLessThanOrEqual(hi);
      }
    }
  });

  it("identical inputs and smoothing state produce identical outputs", () => {
    const state = { current: 0.3 };
    expect(smoothValue(state, 0.9, ALPHA)).toEqual(
      smoothValue({ ...state }, 0.9, ALPHA)
    );
  });
});
