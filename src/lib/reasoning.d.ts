import type { ModelId, ToolStep } from './types';
export interface StreamCallbacks {
    onToken: (text: string) => void;
    onStep: (step: ToolStep) => void;
    onTitle: (title: string) => void;
    onDone: () => void;
    onError: (msg: string) => void;
}
declare const TOOL_NAMES: readonly ["web_search", "calculator", "memory_recall", "code_executor"];
type ToolName = (typeof TOOL_NAMES)[number];
declare const TOOL_LABELS: Record<ToolName, string>;
export declare function streamReasoning(userText: string, model: ModelId, callbacks: StreamCallbacks): Promise<void>;
export { TOOL_LABELS };
