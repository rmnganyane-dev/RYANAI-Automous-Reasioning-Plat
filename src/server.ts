import Fastify from "fastify";
import { registerMcpRoutes } from "./api/mcpRoute.js";

const server = Fastify({ 
  logger: true 
});

// Register MCP API routes
server.register(registerMcpRoutes);

// Health check endpoint
server.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || "0.0.0.0";
    
    await server.listen({ port, host });
    console.log(`RyanAI runtime server active on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();