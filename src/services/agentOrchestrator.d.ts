interface AgentState {
    sessionId: string;
    messages: Array<{
        role: "user" | "assistant" | "system";
        content: string;
    }>;
    currentStep: number;
    maxSteps: number;
}
export declare class AgentOrchestrator {
    private pgPool;
    constructor(connectionString: string);
    initializeSession(sessionId: string): Promise<AgentState>;
    persistMemory(sessionId: string, role: string, content: string): Promise<void>;
    executeReActCycle(state: AgentState, inputPrompt: string): Promise<string>;
}
export {};
