import {
  EMPTY_ROUTINE_CONFIG_STATE,
  sanitizeSteps,
  type RoutineConfig,
  type RoutineConfigState,
} from '@/lib/routine-config';

const STORAGE_KEY = 'dewpoint-routine-config';

let state: RoutineConfigState = EMPTY_ROUTINE_CONFIG_STATE;
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
      const parsed = JSON.parse(raw) as Partial<RoutineConfigState>;
      state = {
        config: {
          am: parsed.config?.am ?? [],
          pm: parsed.config?.pm ?? [],
        },
        onboarded: parsed.onboarded ?? false,
      };
    }
  } catch {
    /* corrupt/unavailable storage — start empty */
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota/availability errors */
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  ensureLoaded();
  return () => listeners.delete(listener);
}

export function getSnapshot(): RoutineConfigState {
  ensureLoaded();
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
