export type ModelId = 'gemini-3.1-pro' | 'claude-sonnet-4.6' | 'gpt-5.4';

export interface ModelMeta {
    id: ModelId;
    label: string;
    short: string;
    vendor: string;
    color: string;
    accent: string;
    description: string;
}

export interface ToolStep {
    id: string;
    type: 'tool_start' | 'tool_result';
    name: string;
    args?: Record<string, unknown>;
    result?: string;
    status?: 'running' | 'done' | 'error';
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    model?: ModelId;
    steps?: ToolStep[];
    timestamp: number;
}

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    model: ModelId;
    createdAt: number;
    updatedAt: number;
}

export interface MemoryEntry {
    id: string;
    key: string;
    value: string;
    category: 'preference' | 'fact' | 'project' | 'skill';
    createdAt: number;
}

export interface SystemStatus {
    cpu: number;
    memory: number;
    latency: number;
    tokensIn: number;
    tokensOut: number;
    uptime: string;
    model: ModelId;
    state: 'idle' | 'thinking' | 'tool-calling' | 'responding';
}