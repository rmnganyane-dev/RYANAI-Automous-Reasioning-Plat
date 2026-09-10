const DB_NAME = 'ryan_ai_airgap_cache';
const STORE_NAME = 'vectors';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode('RYANAI-AIRGAP-STATIC-SALT-KEY-2026'),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('ryan-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function saveVector(entry: { id: string; vector: number[]; metadata?: any }): Promise<void> {
  const database = await openDB();
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = new TextEncoder().encode(JSON.stringify(entry.vector));
  
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, payload);

  return new Promise<void>((resolve, reject) => {
    const record = { id: entry.id, iv, ciphertext, metadata: entry.metadata || {} };
    const request = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  }).finally(() => {
    database.close();
  });
}

export async function loadVector(id: string): Promise<any> {
  const database = await openDB();
  const key = await getKey();

  const record: any = await new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  if (!record) {
    database.close();
    return null;
  }

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: record.iv },
    key,
    record.ciphertext
  );

  database.close();
  return JSON.parse(new TextDecoder().decode(decrypted));
}

export async function deleteVector(id: string): Promise<void> {
  const database = await openDB();
  return new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  }).finally(() => {
    database.close();
  });
}

export async function clearCache(): Promise<void> {
  const database = await openDB();
  return new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  }).finally(() => {
    database.close();
  });
}