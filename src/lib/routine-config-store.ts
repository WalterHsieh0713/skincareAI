import {
  EMPTY_ROUTINE_CONFIG_STATE,
  sanitizeSteps,
  type RoutineConfig,
  type RoutineConfigState,
} from '@/lib/routine-config';

/** Native in-memory store (no persistence yet); web persists to localStorage. */
let state: RoutineConfigState = EMPTY_ROUTINE_CONFIG_STATE;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
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
  emit();
}
