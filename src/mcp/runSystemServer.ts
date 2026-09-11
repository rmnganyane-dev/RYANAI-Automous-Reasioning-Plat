import { SystemMcpServer } from "./systemServer.js";

const mcpServer = new SystemMcpServer();

mcpServer.start().catch((err) => {
  console.error("Fatal error starting SystemMcpServer:", err);
  process.exit(1);
});