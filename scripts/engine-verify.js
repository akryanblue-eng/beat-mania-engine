import fs from 'fs';

const required = ['src', 'index.html', 'tsconfig.json', 'package.json', 'engine.manifest.json'];
const missing = required.filter((p) => !fs.existsSync(p));

if (missing.length > 0) {
  console.error('ENGINE_VERIFY_FAIL: missing required files:', missing);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync('engine.manifest.json', 'utf8'));

const missingOutputs = manifest.build.requiredOutputs.filter((file) => !fs.existsSync(file));

if (missingOutputs.length > 0) {
  console.error('ENGINE_VERIFY_FAIL: missing required build outputs:', missingOutputs);
  process.exit(1);
}

const snapshot = JSON.parse(fs.readFileSync(manifest.artifacts.snapshot, 'utf8'));

if (snapshot.schema !== manifest.artifacts.mustMatchSchema) {
  console.error(
    'ENGINE_VERIFY_FAIL: snapshot schema mismatch:',
    `expected ${manifest.artifacts.mustMatchSchema}, got ${snapshot.schema}`,
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      engineVerifyVersion: '0.1.0',
      verdict: 'VALID',
      checkedOutputs: manifest.build.requiredOutputs,
      snapshotSchema: snapshot.schema,
    },
    null,
    2,
  ),
);
process.exit(0);
