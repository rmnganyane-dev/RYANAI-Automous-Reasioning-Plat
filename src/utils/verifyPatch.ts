import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/** Run the same validation gate used in CI before accepting a workspace patch. */
export async function runVerificationPipeline(cwd = process.cwd()): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await execAsync('npm run validate', {
      cwd,
      timeout: 300_000,
      maxBuffer: 10 * 1024 * 1024,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
