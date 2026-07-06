import { useMemo } from 'react';
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
import { useScans } from '@/hooks/use-scans';

/**
 * Today's AM/PM adherence state, the scan-driven streak, and submit/restore
 * actions. The streak counts consecutive days with a scored scan — submitting
 * the routine checklist tracks adherence but no longer feeds the streak.
 */
export function useRoutine() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const scans = useScans();
  const now = Date.now();
  const today: DayRoutine = getDay(state.log, dayKeyOf(now));
  const scanDays = useMemo(() => new Set(scans.map((scan) => scan.dayKey)), [scans]);
  return {
    today,
    streak: computeStreak(scanDays, state.restored, now),
    restoresRemaining: restoresRemaining(state.restored, now),
    canRestore: canRestore(scanDays, state.restored, now),
    restoreStreak: () => restoreStreak(scanDays),
    submitAM: () => submitPart('am'),
    submitPM: () => submitPart('pm'),
  };
}
