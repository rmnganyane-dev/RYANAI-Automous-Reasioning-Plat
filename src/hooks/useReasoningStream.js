// File path: ./src/hooks/useReasoningStream.ts
import { useState, useCallback } from "react";
import { apiClient } from "../services/apiClient";
import { useAgentStore } from "../store/agentStore";
export function useReasoningStream() {
    const { sessionId, addMessage, setProcessing, setActiveTool } = useAgentStore();
    const [error, setError] = useState(null);
    const runReasoning = useCallback(async (prompt) => {
        if (!prompt.trim())
            return;
        setError(null);
        setProcessing(true);
        addMessage({ role: "user", content: prompt, timestamp: new Date().toISOString() });
        try {
            await apiClient.triggerReasoning({ prompt, sessionId }, (chunk) => {
                if (chunk.status === "processing") {
                    setActiveTool(chunk.message || "Executing ReAct step...");
                    addMessage({ role: "system", content: chunk.message, timestamp: new Date().toISOString() });
                }
                else if (chunk.status === "complete") {
                    setActiveTool(null);
                    addMessage({ role: "assistant", content: chunk.result, timestamp: new Date().toISOString() });
                }
                else if (chunk.error) {
                    setError(chunk.error);
                }
            });
        }
        catch (err) {
            setError(err.message || "Failed to execute reasoning cycle");
        }
        finally {
            setProcessing(false);
            setActiveTool(null);
        }
    }, [sessionId, addMessage, setProcessing, setActiveTool]);
    return { runReasoning, error };
}
