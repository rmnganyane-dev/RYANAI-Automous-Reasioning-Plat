// File path: ./src/api/mcpRoute.ts
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export async function registerMcpRoutes(fastify) {
    fastify.post("/api/mcp/execute", async (req, reply) => {
        const { tool, arguments: args } = req.body;
        if (tool === "check_system_logs") {
            try {
                const container = args?.container || "ryanai-runtime";
                const { stdout } = await execAsync(`docker logs --tail 50 ${container}`);
                return reply.send({ success: true, result: stdout });
            }
            catch (err) {
                return reply.code(500).send({ success: false, error: err.message });
            }
        }
        return reply.code(404).send({ success: false, error: `Unknown MCP tool: ${tool}` });
    });
}
