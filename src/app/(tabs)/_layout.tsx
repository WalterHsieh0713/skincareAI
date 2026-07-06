import { Redirect } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { useRoutineConfig } from '@/hooks/use-routine-config';

/** The tab group. Lives under a root Stack so screens like Settings can be
 * pushed on top of the whole tab bar. The `(tabs)` group name is URL-transparent,
 * so routes stay at `/`, `/scan`, `/routine`, `/ingredients`, `/progress`.
 * First-time users are redirected to the routine-builder wizard before they
 * ever see the tabs. */
export default function TabsLayout() {
  const { onboarded } = useRoutineConfig();
  if (!onboarded) {
    return <Redirect href="/onboarding/routine" />;
  }
  return <AppTabs />;
}
