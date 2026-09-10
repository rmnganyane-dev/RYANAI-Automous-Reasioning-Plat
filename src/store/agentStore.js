import { create } from "zustand";
export const useAgentStore = create((set) => ({
    sessionId: crypto.randomUUID ? crypto.randomUUID() : "default-session",
    messages: [],
    isProcessing: false,
    activeTool: null,
    setSessionId: (sessionId) => set({ sessionId }),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    setProcessing: (isProcessing) => set({ isProcessing }),
    setActiveTool: (activeTool) => set({ activeTool }),
    clearSession: () => set({ messages: [], sessionId: crypto.randomUUID ? crypto.randomUUID() : "default-session" }),
}));
