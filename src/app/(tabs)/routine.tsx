import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useRoutine } from '@/hooks/use-routine';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';
import type { RoutinePart } from '@/lib/routine';
import { currentPart, isWindowOpen, localTimeZone, windowLabel } from '@/lib/time';

const SECTIONS: { titleKey: string; part: RoutinePart; stepKeys: string[] }[] = [
  {
    titleKey: 'routine.morning',
    part: 'am',
    stepKeys: ['routine.amStep1', 'routine.amStep2', 'routine.amStep3', 'routine.amStep4'],
  },
  {
    titleKey: 'routine.evening',
    part: 'pm',
    stepKeys: ['routine.pmStep1', 'routine.pmStep2', 'routine.pmStep3', 'routine.pmStep4'],
  },
];

function Step({ label }: { label: string }) {
  const theme = useTheme();
  const [done, setDone] = useState(false);

  return (
    <Pressable onPress={() => setDone((d) => !d)} style={styles.stepRow}>
      <View
        style={[
          styles.checkbox,
          { borderColor: theme.textSecondary },
          done && { backgroundColor: theme.text, borderColor: theme.text },
        ]}>
        {done ? (
          <ThemedText style={[styles.check, { color: theme.background }]}>✓</ThemedText>
        ) : null}
      </View>
      <ThemedText
        themeColor={done ? 'textSecondary' : 'text'}
        style={done ? styles.struck : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default function RoutineScreen() {
  const { today, streak, submitAM, submitPM } = useRoutine();
  const { t, tn } = useTranslation();
  const submitters: Record<RoutinePart, () => void> = {
    am: submitAM,
    pm: submitPM,
  };
  const bothDone = today.am && today.pm;

  const now = Date.now();
  const activePart = currentPart(now);
  const timeZone = localTimeZone();
  const amOpen = isWindowOpen(now, 'am');
  const pmOpen = isWindowOpen(now, 'pm');
  // Surface whichever routine is active right now first.
  const sections = [...SECTIONS].sort((a, b) =>
    a.part === activePart ? -1 : b.part === activePart ? 1 : 0,
  );

  return (
    <Screen title={t('routine.title')} subtitle={t('routine.subtitle')}>
      <Card
        title={t('routine.adherence')}
        hint={t('routine.nowTz', { part: t(`routine.${activePart}`), tz: timeZone })}>
        <View style={styles.statusRow}>
          <StatusPill label={t('routine.am')} done={today.am} active={activePart === 'am'} />
          <StatusPill label={t('routine.pm')} done={today.pm} active={activePart === 'pm'} />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {bothDone
            ? tn('routine.bothDone', streak, { count: streak })
            : t('routine.submitBoth')}
        </ThemedText>
      </Card>

      {sections.map(({ titleKey, part, stepKeys }) => {
        const submitted = today[part];
        const isActive = part === activePart;
        const open = part === 'am' ? amOpen : pmOpen;
        const title = t(titleKey);
        const locked = !open && !submitted;
        return (
          <Card
            key={part}
            title={title}
            hint={
              submitted
                ? t('routine.submitted')
                : open
                  ? t('routine.now')
                  : t('routine.windowClosed', { window: windowLabel(part) })
            }>
            <ThemedView type="backgroundElement" style={styles.steps}>
              {stepKeys.map((stepKey) => (
                <Step key={stepKey} label={t(stepKey)} />
              ))}
            </ThemedView>
            <Button
              label={
                submitted
                  ? t('routine.submittedBtn', { title })
                  : locked
                    ? t('routine.locked', { window: windowLabel(part) })
                    : t('routine.submit', { title })
              }
              disabled={submitted || locked}
              onPress={submitters[part]}
              style={submitted || locked ? styles.submitted : undefined}
            />
          </Card>
        );
      })}
    </Screen>
  );
}

function StatusPill({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active: boolean;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <ThemedView
      type={done ? 'backgroundSelected' : 'backgroundElement'}
      style={[
        styles.pill,
        done && { borderColor: theme.text },
        active && !done && { borderColor: theme.textSecondary },
      ]}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {done ? t('routine.done') : active ? t('routine.now') : t('routine.notYet')}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  steps: {
    gap: Spacing.two,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Spacing.two,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  struck: {
    textDecorationLine: 'line-through',
  },
  submitted: {
    opacity: 0.5,
  },
});
