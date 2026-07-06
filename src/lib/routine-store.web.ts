import {
  canRestore,
  EMPTY_STATE,
  repairableDay,
  type RoutineLog,
  type RoutinePart,
  type RoutineState,
  type ScanDaySet,
} from '@/lib/routine';
import { dayKeyOf } from '@/lib/scan-types';

const STORAGE_KEY = 'dewpoint-routines';

let state: RoutineState = EMPTY_STATE;
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
      const parsed = JSON.parse(raw) as unknown;
      // Migrate the legacy shape (a bare RoutineLog) to { log, restored }.
      if (parsed && typeof parsed === 'object' && 'log' in parsed) {
        const next = parsed as RoutineState;
        state = { log: next.log ?? {}, restored: next.restored ?? {} };
      } else {
        state = { log: (parsed as RoutineLog) ?? {}, restored: {} };
      }
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

export function getSnapshot(): RoutineState {
  ensureLoaded();
  return state;
}

export function getServerSnapshot(): RoutineState {
  return EMPTY_STATE;
}

/** Submit today's AM or PM routine. No-op if that part was already submitted. */
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
  persist();
  emit();
}

/** Spend one restore to bridge the scan day that broke the streak. No-op if not allowed. */
export function restoreStreak(scanDays: ScanDaySet): void {
  const now = Date.now();
  const day = canRestore(scanDays, state.restored, now)
    ? repairableDay(scanDays, state.restored, now)
    : null;
  if (!day) {
    return;
  }
  state = { ...state, restored: { ...state.restored, [day]: now } };
  persist();
  emit();
}
