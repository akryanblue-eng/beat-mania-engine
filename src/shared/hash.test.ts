import { describe, expect, it } from 'vitest';
import { canonicalHash, stableStringify } from './hash';

describe('stableStringify', () => {
  it('sorts object keys regardless of insertion order', () => {
    expect(stableStringify({ b: 1, a: 2 })).toEqual(stableStringify({ a: 2, b: 1 }));
    expect(stableStringify({ a: 2, b: 1 })).toEqual('{"a":2,"b":1}');
  });

  it('sorts nested object keys', () => {
    expect(stableStringify({ z: { b: 1, a: 2 } })).toEqual('{"z":{"a":2,"b":1}}');
  });

  it('preserves array order (arrays are ordered data, not sorted)', () => {
    expect(stableStringify([2, 1])).not.toEqual(stableStringify([1, 2]));
  });

  it('rejects NaN and Infinity instead of silently collapsing them to null', () => {
    expect(() => stableStringify(NaN)).toThrow();
    expect(() => stableStringify(Infinity)).toThrow();
    expect(() => stableStringify(-Infinity)).toThrow();
    expect(() => stableStringify({ error: NaN })).toThrow();
  });

  it('does not confuse null with non-finite numbers', () => {
    expect(stableStringify(null)).toEqual('null');
  });

  it('treats an explicit undefined field the same as an omitted field', () => {
    expect(stableStringify({ a: 1, b: undefined })).toEqual(stableStringify({ a: 1 }));
  });

  it('is stable across a JSON serialize/deserialize round-trip, including explicit-undefined fields', () => {
    const original = { t: 0, kind: 'meta', metaType: 'start', data: undefined, seq: 0 };
    const roundTripped = JSON.parse(JSON.stringify(original));
    expect(stableStringify(roundTripped)).toEqual(stableStringify(original));
    expect(canonicalHash(roundTripped)).toEqual(canonicalHash(original));
  });
});

describe('canonicalHash', () => {
  it('is deterministic for equivalent objects regardless of key order', () => {
    expect(canonicalHash({ b: 1, a: 2 })).toEqual(canonicalHash({ a: 2, b: 1 }));
  });

  it('differs for semantically different values', () => {
    expect(canonicalHash({ a: 1 })).not.toEqual(canonicalHash({ a: 2 }));
  });
});
