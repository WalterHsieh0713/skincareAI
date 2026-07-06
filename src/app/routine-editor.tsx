import { router } from 'expo-router';

import { RoutineBuilder } from '@/components/routine-builder';
import { useRoutineConfig } from '@/hooks/use-routine-config';
import { useTranslation } from '@/hooks/use-translation';

/** Pushed from the Routine tab's edit icon — lets the user change their AM/PM steps anytime. */
export default function RoutineEditorScreen() {
  const { config, setRoutine } = useRoutineConfig();
  const { t } = useTranslation();

  return (
    <RoutineBuilder
      initial={config}
      title={t('routineBuilder.editTitle')}
      subtitle={t('routineBuilder.editSubtitle')}
      saveLabel={t('routineBuilder.save')}
      onSave={(next) => {
        setRoutine(next);
        router.back();
      }}
    />
  );
}
