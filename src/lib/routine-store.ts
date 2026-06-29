import {
  canRestore,
  EMPTY_STATE,
  repairableDay,
  type RoutinePart,
  type RoutineState,
} from '@/lib/routine';
import { dayKeyOf } from '@/lib/scan-types';

/** Native in-memory store (no persistence yet); web persists to localStorage. */
let state: RoutineState = EMPTY_STATE;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): RoutineState {
  return state;
}

export function getServerSnapshot(): RoutineState {
  return EMPTY_STATE;
}

export function submitPart(part: RoutinePart): void {
  const day = dayKeyOf(Date.now());
  const current = state.log[day] ?? { am: false, pm: false };
  if (current[part]) {
    return;
  }
  state = {
    ...state,
    log: { ...state.log, [day]: { ...current, [part]: true } },
  };
  emit();
}

/** Spend one restore to bridge the day that broke the streak. No-op if not allowed. */
export function restoreStreak(): void {
  const now = Date.now();
  const day = canRestore(state, now) ? repairableDay(state, now) : null;
  if (!day) {
    return;
  }
  state = { ...state, restored: { ...state.restored, [day]: now } };
  emit();
}
