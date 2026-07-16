import { useSyncExternalStore } from 'react';

import type { Profile } from '@/lib/profile';
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  updateProfile,
} from '@/lib/profile-store';

/** Reactive access to the login/onboarding profile plus a patch updater. */
export function useProfile(): Profile & { update: (patch: Partial<Profile>) => void } {
  const profile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...profile, update: updateProfile };
}
