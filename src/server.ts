// File path: ./src/server.ts

import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import { initializeTelemetry } from "./telemetry";
import { defaultEngine } from "./agent/reactGraph";

initializeTelemetry();

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

await server.register(cors, {
  origin: process.env.NODE_ENV === "production" ? false : "*",
});

interface EngineCommandBody {
  command: string;
  targetModule?: string;
}

interface ReasonRequestBody {
  prompt: string;
}

server.post<{ Body: EngineCommandBody }>('/api/engine/command', async (req: FastifyRequest<{ Body: EngineCommandBody }>, reply: FastifyReply) => {
  const { command, targetModule } = req.body;
  return reply.send({ status: 'success', command, targetModule });
});

server.get("/api/health", async (_request: FastifyRequest, _reply: FastifyReply) => {
  return {
    status: "ONLINE",
    engine: "RyanAI Sovereign Autonomous Reasoning Platform",
    architect: "Ntsiyeni Ganyane",
    cudaActive: true,
    activeGraph: "ReAct-v4",
    timestamp: new Date().toISOString(),
  };
});

server.post("/api/reason", async (request: FastifyRequest<{ Body: ReasonRequestBody }>, reply: FastifyReply) => {
  const { prompt } = request.body || {};

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return reply.status(400).send({ error: "Missing or invalid objective prompt payload." });
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

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 9090;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`[RyanAI Gateway] Server listening on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();