export function stableStringify(value: unknown): string {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new Error(`stableStringify: non-finite number (${value}) cannot be hashed deterministically`);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // Omit undefined-valued keys so an explicit `field: undefined` hashes
    // identically to an omitted field, matching JSON.stringify's behavior
    // and keeping the hash stable across a serialize/deserialize round-trip.
    const keys = Object.keys(obj)
      .filter((k) => obj[k] !== undefined)
      .sort();
    const body = keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',');
    return `{${body}}`;
  }
  return JSON.stringify(value);
}

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// Pure-JS hash so this runs identically in Node (build pipeline) and the
// browser bundle without pulling in node:crypto. Swap for SHA-256 later if a
// cryptographic guarantee is needed; determinism is what v0.1 requires.
export function canonicalHash(value: unknown): string {
  return fnv1a(stableStringify(value));
}
