// File path: ./src/services/inference.ts
import { streamReasoning } from '@/lib/reasoning';
export async function dispatchInference(prompt) {
    let response = '';
    await streamReasoning(prompt, 'claude-sonnet-4.6', {
        onToken: (token) => {
            response += token;
        },
        onStep: () => undefined,
        onTitle: () => undefined,
        onDone: () => undefined,
        onError: (message) => {
            throw new Error(message);
        },
    });
    return response;
}
