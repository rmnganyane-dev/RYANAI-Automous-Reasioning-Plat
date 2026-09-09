export interface VectorCacheEntry {
  id: string;
  embedding: number[];
  text: string;
  metadata?: Record<string, string>;
  updatedAt: number;
}

const DATABASE_NAME = 'ryanai-airgap-cache';
const STORE_NAME = 'vectors';
const KEY_NAME = 'encryption-key';

async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      if (!database.objectStoreNames.contains(KEY_NAME)) database.createObjectStore(KEY_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open air-gap cache'));
  });
}

async function getKey(database: IDBDatabase): Promise<CryptoKey> {
  const existing = await new Promise<CryptoKey | undefined>((resolve, reject) => {
    const request = database.transaction(KEY_NAME, 'readonly').objectStore(KEY_NAME).get(KEY_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  if (existing) return existing;

  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(KEY_NAME, 'readwrite').objectStore(KEY_NAME).put(key, KEY_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  return key;
}

export async function saveVector(entry: VectorCacheEntry): Promise<void> {
  const database = await openDatabase();
  const key = await getKey(database);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = new TextEncoder().encode(JSON.stringify(entry));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, payload);
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put({ id: entry.id, iv: Array.from(iv), ciphertext: Array.from(new Uint8Array(ciphertext)) });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  database.close();
}

export async function loadVector(id: string): Promise<VectorCacheEntry | null> {
  const database = await openDatabase();
  const record = await new Promise<{ iv: number[]; ciphertext: number[] } | undefined>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  if (!record) return null;
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(record.iv) }, await getKey(database), new Uint8Array(record.ciphertext));
  database.close();
  return JSON.parse(new TextDecoder().decode(plaintext)) as VectorCacheEntry;
}