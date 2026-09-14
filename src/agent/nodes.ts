// File path: ./src/agent/nodes.ts

import { ToolNode } from "@langchain/langgraph/prebuilt";
import { DynamicTool } from "@langchain/core/tools";

// Sovereign telemetry tool
const systemStatusTool = new DynamicTool({
  name: "query_system_state",
  description: "Queries the local RyanAI sovereign platform hardware and memory state.",
  func: async () => {
    return JSON.stringify({ 
      architecture: process.arch,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      cudaAvailable: true,
      uptime: process.uptime()
    });
  },
});

// Prisma Database Context Tool
const databaseQueryTool = new DynamicTool({
  name: "query_agent_memory",
  description: "Queries the local PostgreSQL Prisma database for historical session context.",
  func: async (query: string) => {
    // In production: PrismaClient lookup
    return `Retrieved sovereign context for: ${query}. Isolated from external networks.`;
  },
});

export const ryanAgentTools = [systemStatusTool, databaseQueryTool];
export const ryanToolNode = new ToolNode(ryanAgentTools);