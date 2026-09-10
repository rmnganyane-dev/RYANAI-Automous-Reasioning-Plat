import type { ModelId, ToolStep } from './types';

export interface StreamCallbacks {
  onToken: (text: string) => void;
  onStep: (step: ToolStep) => void;
  onTitle: (title: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}

export declare const TOOL_LABELS: Record<string, string>;

export declare function streamReasoning(
  userText: string,
  model: ModelId,
  callbacks: StreamCallbacks
): Promise<void>;

export { TOOL_LABELS };