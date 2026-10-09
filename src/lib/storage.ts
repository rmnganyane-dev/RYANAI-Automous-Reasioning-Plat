// src/lib/storage.ts
// LocalStorage and persistence utilities

import type {
  Conversation,
  Message,
  ModelId,
  MemoryEntry,
  ToolStep,
} from './types.js';

const STORAGE_KEY = 'ryanai_conversations';
const MEMORY_KEY = 'ryanai_memory';

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/** Create a timestamped conversation message with a generated ID and optional model steps. */
export function createMessage(
  role: 'user' | 'assistant',
  content: string,
  model?: ModelId,
  steps?: ToolStep[],
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

/** Load conversations for one user, returning an empty list if reading or parsing fails. */
export function loadConversations(userId: string): Conversation[] {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}:${userId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/** Persist conversations under the user storage key and log storage failures. */
export function saveConversations(
  conversations: Conversation[],
  userId: string,
): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEY}:${userId}`,
      JSON.stringify(conversations),
    );
  } catch (err) {
    console.error('Failed to save conversations:', err);
  }
}

/** Load memories for one user, returning an empty list if reading or parsing fails. */
export function loadMemory(userId: string): MemoryEntry[] {
  try {
    const data = localStorage.getItem(`${MEMORY_KEY}:${userId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/** Persist memories under the user storage key and log storage failures. */
export function saveMemory(entries: MemoryEntry[], userId: string): void {
  try {
    localStorage.setItem(`${MEMORY_KEY}:${userId}`, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save memory:', err);
  }
}

/** Create and append a timestamped memory to the user storage, then return the entry. */
export function addMemoryEntry(
  content: string,
  userId: string,
  type: 'note' | 'thought' | 'insight' = 'note',
): MemoryEntry {
  const entry: MemoryEntry = {
    id: uid(),
    content,
    type,
    timestamp: Date.now(),
  };

  const entries = loadMemory(userId);
  entries.push(entry);
  saveMemory(entries, userId);

  return entry;
}

/** Remove a memory by ID from the supplied user account and save the remaining entries. */
export function deleteMemoryEntry(id: string, userId: string): void {
  const entries = loadMemory(userId);
  const filtered = entries.filter((e) => e.id !== id);
  saveMemory(filtered, userId);
}
