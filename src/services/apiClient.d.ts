// File path: ./src/services/apiClient.d.ts

export interface ReasoningRequest {
  prompt: string;
  sessionId: string;
  [key: string]: unknown;
}

export interface ReasoningChunk {
  status?: string;
  message?: string;
  result?: string;
  error?: string;
  [key: string]: unknown;
}

export declare const apiClient: {
  triggerReasoning(
    payload: ReasoningRequest,
    onChunk: (chunk: ReasoningChunk) => void
  ): Promise<void>;
};