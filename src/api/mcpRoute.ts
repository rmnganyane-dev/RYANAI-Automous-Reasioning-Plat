// File path: ./src/api/mcpRoute.ts

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface McpPayload {
  tool: string;
  arguments?: {
    container?: string;
  };
}

export async function registerMcpRoutes(fastify: FastifyInstance) {
  fastify.post("/api/mcp/execute", async (req: FastifyRequest<{ Body: McpPayload }>, reply: FastifyReply) => {
    const { tool, arguments: args } = req.body;

    if (tool === "check_system_logs") {
      try {
        const container = args?.container || "ryanai-runtime";
        const { stdout } = await execAsync(`docker logs --tail 50 ${container}`);
        return reply.send({ success: true, result: stdout });
      } catch (err: any) {
        return reply.code(500).send({ success: false, error: err.message });
      }
    }

    return reply.code(404).send({ success: false, error: `Unknown MCP tool: ${tool}` });
  });
}