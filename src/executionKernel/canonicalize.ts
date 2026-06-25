import type { ExecutionTrace } from './types';
import { canonicalHash } from '../shared/hash';

export function canonicalizeTrace(trace: ExecutionTrace): string {
  const { traceHash, ...withoutHash } = trace;
  void traceHash;
  return canonicalHash(withoutHash);
}
