var STORAGE_KEY = 'ryanai_conversations';
var MEMORY_KEY = 'ryanai_memory';

function isStorageAvailable() {
  try {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  } catch (_e) {
    return false;
  }
}

export function loadConversations() {
  if (!isStorageAvailable()) return [];
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (_e) {
    return [];
  }
}

export function saveConversations(conversations) {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.warn('[Storage] Failed to save conversations to localStorage:', error);
  }
}

export function loadMemory() {
  if (!isStorageAvailable()) return [];
  try {
    var raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (_e) {
    return [];
  }
}

export function saveMemory(entries) {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('[Storage] Failed to save memory to localStorage:', error);
  }
}

export function uid(prefix) {
  if (prefix === void 0) { prefix = 'id'; }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return prefix + '_' + crypto.randomUUID().slice(0, 8);
  }
  return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

export function createConversation(model) {
  var now = Date.now();
  return {
    id: uid('conv'),
    title: 'New Thread',
    messages: [],
    model: model,
    createdAt: now,
    updatedAt: now,
  };
}

export function createMessage(role, content, model, steps) {
  return {
    id: uid('msg'),
    role: role,
    content: content,
    model: model,
    steps: steps,
    timestamp: Date.now(),
  };
}

export function generateTitle(text) {
  var clean = text.trim().replace(/\s+/g, ' ');
  if (!clean) return 'New Thread';
  if (clean.length <= 48) return clean;
  return clean.slice(0, 45) + '...';
}