import { streamReasoning } from '@/lib/reasoning';

export async function dispatchInference(prompt: string): Promise<string> {
  let response = '';

  await streamReasoning(prompt, 'claude-sonnet-4.6', {
    onToken: (token) => { response += token; },
    onStep: () => undefined,
    onTitle: () => undefined,
    onDone: () => undefined,
    onError: (message) => { throw new Error(message); },
  });

  return response;
}