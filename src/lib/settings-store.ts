import { DEFAULT_SETTINGS, type Settings } from '@/lib/settings';

/** Native in-memory store (no persistence yet); web persists to localStorage. */
let settings: Settings = { ...DEFAULT_SETTINGS };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Settings {
  return settings;
}

export function getServerSnapshot(): Settings {
  return DEFAULT_SETTINGS;
}

/** Patch one or more settings fields; re-renders all subscribers. */
export function updateSettings(patch: Partial<Settings>): void {
  settings = { ...settings, ...patch };
  emit();
}
