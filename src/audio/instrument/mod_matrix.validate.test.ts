import { describe, expect, it } from "vitest";
import { addRoute, removeRoute, updateRoute } from "./mod_matrix.validate";
import type { ModRoute } from "./mod_matrix.types";

function route(overrides: Partial<ModRoute> = {}): ModRoute {
  return {
    id: "r1",
    source: "lfo1",
    destination: "filter.cutoff",
    amount: 0.5,
    curve: "linear",
    polarity: "bipolar",
    enabled: true,
    ...overrides,
  };
}

describe("addRoute", () => {
  it("adds a valid route without mutating the input list", () => {
    const routes: ModRoute[] = [];
    const result = addRoute(routes, route());
    expect(result).toEqual({ ok: true, value: [route()] });
    expect(routes).toEqual([]);
  });

  it("rejects an empty id as duplicate-id", () => {
    expect(addRoute([], route({ id: "" }))).toEqual({
      ok: false,
      reason: "duplicate-id",
    });
  });

  it("rejects a reused id as duplicate-id", () => {
    expect(addRoute([route()], route({ destination: "amp.level" }))).toEqual({
      ok: false,
      reason: "duplicate-id",
    });
  });

  it("rejects unknown source / destination / curve / polarity", () => {
    const bad = (r: ModRoute) => addRoute([], r);
    expect(bad(route({ source: "nope" as ModRoute["source"] }))).toEqual({
      ok: false,
      reason: "invalid-source",
    });
    expect(
      bad(route({ destination: "nope" as ModRoute["destination"] }))
    ).toEqual({ ok: false, reason: "invalid-destination" });
    expect(bad(route({ curve: "nope" as ModRoute["curve"] }))).toEqual({
      ok: false,
      reason: "invalid-curve",
    });
    expect(bad(route({ polarity: "nope" as ModRoute["polarity"] }))).toEqual({
      ok: false,
      reason: "invalid-polarity",
    });
  });

  it("rejects out-of-range and non-finite amounts", () => {
    for (const amount of [1.01, -1.01, Number.NaN, Infinity, -Infinity]) {
      expect(addRoute([], route({ amount }))).toEqual({
        ok: false,
        reason: "invalid-amount",
      });
    }
    for (const amount of [-1, 0, 1]) {
      expect(addRoute([], route({ amount })).ok).toBe(true);
    }
  });

  it("rejects a second active route on the same source/destination pair", () => {
    expect(addRoute([route()], route({ id: "r2" }))).toEqual({
      ok: false,
      reason: "duplicate-route",
    });
  });

  it("allows a disabled duplicate pair", () => {
    const result = addRoute([route()], route({ id: "r2", enabled: false }));
    expect(result.ok).toBe(true);
  });
});

describe("updateRoute", () => {
  it("updates fields on an existing route", () => {
    const result = updateRoute([route()], "r1", { amount: -0.25 });
    expect(result).toEqual({ ok: true, value: [route({ amount: -0.25 })] });
  });

  it("reports route-not-found for an unknown id", () => {
    expect(updateRoute([route()], "missing", { amount: 0 })).toEqual({
      ok: false,
      reason: "route-not-found",
    });
  });

  it("validates patched fields", () => {
    expect(updateRoute([route()], "r1", { amount: 2 })).toEqual({
      ok: false,
      reason: "invalid-amount",
    });
  });

  it("cannot create a duplicate active pair by re-targeting", () => {
    const routes = [
      route(),
      route({ id: "r2", destination: "amp.level" }),
    ];
    expect(
      updateRoute(routes, "r2", { destination: "filter.cutoff" })
    ).toEqual({ ok: false, reason: "duplicate-route" });
  });

  it("cannot create a duplicate active pair by enabling", () => {
    const routes = [route(), route({ id: "r2", enabled: false })];
    expect(updateRoute(routes, "r2", { enabled: true })).toEqual({
      ok: false,
      reason: "duplicate-route",
    });
  });

  it("updating a route in place does not conflict with itself", () => {
    expect(updateRoute([route()], "r1", { amount: 1 }).ok).toBe(true);
  });
});

describe("removeRoute", () => {
  it("removes an existing route", () => {
    expect(removeRoute([route()], "r1")).toEqual({ ok: true, value: [] });
  });

  it("reports route-not-found for an unknown id", () => {
    expect(removeRoute([route()], "missing")).toEqual({
      ok: false,
      reason: "route-not-found",
    });
  });
});
