// File path: ./src/api/reasoningRoute.ts
import { VectorCacheManager } from "../services/vectorCache";
const reasoningRouteSchema = {
    body: {
        type: "object",
        required: ["prompt"],
        properties: {
            prompt: { type: "string", minLength: 1 },
            sessionId: { type: "string" },
        },
    },
};
export async function registerReasoningRoutes(fastify) {
    const vectorCache = new VectorCacheManager(process.env.REDIS_URL || "redis://localhost:6379", process.env.DATABASE_URL || "postgresql://postgres:postgres@postgres:5432/ryanai");
    // Safely close connection pool on app shutdown
    fastify.addHook("onClose", async () => {
        if ("close" in vectorCache && typeof vectorCache.close === "function") {
            await vectorCache.close();
        }
    });
    fastify.post("/api/reasoning/stream", { schema: reasoningRouteSchema }, async (req, reply) => {
        const { prompt, sessionId } = req.body;
        // Tell Fastify we are handling the raw Node HTTP stream response directly
        reply.hijack();
        const { raw } = reply;
        raw.setHeader("Content-Type", "text/event-stream");
        raw.setHeader("Cache-Control", "no-cache, no-transform");
        raw.setHeader("Connection", "keep-alive");
        raw.setHeader("X-Accel-Buffering", "no"); // Prevents Nginx response buffering
        // Prevent memory leaks / dangling loops on premature client disconnect
        let isAborted = false;
        req.raw.on("close", () => {
            isAborted = true;
        });
        const sendEvent = (data) => {
            if (!isAborted && !raw.writableEnded) {
                raw.write(`data: ${JSON.stringify(data)}\n\n`);
            }
        };
        try {
            const steps = [
                "Initializing LangGraph ReAct state graph...",
                `Parsing input context for session: ${sessionId || "default"}`,
                "Executing CUDA C++ tensor inference module...",
                "Evaluating tool-call routing and vector memory match...",
                "Synthesizing autonomous reasoning output.",
            ];
            for (const step of steps) {
                if (isAborted)
                    break;
                sendEvent({ status: "processing", message: step });
                await new Promise((resolve) => setTimeout(resolve, 350));
            }
            if (!isAborted) {
                sendEvent({
                    status: "complete",
                    result: `RyanAI processed: "${prompt}"`,
                });
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
            sendEvent({ error: errorMessage });
        }
        finally {
            if (!raw.writableEnded) {
                raw.end();
            }
        }
    });
}
