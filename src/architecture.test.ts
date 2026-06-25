import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function listFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') ? [full] : [];
  });
}

describe('execution kernel boundary', () => {
  it('never imports the causal index layer (truth must not depend on its own interpretation)', () => {
    const kernelDir = path.join(__dirname, 'executionKernel');
    const offenders = listFiles(kernelDir).filter((file) =>
      fs.readFileSync(file, 'utf8').includes('causalIndex'),
    );
    expect(offenders).toEqual([]);
  });
});
