import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_ROUTINE_CONFIG_STATE,
  sanitizeSteps,
  type RoutineConfig,
  type RoutineConfigState,
} from '@/lib/routine-config';

/** Native store: in-memory mirror backed by AsyncStorage so the routine + onboarded flag survive an app restart. */
const STORAGE_KEY = 'dewpoint-routine-config';

let state: RoutineConfigState = EMPTY_ROUTINE_CONFIG_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
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
      const parsed = JSON.parse(raw) as Partial<RoutineConfigState>;
      state = { ...EMPTY_ROUTINE_CONFIG_STATE, ...parsed };
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

export function getSnapshot(): RoutineConfigState {
  return state;
}

export function getServerSnapshot(): RoutineConfigState {
  return EMPTY_ROUTINE_CONFIG_STATE;
}

/** Save the user's AM/PM routine and mark onboarding complete. */
export function setRoutine(config: RoutineConfig): void {
  state = {
    config: { am: sanitizeSteps(config.am), pm: sanitizeSteps(config.pm) },
    onboarded: true,
  };
  persist();
  emit();
}
