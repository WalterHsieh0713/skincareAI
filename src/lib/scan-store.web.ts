import type { Scan } from '@/lib/scan-types';

const DB_NAME = 'dewpoint';
const STORE = 'scans';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

async function idbGetAll(): Promise<Scan[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result as Scan[]);
    request.onerror = () => reject(request.error);
  });
}

async function idbPut(scan: Scan): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(scan);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbClear(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ── In-memory mirror + subscriptions (so screens react without prop drilling) ─
const EMPTY: Scan[] = [];
let scans: Scan[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function ensureHydrated() {
  if (hydrated || typeof indexedDB === 'undefined') {
    return;
  }
  hydrated = true;
  idbGetAll()
    .then((loaded) => {
      scans = loaded.sort((a, b) => a.takenAt - b.takenAt);
      emit();
    })
    .catch(() => {
      /* first run / private mode — start empty */
    });
}

function genId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  ensureHydrated();
  return () => listeners.delete(listener);
}

export function getSnapshot(): Scan[] {
  return scans;
}

export function getServerSnapshot(): Scan[] {
  return EMPTY;
}

export async function addScan(input: Omit<Scan, 'id'>): Promise<Scan> {
  const scan: Scan = { ...input, id: genId() };
  scans = [...scans, scan].sort((a, b) => a.takenAt - b.takenAt);
  emit();
  try {
    await idbPut(scan);
  } catch {
    /* keep the in-memory copy even if persistence fails */
  }
  return scan;
}

export async function clearScans(): Promise<void> {
  scans = EMPTY;
  emit();
  try {
    await idbClear();
  } catch {
    /* ignore */
  }
}
