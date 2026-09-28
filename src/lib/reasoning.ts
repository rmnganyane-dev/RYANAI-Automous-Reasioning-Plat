// src/lib/reasoning.ts
// Autonomous reasoning engine integration

import type { ModelId, ReasoningCallbacks } from './types.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function streamReasoning(
  prompt: string,
  model: ModelId,
  callbacks: ReasoningCallbacks
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/reasoning/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.status === 'processing' && data.message) {
              callbacks.onStep?.({
                type: 'reasoning',
                name: 'process',
                result: data.message,
              });
            } else if (data.status === 'complete' && data.result) {
              callbacks.onToken?.(data.result);
              callbacks.onDone?.();
            } else if (data.error) {
              callbacks.onError?.(data.error);
            }
          } catch {
            if (line.trim()) {
              callbacks.onToken?.(line.trim());
            }
          }
        }
      }
    }

    callbacks.onDone?.();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    callbacks.onError?.(message);
  }
}

export async function quickReason(prompt: string, model: ModelId): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/api/reason`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, model }),
    });

    const data = await response.json();
    return data.response || 'No response';
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
}