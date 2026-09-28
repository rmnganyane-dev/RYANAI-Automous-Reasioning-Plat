// src/engine/selfPatchSkill.ts
import * as fs from "fs/promises";
import * as path from "path";
import { RyanAISandbox } from "./sandbox.js";
import { runVerificationPipeline } from "../utils/verifyPatch.js";

const WORKSPACE_DIR = process.cwd();

export interface PatchRequest {
  filePath: string;
  patchContent: string;
  testScript?: string;
}

export class SelfPatchSkill {
  /**
   * Applies a patch to a workspace file, runs the automated verification pipeline,
   * tests it in the isolated sandbox, and rolls back or confirms based on execution results.
   */
  public static async applyAndVerifyPatch(request: PatchRequest) {
    const targetPath = path.resolve(WORKSPACE_DIR, request.filePath);
    
    // 1. Security check: prevent path traversal
    if (!targetPath.startsWith(WORKSPACE_DIR)) {
      throw new Error("Security violation: Target path is outside the workspace.");
    }

    // 2. Backup current file state for rollback
    let originalContent = "";
    let fileExists = true;
    try {
      originalContent = await fs.readFile(targetPath, "utf-8");
    } catch {
      fileExists = false;
    }

    try {
      // 3. Write the patch/update
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, request.patchContent, "utf-8");

      // 4. Run automated verification pipeline (build, type-check, tests)
      const verification = await runVerificationPipeline();
      if (!verification.success) {
        // Rollback if type-check or tests fail
        if (fileExists) {
          await fs.writeFile(targetPath, originalContent, "utf-8");
        } else {
          await fs.unlink(targetPath).catch(() => {});
        }
        return {
          status: "rolled_back",
          error: `Patch caused build/test failure: ${verification.error}`,
        };
      }

      // 5. If an additional test script or validation payload is provided, run it in the sandbox
      if (request.testScript) {
        const sandboxResult = await RyanAISandbox.executeInSandbox(
          request.testScript,
          `verify_${path.basename(request.filePath)}`
        );

        if (!sandboxResult.success) {
          // Rollback if verification fails
          if (fileExists) {
            await fs.writeFile(targetPath, originalContent, "utf-8");
          } else {
            await fs.unlink(targetPath).catch(() => {});
          }
          return {
            status: "rolled_back",
            error: sandboxResult.error || "Sandbox verification failed.",
          };
        }
      }

      return {
        status: "success",
        message: `Successfully updated and verified ${request.filePath}`,
      };
    } catch (error: unknown) {
      // Rollback on unexpected failure
      if (fileExists) {
        await fs.writeFile(targetPath, originalContent, "utf-8").catch(() => {});
      } else {
        await fs.unlink(targetPath).catch(() => {});
      }
      return {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}