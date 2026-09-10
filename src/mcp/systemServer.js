import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export class SystemMcpServer {
    server;
    constructor() {
        this.server = new Server({
            name: "ryanai-system-server",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
    }
    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "get_container_logs",
                    description: "Retrieve recent Docker container logs for diagnostics",
                    inputSchema: {
                        type: "object",
                        properties: {
                            container: { type: "string" },
                        },
                        required: ["container"],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const args = request.params.arguments;
            const container = args?.container || "ryanai-runtime";
            try {
                const { stdout } = await execAsync(`docker logs --tail 50 ${container}`);
                return {
                    content: [
                        {
                            type: "text",
                            text: stdout || `No logs found for container: ${container}`,
                        },
                    ],
                };
            }
            catch (err) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error fetching logs for container ${container}: ${err.message}`,
                        },
                    ],
                };
            }
        });
    }
    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}
