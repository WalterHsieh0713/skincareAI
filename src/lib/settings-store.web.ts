import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  type Settings,
} from '@/lib/settings';

const STORAGE_KEY = 'dewpoint-settings';

let settings: Settings = { ...DEFAULT_SETTINGS };
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function ensureLoaded() {
  if (loaded || typeof localStorage === 'undefined') {
    return;
  }
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      settings = normalizeSettings(JSON.parse(raw));
    }
  } catch {
    /* corrupt/unavailable storage — keep defaults */
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore quota/availability errors */
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  ensureLoaded();
  return () => listeners.delete(listener);
}

export function getSnapshot(): Settings {
  ensureLoaded();
  return settings;
}

export function getServerSnapshot(): Settings {
  return DEFAULT_SETTINGS;
}

/** Patch one or more settings fields, persist, and re-render subscribers. */
export function updateSettings(patch: Partial<Settings>): void {
  settings = { ...settings, ...patch };
  persist();
  emit();
}
