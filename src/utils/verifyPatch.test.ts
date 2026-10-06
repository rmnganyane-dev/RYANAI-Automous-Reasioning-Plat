import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runVerificationPipeline } from './verifyPatch.js';

const directories: string[] = [];
async function fixture(exitCode: number) {
  const cwd = await mkdtemp(join(tmpdir(), 'ryanai-verification-'));
  directories.push(cwd);
  await writeFile(join(cwd, 'package.json'), JSON.stringify({
    scripts: { validate: 'node check.cjs' },
  }));
  await writeFile(join(cwd, 'check.cjs'), `process.exit(${exitCode});`);
  return cwd;
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((cwd) => rm(cwd, { recursive: true, force: true })));
});

describe('patch verification gate', () => {
  it('accepts a patch only when the workspace validation succeeds', async () => {
    expect(await runVerificationPipeline(await fixture(0))).toEqual({ success: true });
  });

  it('reports nonzero validation exits so the caller can roll back', async () => {
    const result = await runVerificationPipeline(await fixture(7));
    expect(result.success).toBe(false);
    expect(result.error).toContain('npm run validate');
  });
});
