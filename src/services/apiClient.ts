// File path: ./src/services/apiClient.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface ReasoningRequest {
  prompt: string;
  sessionId: string;
}

export const apiClient = {
  async triggerReasoning(payload: ReasoningRequest, onChunk: (data: any) => void): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/reasoning/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Failed to initiate reasoning stream: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const json = JSON.parse(line.replace("data: ", ""));
            onChunk(json);
          } catch (e) {
            console.error("Failed to parse SSE JSON chunk:", e);
          }
        }
      }
    }
  },
};