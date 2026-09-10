// File path: ./src/services/mcpClient.ts
export const mcpClient = {
    async executeTool(request) {
        const response = await fetch("/api/mcp/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            throw new Error(`MCP Tool execution failed: ${response.statusText}`);
        }
        const data = await response.json();
        return data.result;
    },
};
