import { router } from 'expo-router';

import { RoutineBuilder } from '@/components/routine-builder';
import { useRoutineConfig } from '@/hooks/use-routine-config';
import { useTranslation } from '@/hooks/use-translation';
import { EMPTY_ROUTINE_CONFIG } from '@/lib/routine-config';

/** First-launch wizard: build your AM/PM routine before landing on the tabs. */
export default function OnboardingRoutineScreen() {
  const { setRoutine } = useRoutineConfig();
  const { t } = useTranslation();

  function finish(config: typeof EMPTY_ROUTINE_CONFIG) {
    setRoutine(config);
    router.replace('/');
  }

  return (
    <RoutineBuilder
      initial={EMPTY_ROUTINE_CONFIG}
      title={t('routineBuilder.onboardTitle')}
      subtitle={t('routineBuilder.onboardSubtitle')}
      saveLabel={t('routineBuilder.save')}
      onSave={finish}
      secondary={{
        label: t('routineBuilder.skipForNow'),
        onPress: () => finish(EMPTY_ROUTINE_CONFIG),
      }}
    />
  );
}
