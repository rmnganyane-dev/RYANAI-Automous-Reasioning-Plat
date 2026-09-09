// File path: ./src/store/agentStore.ts

import { create } from "zustand";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

interface AgentState {
  sessionId: string;
  messages: Message[];
  isProcessing: boolean;
  activeTool: string | null;
  setSessionId: (id: string) => void;
  addMessage: (message: Message) => void;
  setProcessing: (status: boolean) => void;
  setActiveTool: (tool: string | null) => void;
  clearSession: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  sessionId: crypto.randomUUID(),
  messages: [],
  isProcessing: false,
  activeTool: null,
  setSessionId: (sessionId) => set({ sessionId }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setActiveTool: (activeTool) => set({ activeTool }),
  clearSession: () => set({ messages: [], sessionId: crypto.randomUUID() }),
}));