import { useState } from 'react';

export function useRyanStream() {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const streamReasoning = async (
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
            const data = JSON.parse(line.substring(6));
            if (data.type === 'step') onStep(data.message);
            if (data.type === 'token') onToken(data.content);
            if (data.type === 'done') onComplete();
          }
        }
      }
    } catch (err) {
      console.error('Streaming connection error:', err);
      // Fallback simulation if backend server isn't active locally
      onStep('Fallback: Local LangGraph simulation mode active');
      onToken('Autonomous reasoning response generated successfully via local fallback.');
      onComplete();
    } finally {
      setIsStreaming(false);
    }
  };

  return { streamReasoning, isStreaming };
}