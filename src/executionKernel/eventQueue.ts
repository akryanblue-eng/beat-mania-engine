import type { InputEvent } from './types';

const EPS = 1e-6;

function priority(e: InputEvent): number {
  switch (e.kind) {
    case 'off':
      return 0;
    case 'on':
      return 1;
    case 'meta':
      return 2;
  }
}

export function sortEvents(events: InputEvent[]): InputEvent[] {
  return [...events].sort((a, b) => {
    if (a.t !== b.t) return a.t - b.t;
    const p = priority(a) - priority(b);
    if (p !== 0) return p;
    return a.seq - b.seq;
  });
}

export function drainEvents(
  events: InputEvent[],
  cursor: number,
  untilT: number,
): { batch: InputEvent[]; nextCursor: number } {
  const batch: InputEvent[] = [];
  while (cursor < events.length && events[cursor].t <= untilT + EPS) {
    batch.push(events[cursor]);
    cursor++;
  }
  return { batch, nextCursor: cursor };
}
