// File path: ./src/mcp/systemServer.ts

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const createSystemMcpServer = () => {
  const server = new Server(
    { name: "ryanai-system-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
        name: "check_system_logs",
        description: "Retrieve recent Docker container logs for diagnostics",
        inputSchema: { type: "object", properties: { container: { type: "string" } } }
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "check_system_logs") {
      const container = (request.params.arguments?.container as string) || "ryanai-runtime";
      const { stdout } = await execAsync(`docker logs --tail 50 ${container}`);
      return { content: [{ type: "text", text: stdout }] };
    }
    throw new Error("Unknown tool");
  });

  return server;
};