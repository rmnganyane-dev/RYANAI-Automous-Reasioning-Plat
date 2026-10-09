import { applyWorkspacePatch } from "../utils/workspacePatch.js";

export interface PatchRequest {
  filePath: string;
  patchContent: string;
  testScript?: string;
}

export class SelfPatchSkill {
  /**
   * Stage and verify replacement file content in the current working directory.
   * The directory must be a Linux Git repository root. Returns the success,
   * rejected, conflict, or failed result from {@link applyWorkspacePatch}.
   */
  public static async applyAndVerifyPatch(request: PatchRequest) {
    return applyWorkspacePatch(process.cwd(), request);
  }
}
