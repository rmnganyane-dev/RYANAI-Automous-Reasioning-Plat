// src/index.ts
import { RyanMCPServer } from "./mcp/ryanMcpServer.js";
// import { buildFastifyApp } from "./server.js";

async function main() {
  try {
    // 1. Initialize and start the MCP Server on stdio
    const mcpServer = new RyanMCPServer();
    await mcpServer.start();

    // 2. (Optional) Initialize your Fastify HTTP/WebSocket gateway here
    // const app = await buildFastifyApp();
    // await app.listen({ port: process.env.PORT ? parseInt(process.env.PORT) : 3000, host: '0.0.0.0' });
    // console.log(`[RyanAI Gateway] Server running...`);

  } catch (error) {
    console.error("[Fatal Error during startup]:", error);
    process.exit(1);
  }
}

main();