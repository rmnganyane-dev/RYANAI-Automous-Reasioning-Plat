import type { Conversation, Message, ModelId, ToolStep, MemoryEntry } from './types';

const STORAGE_KEY = 'ryanai_conversations';
const MEMORY_KEY = 'ryanai_memory';

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    /* quota */
  }
}

export function loadMemory(): MemoryEntry[] {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MemoryEntry[];
  } catch {
    return [];
  }
}

export function saveMemory(entries: MemoryEntry[]): void {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(entries));
  } catch {
    /* quota */
  }
}

export function uid(prefix: string = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createConversation(model: ModelId): Conversation {
  const now = Date.now();
  return {
    id: uid('conv'),
    title: 'New Thread',
    messages: [],
    model,
    createdAt: now,
    updatedAt: now,
  };
}

export function createMessage(role: 'user' | 'assistant', content: string, model?: ModelId, steps?: ToolStep[]): Message {
  return {
    id: uid('msg'),
    role,
    content,
    model,
    steps,
    timestamp: Date.now(),
  };
}

export function generateTitle(text: string): string {
  const clean = text.trim().replace(/\n/g, ' ');
  if (clean.length <= 48) return clean;
  return clean.slice(0, 45) + '...';
}
