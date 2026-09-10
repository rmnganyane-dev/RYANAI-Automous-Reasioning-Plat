interface ReasoningRequest {
    prompt: string;
    sessionId: string;
}
export declare const apiClient: {
    triggerReasoning(payload: ReasoningRequest, onChunk: (data: any) => void): Promise<void>;
};
export {};
