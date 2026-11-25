/**
 * Small IndexedDB wrapper. Media files of a project and the chosen save folder stay in this browser;
 * nothing here is uploaded except when the user renders.
 */
const DB_NAME = 'kata-tts-video';
const STORES = ['assets', 'handles'] as const;
type StoreName = (typeof STORES)[number];

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {reject(new Error('IndexedDB is not available.')); return;}
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { for (const store of STORES) {if (!request.result.objectStoreNames.contains(store)) {request.result.createObjectStore(store);}} };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(store: StoreName, mode: IDBTransactionMode, work: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = work(db.transaction(store, mode).objectStore(store));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export const browserStore = {
  get: <T>(store: StoreName, key: string) => run<T | undefined>(store, 'readonly', (s) => s.get(key) as IDBRequest<T | undefined>),
  put: (store: StoreName, key: string, value: unknown) => run(store, 'readwrite', (s) => s.put(value, key)).then(() => undefined),
  delete: (store: StoreName, key: string) => run(store, 'readwrite', (s) => s.delete(key)).then(() => undefined),
};

/** Per-user, per-project key, so two accounts in one browser never see each other's media. */
export const assetKey = (userId: string, projectId: string, assetId: string) => `${userId}/${projectId}/${assetId}`;
