import type { Conversation, Message, ModelId, ToolStep, MemoryEntry } from './types';

export declare function loadConversations(): Conversation[];
export declare function saveConversations(conversations: Conversation[]): void;
export declare function loadMemory(): MemoryEntry[];
export declare function saveMemory(entries: MemoryEntry[]): void;
export declare function uid(prefix?: string): string;
export declare function createConversation(model: ModelId): Conversation;
export declare function createMessage(
  role: 'user' | 'assistant',
  content: string,
  model?: ModelId,
  steps?: ToolStep[]
): Message;
export declare function generateTitle(text: string): string;