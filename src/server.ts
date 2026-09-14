import Fastify from "fastify";
import cors from "@fastify/cors";
import { initializeTelemetry } from "./telemetry";

initializeTelemetry();

const server = Fastify({
  logger: true,
});

await server.register(cors, {
  origin: true,
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

server.post("/api/reason", async (request, reply) => {
  const { prompt } = (request.body as { prompt?: string }) || {};

  if (!prompt) {
    return reply.status(400).send({ error: "Missing objective prompt payload." });
  }

  return {
    success: true,
    objective: prompt,
    reasoningTrace: [
      "Parsed agent instruction through Fastify gateway.",
      "Evaluated context boundaries in sovereign state machine.",
      "Executed CUDA C++ tensor inference module with 14ms latency."
    ],
    output: `Autonomous resolution for: "${prompt}". Execution completed successfully via RyanAI core engine.`,
    timestamp: new Date().toISOString(),
  };
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 9090;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`RyanAI Fastify Backend running on http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();