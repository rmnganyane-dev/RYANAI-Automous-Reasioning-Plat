const STORAGE_KEY = 'ryanai_conversations';
const MEMORY_KEY = 'ryanai_memory';
function isStorageAvailable() {
    try {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }
    catch {
        return false;
    }
}
export function loadConversations() {
    if (!isStorageAvailable())
        return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        return JSON.parse(raw);
    }
    catch {
        return [];
    }
}
export function saveConversations(conversations) {
    if (!isStorageAvailable())
        return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
    catch (error) {
        console.warn('[Storage] Failed to save conversations to localStorage:', error);
    }
}
export function loadMemory() {
    if (!isStorageAvailable())
        return [];
    try {
        const raw = localStorage.getItem(MEMORY_KEY);
        if (!raw)
            return [];
        return JSON.parse(raw);
    }
    catch {
        return [];
    }
}
export function saveMemory(entries) {
    if (!isStorageAvailable())
        return;
    try {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(entries));
    }
    catch (error) {
        console.warn('[Storage] Failed to save memory to localStorage:', error);
    }
}
export function uid(prefix = 'id') {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
    }
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
export function createConversation(model) {
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
export function createMessage(role, content, model, steps) {
    return {
        id: uid('msg'),
        role,
        content,
        model,
        steps,
        timestamp: Date.now(),
    };
}
export function generateTitle(text) {
    const clean = text.trim().replace(/\s+/g, ' ');
    if (!clean)
        return 'New Thread';
    if (clean.length <= 48)
        return clean;
    return `${clean.slice(0, 45)}...`;
}
