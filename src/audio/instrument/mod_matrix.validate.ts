// The modulation matrix exposes mutations; it does not persist, publish, or audit them.

import {
  MOD_CURVES,
  MOD_DESTINATIONS,
  MOD_POLARITIES,
  MOD_SOURCES,
  type ModRoute,
  type MutationResult,
  type RouteMutationError,
} from "./mod_matrix.types";

function fail(reason: RouteMutationError): MutationResult<never> {
  return { ok: false, reason };
}

function fieldError(route: ModRoute): RouteMutationError | null {
  if (!(MOD_SOURCES as readonly string[]).includes(route.source)) {
    return "invalid-source";
  }
  if (!(MOD_DESTINATIONS as readonly string[]).includes(route.destination)) {
    return "invalid-destination";
  }
  if (!Number.isFinite(route.amount) || route.amount < -1 || route.amount > 1) {
    return "invalid-amount";
  }
  if (!(MOD_CURVES as readonly string[]).includes(route.curve)) {
    return "invalid-curve";
  }
  if (!(MOD_POLARITIES as readonly string[]).includes(route.polarity)) {
    return "invalid-polarity";
  }
  return null;
}

// Beat Mania v1: at most one *active* route per source/destination pair.
function hasActivePairConflict(
  routes: readonly ModRoute[],
  candidate: ModRoute
): boolean {
  if (!candidate.enabled) return false;
  return routes.some(
    (r) =>
      r.enabled &&
      r.id !== candidate.id &&
      r.source === candidate.source &&
      r.destination === candidate.destination
  );
}

export function addRoute(
  routes: readonly ModRoute[],
  route: ModRoute
): MutationResult<ModRoute[]> {
  if (route.id.length === 0 || routes.some((r) => r.id === route.id)) {
    return fail("duplicate-id");
  }
  const invalid = fieldError(route);
  if (invalid !== null) return fail(invalid);
  if (hasActivePairConflict(routes, route)) return fail("duplicate-route");
  return { ok: true, value: [...routes, route] };
}

export function updateRoute(
  routes: readonly ModRoute[],
  id: string,
  patch: Partial<Omit<ModRoute, "id">>
): MutationResult<ModRoute[]> {
  const index = routes.findIndex((r) => r.id === id);
  if (index === -1) return fail("route-not-found");
  const updated: ModRoute = { ...routes[index], ...patch, id };
  const invalid = fieldError(updated);
  if (invalid !== null) return fail(invalid);
  if (hasActivePairConflict(routes, updated)) return fail("duplicate-route");
  const value = routes.slice();
  value[index] = updated;
  return { ok: true, value };
}

export function removeRoute(
  routes: readonly ModRoute[],
  id: string
): MutationResult<ModRoute[]> {
  if (!routes.some((r) => r.id === id)) return fail("route-not-found");
  return { ok: true, value: routes.filter((r) => r.id !== id) };
}
