interface McpToolCallRequest {
    tool: string;
    arguments: Record<string, any>;
}
export declare const mcpClient: {
    executeTool(request: McpToolCallRequest): Promise<any>;
};
export {};
