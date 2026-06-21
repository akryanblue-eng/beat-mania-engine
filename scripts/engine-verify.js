import fs from 'fs';

const required = ['src', 'index.html', 'tsconfig.json', 'package.json'];
const missing = required.filter((p) => !fs.existsSync(p));

if (missing.length > 0) {
  console.error('ENGINE_VERIFY_FAIL: missing required files:', missing);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      engineVerifyVersion: '0.0-stub',
      verdict: 'VALID',
      note: 'Stub verifier: structural presence only. Replace with real engine invariants as they are defined.',
    },
    null,
    2,
  ),
);
process.exit(0);
