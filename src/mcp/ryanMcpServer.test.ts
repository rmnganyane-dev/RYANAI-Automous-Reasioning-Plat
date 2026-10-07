import { beforeEach, describe, expect, it, vi } from "vitest";
import { RyanMCPServer } from "./ryanMcpServer.js";
import { SelfPatchSkill } from "../engine/selfPatchSkill.js";

type Handler = (request: {
  params: { name: string; arguments: Record<string, string> };
}) => Promise<{ isError?: boolean }>;
const { handlers } = vi.hoisted(() => ({ handlers: [] as Handler[] }));
vi.mock("@modelcontextprotocol/sdk/server/index.js", () => ({
  Server: class {
    setRequestHandler(_schema: unknown, handler: Handler) {
      handlers.push(handler);
    }
  },
}));
vi.mock("../engine/selfPatchSkill.js", () => ({
  SelfPatchSkill: { applyAndVerifyPatch: vi.fn() },
}));
vi.mock("../engine/sandbox.js", () => ({ RyanAISandbox: {} }));
vi.mock("../tools/systemTools.js", () => ({ systemDiagnosticsTool: {} }));

beforeEach(() => {
  handlers.length = 0;
  vi.clearAllMocks();
});
describe("MCP patch result reporting", () => {
  it.each(["rejected", "conflict", "failed", "success"])(
    "reports %s accurately to the calling agent",
    async (status) => {
      vi.mocked(SelfPatchSkill.applyAndVerifyPatch).mockResolvedValue({
        status,
        error: "fixture",
      });
      new RyanMCPServer();
      const result = await handlers[1]({
        params: {
          name: "self_patch_workspace",
          arguments: { filePath: "src/app.ts", patchContent: "candidate" },
        },
      });
      expect(result.isError).toBe(status !== "success");
    },
  );
});
