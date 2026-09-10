export interface AgentStep {
    thought: string;
    action?: string;
    observation?: string;
}
export declare class LangGraphReActAgent {
    private modelEndpoint;
    constructor(endpoint?: string);
    executeReasoningLoop(prompt: string): AsyncGenerator<AgentStep, void, unknown>;
}
