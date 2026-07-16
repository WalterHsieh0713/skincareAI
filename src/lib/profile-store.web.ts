import { EMPTY_PROFILE, normalizeProfile, type Profile } from '@/lib/profile';

const STORAGE_KEY = 'dewpoint-profile';

let profile: Profile = { ...EMPTY_PROFILE };
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
      profile = normalizeProfile(JSON.parse(raw));
    }
  } catch {
    /* corrupt/unavailable storage — keep defaults */
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore quota/availability errors */
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  ensureLoaded();
  return () => listeners.delete(listener);
}

export function getSnapshot(): Profile {
  ensureLoaded();
  return profile;
}

export function getServerSnapshot(): Profile {
  return EMPTY_PROFILE;
}

/** Patch one or more profile fields, persist, and re-render subscribers. */
export function updateProfile(patch: Partial<Profile>): void {
  profile = { ...profile, ...patch };
  persist();
  emit();
}
