// File path: ./src/services/mcpClient.ts

export interface McpPayload {
  id: string | number;
  method: string;
  params: Record<string, unknown>;
}

export interface McpToolCallRequest {
  tool: string;
  arguments: Record<string, unknown>;
  payload?: McpPayload;
}

export interface McpToolExecutionResponse {
  result: unknown;
}

export const mcpClient = {
  async executeTool(request: McpToolCallRequest): Promise<unknown> {
    const response = await fetch("/api/mcp/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`MCP Tool execution failed: ${response.statusText}`);
    }

    const data = (await response.json()) as McpToolExecutionResponse;
    return data.result;
  },
};