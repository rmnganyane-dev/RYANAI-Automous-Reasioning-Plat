import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class SystemMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "ryanai-system-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_container_logs",
          description: "Retrieve recent Docker container logs for diagnostics",
          inputSchema: {
            type: "object",
            properties: {
              container: { 
                type: "string", 
                description: "Docker container name or ID" 
              },
            },
            required: ["container"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const args = request.params.arguments as { container?: string };
      const container = args?.container || "ryanai-runtime";

      // Secure input verification for container name parameter
      if (!/^[a-zA-Z0-9_.-]+$/.test(container)) {
        return {
          content: [
            {
              type: "text",
              text: `Invalid container name format: ${container}`,
            },
          ],
          isError: true,
        };
      }

      try {
        const { stdout, stderr } = await execAsync(`docker logs --tail 50 ${container}`);
        const output = stdout || stderr || `No logs found for container: ${container}`;
        return {
          content: [
            {
              type: "text",
              text: output,
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching logs for container ${container}: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  public async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}