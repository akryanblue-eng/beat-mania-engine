import fs from 'fs';

const snapshot = {
  schema: 'beat-mania-engine.engine-snapshot.v1',
  snapshotVersion: 1,
  engineVersion: '0.1.0',
  generatedAt: new Date().toISOString(),
  timing: {
    bpm: 120,
    offsetMs: 0,
  },
  notes: [],
};

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/engine.snapshot.json', JSON.stringify(snapshot, null, 2));
