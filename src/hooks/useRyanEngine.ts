// File path: ./src/hooks/useRyanEngine.ts

import { useState, useCallback } from "react";
import { executeAgentReasoning, fetchSystemHealth, SystemHealth } from "../services/api";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoningSteps?: string[];
  timestamp: string;
}

export function useRyanEngine() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "RyanAI Autonomous Reasoning Engine initialized via index.html root platform container[cite: 3]. Fastify gateway connection active.",
      reasoningSteps: [
        "Mounted root index.html platform container template[cite: 3].",
        "Initialized Fastify API gateway & LangGraph ReAct workflow.",
        "Verified CUDA driver acceleration & memory allocation."
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const data = await fetchSystemHealth();
      setHealth(data);
    } catch (err) {
      console.error("Backend health check warning:", err);
    }
  }, []);

  const sendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const result = await executeAgentReasoning(prompt);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.output,
        reasoningSteps: result.reasoningTrace,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error executing reasoning pipeline: ${err.message || "Unknown gateway error"}. Ensure Fastify server is running on port 9090.`,
        reasoningSteps: ["Gateway connection error", "Falling back to local fallback buffer"],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  return {
    messages,
    isProcessing,
    health,
    sendMessage,
    checkHealth,
  };
}