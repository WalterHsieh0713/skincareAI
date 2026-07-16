import { Redirect } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { useProfile } from '@/hooks/use-profile';
import { useRoutineConfig } from '@/hooks/use-routine-config';

/** The tab group. Lives under a root Stack so screens like Settings can be
 * pushed on top of the whole tab bar. The `(tabs)` group name is URL-transparent,
 * so routes stay at `/`, `/scan`, `/routine`, `/ingredients`, `/progress`.
 * First-time users are gated through, in order: Login (which doubles as the
 * welcome screen), the profile questionnaire (gender/birthday/skincare
 * hobby), then the legacy routine-builder wizard (kept as a fallback for any
 * state that predates the profile gate) — only after all of that do they
 * ever see the tabs. */
export default function TabsLayout() {
  const profile = useProfile();
  const { onboarded } = useRoutineConfig();
  if (!profile.authenticated) {
    return <Redirect href="/login" />;
  }
  if (!profile.onboarded) {
    return <Redirect href="/onboarding/profile" />;
  }
  if (!onboarded) {
    return <Redirect href="/onboarding/routine" />;
  }
  return <AppTabs />;
}
