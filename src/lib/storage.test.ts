// @vitest-environment happy-dom
import { beforeEach, expect, it } from 'vitest';
import {
  addMemoryEntry,
  createConversation,
  deleteMemoryEntry,
  loadConversations,
  loadMemory,
  saveConversations,
} from './storage';
import { DEFAULT_MODEL } from './models';
beforeEach(() => localStorage.clear());
it('isolates local conversations and memories by account without exposing legacy anonymous data', () => {
  localStorage.setItem(
    'ryanai_memory',
    JSON.stringify([{ content: 'legacy data' }]),
  );
  const memory = addMemoryEntry('Alice secret', 'alice');
  const conversation = createConversation(DEFAULT_MODEL);
  saveConversations([conversation], 'alice');
  expect(loadMemory('alice')[0].content).toBe('Alice secret');
  expect(loadConversations('alice')).toEqual([conversation]);
  expect(loadMemory('bob')).toEqual([]);
  expect(loadConversations('bob')).toEqual([]);
  deleteMemoryEntry(memory.id, 'bob');
  expect(loadMemory('alice')).toHaveLength(1);
});
