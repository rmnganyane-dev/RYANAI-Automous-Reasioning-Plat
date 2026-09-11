import type { ModelId, ToolStep } from './types';

export interface StreamCallbacks {
  onToken: (text: string) => void;
  onStep: (step: ToolStep) => void;
  onTitle: (title: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}

export const TOOL_NAMES = [
  'eBPF_PacketFilter',
  'PostgreSQL_Query',
  'Vector_Cache',
  'MCP_SystemServer',
  'LangGraph_ReAct',
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export const TOOL_LABELS: Record<ToolName, string>;

export declare function streamReasoning(
  userText: string,
  model: ModelId,
  callbacks: StreamCallbacks
): Promise<void>;

export interface ReasoningContext {
  sessionId: string;
  activeTool?: ToolName | null;
  stepCount: number;
  metadata?: Record<string, unknown>;
}