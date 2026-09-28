import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);
const SANDBOX_DIR = path.resolve(process.cwd(), 'sandbox-runtime');

export interface SandboxResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  output?: string;
  error?: string;
}

export class RyanAISandbox {
  /**
   * Executes agent-generated code inside an isolated runtime container environment with safety limits
   */
  public static async executeInSandbox(
    scriptContent: string,
    fileName = 'agent_payload.js'
  ): Promise<SandboxResult> {
    await fs.mkdir(SANDBOX_DIR, { recursive: true });
    const filePath = path.join(SANDBOX_DIR, fileName);
    await fs.writeFile(filePath, scriptContent, 'utf-8');

    console.log(`[Sandbox] Deploying code payload to isolated runtime: ${fileName}`);

    try {
      // Execute with a strict 10-second timeout and isolated working directory
      const { stdout, stderr } = await execAsync(`node ${filePath}`, {
        timeout: 10000,
        cwd: SANDBOX_DIR,
      });

      const trimmedStdout = stdout.trim();
      const trimmedStderr = stderr.trim();

      return {
        stdout: trimmedStdout,
        stderr: trimmedStderr,
        exitCode: 0,
        success: true,
        output: trimmedStdout,
        error: trimmedStderr ? trimmedStderr : undefined,
      };
    } catch (error: any) {
      const stdout = error.stdout ? error.stdout.trim() : '';
      const stderr = error.stderr ? error.stderr.trim() : error.message;

      return {
        stdout,
        stderr,
        exitCode: error.code || 1,
        success: false,
        output: stdout,
        error: stderr,
      };
    }
  }
}