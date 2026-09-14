// File path: ./src/services/apiClient.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const apiClient = {
    async triggerReasoning(payload, onChunk) {
        const response = await fetch(`${API_BASE_URL}/api/reasoning`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok || !response.body) {
            throw new Error(`Reasoning API failed with status ${response.status}: ${response.statusText}`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { value, done } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed)
                    continue;
                let jsonStr = trimmed;
                if (trimmed.startsWith('data: ')) {
                    jsonStr = trimmed.replace('data: ', '').trim();
                }
                if (!jsonStr)
                    continue;
                try {
                    const chunk = JSON.parse(jsonStr);
                    onChunk(chunk);
                }
                catch {
                    // Ignore malformed JSON stream chunks
                }
            }
        }
    },
};
