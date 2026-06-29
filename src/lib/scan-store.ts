import type { Scan } from '@/lib/scan-types';

/**
 * Native in-memory store (no persistence yet). The web build persists to
 * IndexedDB in `scan-store.web.ts`; native would use SQLite/expo-file-system.
 */
const EMPTY: Scan[] = [];
let scans: Scan[] = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function genId(): string {
  return `${Date.now()}-${Math.random()}`;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
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
  return scan;
}

export async function clearScans(): Promise<void> {
  scans = EMPTY;
  emit();
}
