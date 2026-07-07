import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Scan } from '@/lib/scan-types';

/** Native store: in-memory mirror backed by AsyncStorage so scans (and the streak they drive) survive an app restart. */
const STORAGE_KEY = 'dewpoint-scans';

const EMPTY: Scan[] = [];
let scans: Scan[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scans)).catch(() => {
    /* keep the in-memory copy even if persistence fails */
  });
}

function ensureHydrated() {
  if (hydrated) {
    return;
  }
  hydrated = true;
  AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => {
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as Scan[];
      scans = parsed.sort((a, b) => a.takenAt - b.takenAt);
      emit();
    })
    .catch(() => {
      /* first run / corrupt storage — start empty */
    });
}

function genId(): string {
  return `${Date.now()}-${Math.random()}`;
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
  persist();
  return scan;
}

export async function clearScans(): Promise<void> {
  scans = EMPTY;
  emit();
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
