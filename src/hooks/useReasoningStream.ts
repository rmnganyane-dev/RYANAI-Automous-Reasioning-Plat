import { useState, useCallback } from "react";
import { apiClient } from "../services/apiClient";
import { useAgentStore } from "../store/agentStore";

interface StreamChunk {
  status?: "processing" | "complete" | string;
  message?: string;
  result?: string;
  error?: string;
  [key: string]: unknown;
}

export function useReasoningStream() {
  const { sessionId, addMessage, setProcessing, setActiveTool } = useAgentStore();
  const [error, setError] = useState<string | null>(null);

  const runReasoning = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    setError(null);
    setProcessing(true);
    addMessage({ role: "user", content: prompt, timestamp: new Date().toISOString() });

    try {
      await apiClient.triggerReasoning({ prompt, sessionId }, (chunk: StreamChunk) => {
        if (chunk.status === "processing") {
          setActiveTool(chunk.message || "Executing ReAct step...");
          addMessage({ role: "system", content: chunk.message || "", timestamp: new Date().toISOString() });
        } else if (chunk.status === "complete") {
          setActiveTool(null);
          addMessage({ role: "assistant", content: chunk.result || "", timestamp: new Date().toISOString() });
        } else if (chunk.error) {
          setError(chunk.error);
        }
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to execute reasoning cycle";
      setError(errorMessage);
    } finally {
      setProcessing(false);
      setActiveTool(null);
    }
  }, [sessionId, addMessage, setProcessing, setActiveTool]);

  return { runReasoning, error };
}