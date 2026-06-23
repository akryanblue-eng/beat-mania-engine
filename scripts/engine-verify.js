import fs from 'fs';

function fail(message) {
  console.error('ENGINE_VERIFY_FAIL:', message);
  process.exit(1);
}

const required = ['src', 'index.html', 'tsconfig.json', 'package.json', 'engine.manifest.json'];
const missing = required.filter((p) => !fs.existsSync(p));

if (missing.length > 0) {
  fail(`missing required files: ${missing.join(', ')}`);
}

const manifest = JSON.parse(fs.readFileSync('engine.manifest.json', 'utf8'));

const missingOutputs = manifest.build.requiredOutputs.filter((file) => !fs.existsSync(file));

if (missingOutputs.length > 0) {
  fail(`missing required build outputs: ${missingOutputs.join(', ')}`);
}

const snapshot = JSON.parse(fs.readFileSync(manifest.artifacts.snapshot, 'utf8'));

if (snapshot.schema !== manifest.artifacts.mustMatchSchema) {
  fail(`snapshot schema mismatch: expected ${manifest.artifacts.mustMatchSchema}, got ${snapshot.schema}`);
}

if (snapshot.snapshotVersion !== 1) {
  fail(`snapshotVersion must be 1, got ${snapshot.snapshotVersion}`);
}

if (typeof snapshot.timing?.bpm !== 'number' || snapshot.timing.bpm <= 0) {
  fail('timing.bpm must be a positive number');
}

if (typeof snapshot.timing?.offsetMs !== 'number') {
  fail('timing.offsetMs must be a number');
}

if (!Array.isArray(snapshot.notes)) {
  fail('notes must be an array');
}

let lastTimeMs = -Infinity;
snapshot.notes.forEach((note, i) => {
  if (!Number.isInteger(note.lane) || note.lane < 0) {
    fail(`notes[${i}].lane must be a non-negative integer`);
  }
  if (!Number.isInteger(note.timeMs) || note.timeMs < 0) {
    fail(`notes[${i}].timeMs must be a non-negative integer`);
  }
  if (note.timeMs < lastTimeMs) {
    fail(`notes[${i}] out of order: timeMs ${note.timeMs} < previous ${lastTimeMs}`);
  }
  lastTimeMs = note.timeMs;
});

console.log(
  JSON.stringify(
    {
      engineVerifyVersion: '0.2.0',
      verdict: 'VALID',
      checkedOutputs: manifest.build.requiredOutputs,
      snapshotSchema: snapshot.schema,
      noteCount: snapshot.notes.length,
    },
    null,
    2,
  ),
);
process.exit(0);
