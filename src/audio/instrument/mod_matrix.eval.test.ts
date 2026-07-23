import { describe, expect, it } from "vitest";
import { applyCurve, evaluateRoutes } from "./mod_matrix.eval";
import type { EvaluationInput, ModRoute } from "./mod_matrix.types";

function route(overrides: Partial<ModRoute> = {}): ModRoute {
  return {
    id: "r1",
    source: "lfo1",
    destination: "filter.cutoff",
    amount: 1,
    curve: "linear",
    polarity: "bipolar",
    enabled: true,
    ...overrides,
  };
}

describe("applyCurve", () => {
  it("implements the canonical curve shapes", () => {
    expect(applyCurve(0.5, "linear")).toBe(0.5);
    expect(applyCurve(0.5, "expo")).toBe(0.25);
    expect(applyCurve(0.25, "log")).toBe(0.5);
    for (const curve of ["linear", "expo", "log"] as const) {
      expect(applyCurve(0, curve)).toBe(0);
      expect(applyCurve(1, curve)).toBe(1);
    }
  });
});

describe("evaluateRoutes", () => {
  it("is deterministic: same input produces identical output", () => {
    const input: EvaluationInput = {
      routes: [
        route(),
        route({ id: "r2", destination: "amp.level", curve: "expo" }),
      ],
      sources: { lfo1: 0.7 },
    };
    expect(evaluateRoutes(input)).toEqual(evaluateRoutes(input));
  });

  it("ignores disabled routes", () => {
    const input: EvaluationInput = {
      routes: [route({ enabled: false })],
      sources: { lfo1: 1 },
    };
    expect(evaluateRoutes(input)).toEqual({});
  });

  it("reads a missing source as 0", () => {
    expect(evaluateRoutes({ routes: [route()], sources: {} })).toEqual({
      "filter.cutoff": 0,
    });
  });

  it("clamps source values to [-1, 1]", () => {
    expect(
      evaluateRoutes({ routes: [route()], sources: { lfo1: 5 } })
    ).toEqual({ "filter.cutoff": 1 });
    expect(
      evaluateRoutes({ routes: [route()], sources: { lfo1: -5 } })
    ).toEqual({ "filter.cutoff": -1 });
  });

  it("bipolar routes curve the magnitude and reapply the sign", () => {
    expect(
      evaluateRoutes({
        routes: [route({ curve: "expo" })],
        sources: { lfo1: -0.5 },
      })
    ).toEqual({ "filter.cutoff": -0.25 });
  });

  it("unipolar routes discard the sign", () => {
    expect(
      evaluateRoutes({
        routes: [route({ polarity: "unipolar", curve: "expo" })],
        sources: { lfo1: -0.5 },
      })
    ).toEqual({ "filter.cutoff": 0.25 });
  });

  it("scales by the route amount, including negative amounts", () => {
    expect(
      evaluateRoutes({
        routes: [route({ amount: -0.5 })],
        sources: { lfo1: 0.8 },
      })
    ).toEqual({ "filter.cutoff": -0.4 });
  });

  it("sums multiple routes into the same destination", () => {
    const input: EvaluationInput = {
      routes: [
        route({ amount: 0.5 }),
        route({ id: "r2", source: "env1", amount: 0.25 }),
      ],
      sources: { lfo1: 1, env1: 1 },
    };
    expect(evaluateRoutes(input)).toEqual({ "filter.cutoff": 0.75 });
  });

  it("keeps destinations independent", () => {
    const input: EvaluationInput = {
      routes: [
        route(),
        route({ id: "r2", source: "env1", destination: "amp.level" }),
      ],
      sources: { lfo1: 0.5, env1: -0.5 },
    };
    expect(evaluateRoutes(input)).toEqual({
      "filter.cutoff": 0.5,
      "amp.level": -0.5,
    });
  });

  it("does not mutate its input", () => {
    const routes = [route()];
    const sources = { lfo1: 0.5 };
    evaluateRoutes({ routes, sources });
    expect(routes).toEqual([route()]);
    expect(sources).toEqual({ lfo1: 0.5 });
  });
});
