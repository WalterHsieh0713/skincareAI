import { useSyncExternalStore } from 'react';

import {
  canRestore,
  computeStreak,
  getDay,
  restoresRemaining,
  type DayRoutine,
} from '@/lib/routine';
import {
  getServerSnapshot,
  getSnapshot,
  restoreStreak,
  submitPart,
  subscribe,
} from '@/lib/routine-store';
import { dayKeyOf } from '@/lib/scan-types';

/** Today's AM/PM submission state, the current streak, and submit/restore actions. */
export function useRoutine() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = Date.now();
  const today: DayRoutine = getDay(state.log, dayKeyOf(now));
  return {
    today,
    streak: computeStreak(state, now),
    restoresRemaining: restoresRemaining(state, now),
    canRestore: canRestore(state, now),
    restoreStreak,
    submitAM: () => submitPart('am'),
    submitPM: () => submitPart('pm'),
  };
}
