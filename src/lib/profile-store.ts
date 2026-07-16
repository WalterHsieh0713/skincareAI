import AsyncStorage from '@react-native-async-storage/async-storage';

import { EMPTY_PROFILE, normalizeProfile, type Profile } from '@/lib/profile';

/** Native store: in-memory mirror backed by AsyncStorage so login/onboarding state survives an app restart. */
const STORAGE_KEY = 'dewpoint-profile';

let profile: Profile = { ...EMPTY_PROFILE };
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch(() => {
    /* keep the in-memory copy even if persistence fails */
  });
}

function ensureLoaded() {
  if (loaded) {
    return;
  }
  loaded = true;
  AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => {
      if (!raw) {
        return;
      }
      profile = normalizeProfile(JSON.parse(raw));
      emit();
    })
    .catch(() => {
      /* first run / corrupt storage — start empty */
    });
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  ensureLoaded();
  return () => listeners.delete(listener);
}

export function getSnapshot(): Profile {
  return profile;
}

export function getServerSnapshot(): Profile {
  return EMPTY_PROFILE;
}

/** Patch one or more profile fields; persist, and re-render subscribers. */
export function updateProfile(patch: Partial<Profile>): void {
  profile = { ...profile, ...patch };
  persist();
  emit();
}
