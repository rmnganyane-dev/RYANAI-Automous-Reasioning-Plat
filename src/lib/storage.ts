// src/lib/storage.ts
// LocalStorage and persistence utilities

import type { Conversation, Message, ModelId, MemoryEntry, ToolStep } from './types.js';

const STORAGE_KEY = 'ryanai_conversations';
const MEMORY_KEY = 'ryanai_memory';

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createMessage(
  role: 'user' | 'assistant',
  content: string,
  model?: ModelId,
  steps?: ToolStep[]
): Message {
  return {
    id: uid(),
    role,
    content,
    model,
    steps,
    timestamp: Date.now(),
  };
}

export function createConversation(model: ModelId): Conversation {
  const now = Date.now();
  return {
    id: uid(),
    title: 'New Conversation',
    model,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function generateTitle(text: string): string {
  const words = text.split(' ').slice(0, 6);
  return words.join(' ').substring(0, 50) + (text.length > 50 ? '...' : '');
}

export function loadConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.error('Failed to save conversations:', err);
  }
}

export function loadMemory(): MemoryEntry[] {
  try {
    const data = localStorage.getItem(MEMORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMemory(entries: MemoryEntry[]): void {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save memory:', err);
  }
}

export function addMemoryEntry(content: string, type: 'note' | 'thought' | 'insight' = 'note'): MemoryEntry {
  const entry: MemoryEntry = {
    id: uid(),
    content,
    type,
    timestamp: Date.now(),
  };
  
  const entries = loadMemory();
  entries.push(entry);
  saveMemory(entries);
  
  return entry;
}

export function deleteMemoryEntry(id: string): void {
  const entries = loadMemory();
  const filtered = entries.filter((e) => e.id !== id);
  saveMemory(filtered);
}