export interface VectorCacheEntry {
  id: string;
  embedding: number[];
  text: string;
  metadata?: Record<string, string>;
  updatedAt: number;
}

interface StoredVectorRecord {
  id: string;
  iv: Uint8Array;
  ciphertext: ArrayBuffer;
}

const DATABASE_NAME = 'ryanai-airgap-cache';
const STORE_NAME = 'vectors';
const KEY_NAME = 'encryption-key';

async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(KEY_NAME)) {
        database.createObjectStore(KEY_NAME);
      }
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
  try {
    const key = await getKey(database);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const payload = new TextEncoder().encode(JSON.stringify(entry));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, payload);

    await new Promise<void>((resolve, reject) => {
      const record: StoredVectorRecord = { id: entry.id, iv, ciphertext };
      const request = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

export async function loadVector(id: string): Promise<VectorCacheEntry | null> {
  const database = await openDatabase();
  try {
    const record = await new Promise<StoredVectorRecord | undefined>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!record) return null;

    const key = await getKey(database);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: record.iv },
      key,
      record.ciphertext
    );

    return JSON.parse(new TextDecoder().decode(plaintext)) as VectorCacheEntry;
  } finally {
    database.close();
  }
}

export async function deleteVector(id: string): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

export async function clearVectorCache(): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}