// File path: ./src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:9090";
export async function fetchSystemHealth() {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
        throw new Error(`Health check failed with status: ${response.status}`);
    }
    return response.json();
}
export async function executeAgentReasoning(prompt) {
    const response = await fetch(`${API_BASE_URL}/api/reason`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Reasoning execution failed with status: ${response.status}`);
    }
    return response.json();
}
