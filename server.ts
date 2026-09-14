// File path: ./server.ts

import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import { defaultEngine } from "./src/agent/reactGraph";

const server = Fastify({
  logger: true,
});

server.get("/api/health", async () => {
  return {
    status: "ONLINE",
    engine: "RyanAI Sovereign Autonomous Reasoning Platform",
    architect: "Ntsiyeni Ganyane",
    cudaActive: true,
    activeGraph: "ReAct-v4",
    timestamp: new Date().toISOString(),
  };
});

// Configure CORS for the Vite frontend shell
server.register(cors, {
  origin: process.env.NODE_ENV === "production" ? false : "*",
});

interface ReasonRequestBody {
  prompt?: string;
}

// Health check endpoint
server.get("/api/health", async (_request: FastifyRequest, _reply: FastifyReply) => {
  return {
    status: "online",
    engine: "RyanAI Sovereign Engine",
    architect: "Ntsiyeni Ganyane",
    cudaActive: true,
    activeGraph: "ReAct-v2.1",
    timestamp: new Date().toISOString(),
  };
});

// Agent Reasoning execution endpoint
server.post("/api/reason", async (request: FastifyRequest<{ Body: ReasonRequestBody }>, reply: FastifyReply) => {
  const { prompt } = request.body || {};

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return reply.status(400).send({ error: "Objective prompt is required." });
  }

  try {
    request.log.info(`Dispatching objective to RyanReActEngine: ${prompt}`);
    
    // Execute the LangGraph ReAct reasoning pipeline
    const agentState = await defaultEngine.execute(prompt);

    return {
      success: true,
      objective: prompt,
      reasoningTrace: agentState.steps,
      output: agentState.output,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal sovereign engine failure.";
    request.log.error(error);
    return reply.status(500).send({ error: errorMessage });
  }
});

// Start the Fastify API Gateway
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "9090", 10);
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`[RyanAI Gateway] Server listening on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();