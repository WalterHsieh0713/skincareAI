import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import type { RoutinePart } from '@/lib/routine';
import { sanitizeSteps, type RoutineConfig } from '@/lib/routine-config';

type RoutineBuilderProps = {
  initial: RoutineConfig;
  title: string;
  subtitle: string;
  saveLabel: string;
  onSave: (config: RoutineConfig) => void;
  secondary?: { label: string; onPress: () => void };
};

/**
 * Editable AM/PM step-list form, shared by the first-launch onboarding wizard
 * and the routine editor pushed from the Routine tab's edit icon.
 */
export function RoutineBuilder({
  initial,
  title,
  subtitle,
  saveLabel,
  onSave,
  secondary,
}: RoutineBuilderProps) {
  const { t } = useTranslation();
  const [am, setAm] = useState<string[]>(initial.am);
  const [pm, setPm] = useState<string[]>(initial.pm);
  const [amDraft, setAmDraft] = useState('');
  const [pmDraft, setPmDraft] = useState('');

  const sections = [
    { part: 'am' as RoutinePart, label: t('routineBuilder.morningSteps'), steps: am, setSteps: setAm, draft: amDraft, setDraft: setAmDraft },
    { part: 'pm' as RoutinePart, label: t('routineBuilder.eveningSteps'), steps: pm, setSteps: setPm, draft: pmDraft, setDraft: setPmDraft },
  ];

  function addStep(section: (typeof sections)[number]) {
    const value = section.draft.trim();
    if (!value) {
      return;
    }
    section.setSteps([...section.steps, value]);
    section.setDraft('');
  }

  function removeStep(section: (typeof sections)[number], index: number) {
    section.setSteps(section.steps.filter((_, i) => i !== index));
  }

  return (
    <Screen title={title} subtitle={subtitle}>
      {sections.map((section) => (
        <Card key={section.part} title={section.label}>
          {section.steps.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('routineBuilder.empty')}
            </ThemedText>
          ) : (
            <ThemedView type="backgroundElement" style={styles.steps}>
              {section.steps.map((step, index) => (
                <StepRow
                  key={`${step}-${index}`}
                  label={step}
                  removeLabel={t('routineBuilder.remove')}
                  onRemove={() => removeStep(section, index)}
                />
              ))}
            </ThemedView>
          )}
          <View style={styles.addRow}>
            <View style={styles.addField}>
              <TextField
                label={t('routineBuilder.addStep')}
                placeholder={t('routineBuilder.stepPlaceholder')}
                value={section.draft}
                onChangeText={section.setDraft}
                onSubmitEditing={() => addStep(section)}
                returnKeyType="done"
              />
            </View>
            <Button
              label={t('routineBuilder.addStep')}
              variant="secondary"
              onPress={() => addStep(section)}
            />
          </View>
        </Card>
      ))}
      <Button label={saveLabel} onPress={() => onSave({ am: sanitizeSteps(am), pm: sanitizeSteps(pm) })} />
      {secondary ? (
        <Button label={secondary.label} variant="secondary" onPress={secondary.onPress} />
      ) : null}
    </Screen>
  );
}

function StepRow({
  label,
  removeLabel,
  onRemove,
}: {
  label: string;
  removeLabel: string;
  onRemove: () => void;
}) {
  return (
    <View style={styles.stepRow}>
      <ThemedText style={styles.stepLabel}>{label}</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={removeLabel}
        onPress={onRemove}
        hitSlop={Spacing.two}>
        <ThemedText themeColor="textSecondary">✕</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  steps: {
    gap: Spacing.two,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
  },
  stepLabel: {
    flexShrink: 1,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  addField: {
    flex: 1,
  },
});
