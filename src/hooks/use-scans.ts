import { useSyncExternalStore } from 'react';

import { getServerSnapshot, getSnapshot, subscribe } from '@/lib/scan-store';

/** Reactive list of all saved scans (oldest → newest). */
export function useScans() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
