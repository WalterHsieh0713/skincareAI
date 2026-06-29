import { useSyncExternalStore } from 'react';

import type { Settings } from '@/lib/settings';
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  updateSettings,
} from '@/lib/settings-store';

/** Reactive access to user settings plus a patch updater. */
export function useSettings(): Settings & { update: (patch: Partial<Settings>) => void } {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...settings, update: updateSettings };
}
