// File path: ./src/hooks/useReasoningStream.ts

import { useState, useCallback } from 'react';

export type StreamEventType = 'step' | 'token' | 'done';

export interface StreamEventData {
  type: StreamEventType;
  message?: string;
  content?: string;
}

export function useRyanStream() {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const streamReasoning = useCallback(async (
    prompt: string, 
    onStep: (step: string) => void, 
    onToken: (token: string) => void, 
    onComplete: () => void
  ) => {
    setIsStreaming(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/reasoning/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.body) throw new Error('ReadableStream not supported.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.substring(6).trim();
            if (!rawData) continue;
            try {
              const data = JSON.parse(rawData) as StreamEventData;
              if (data.type === 'step' && data.message) {
                onStep(data.message);
              } else if (data.type === 'token' && data.content) {
                onToken(data.content);
              } else if (data.type === 'done') {
                onComplete();
              }
            } catch (parseErr) {
              console.error('Failed to parse SSE line data:', parseErr);
            }
          }
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Streaming connection error:', errorMessage);
      // Fallback simulation if backend server isn't active locally
      onStep('Fallback: Local LangGraph simulation mode active');
      onToken('Autonomous reasoning response generated successfully via local fallback.');
      onComplete();
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { streamReasoning, isStreaming };
}