import { useSyncExternalStore } from 'react';

import {
  getServerSnapshot,
  getSnapshot,
  setRoutine,
  subscribe,
} from '@/lib/routine-config-store';

/** The user's custom AM/PM routine, whether onboarding is done, and how to save it. */
export function useRoutineConfig() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    config: state.config,
    onboarded: state.onboarded,
    setRoutine,
  };
}
