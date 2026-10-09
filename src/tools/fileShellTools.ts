// src/tools/fileShellTools.ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const WORKSPACE_ROOT = "C:\\Users\\General\\Downloads\\RYANAI Autonomous Reasoning Plat";

/**
 * Tool 1: Workspace File Reader
 */
export const readFileTool = tool(
  async ({ filePath }) => {
    try {
      const safePath = path.resolve(WORKSPACE_ROOT, filePath);
      if (!safePath.startsWith(WORKSPACE_ROOT)) {
        return "Access denied: Path is outside the RyanAI workspace boundary.";
      }
      const content = await fs.readFile(safePath, 'utf-8');
      return `File Content (${filePath}):\n${content}`;
    } catch (error: unknown) {
      return `Failed to read file: ${(error instanceof Error ? error.message : String(error))}`;
    }
  },
  {
    name: "read_workspace_file",
    description: "Reads a file within the RyanAI workspace.",
    schema: z.object({
      filePath: z.string().describe("Relative path to the file from workspace root."),
    }),
  }
);

/**
 * Tool 2: Secure Shell Executor
 */
export const executeShellTool = tool(
  async ({ command }) => {
    try {
      // Restrict dangerous commands
      if (command.includes("rm -rf /") || command.includes("Format-Volume")) {
        return "Execution blocked: Unsafe command pattern detected.";
      }
      const { stdout, stderr } = await execAsync(command, { cwd: WORKSPACE_ROOT });
      return `Command Output:\n${stdout}\n${stderr ? `Errors/Warnings:\n${stderr}` : ''}`;
    } catch (error: unknown) {
      return `Command execution failed: ${(error instanceof Error ? error.message : String(error))}`;
    }
  },
  {
    name: "execute_shell_command",
    description: "Executes a terminal command within the RyanAI workspace directory.",
    schema: z.object({
      command: z.string().describe("The shell command to execute."),
    }),
  }
);

export const fileShellTools = [readFileTool, executeShellTool];