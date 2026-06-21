import fs from 'fs';

const snapshot = {
  schema: 'beat-mania-engine.engine-snapshot.v0',
  engineVersion: '0.1.0',
  state: {
    seed: 1337,
    tick: 0,
  },
};

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/engine.snapshot.json', JSON.stringify(snapshot, null, 2));
