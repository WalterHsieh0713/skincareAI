import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useRoutine } from '@/hooks/use-routine';
import { useRoutineConfig } from '@/hooks/use-routine-config';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';
import type { RoutinePart } from '@/lib/routine';
import { currentPart, isWindowOpen, localTimeZone, windowLabel } from '@/lib/time';

const SECTIONS: { titleKey: string; part: RoutinePart }[] = [
  { titleKey: 'routine.morning', part: 'am' },
  { titleKey: 'routine.evening', part: 'pm' },
];

/** Compact pencil icon that opens the routine editor. */
function EditIcon() {
  const { t } = useTranslation();
  return (
    <Link href="/routine-editor" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('routine.editRoutine')}
        hitSlop={Spacing.two}
        style={({ pressed }) => pressed && styles.pressed}>
        <ThemedText type="smallBold">✎</ThemedText>
      </Pressable>
    </Link>
  );
}

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

const SAVED_CONFIRM_MS = 700;

export default function RoutineScreen() {
  const { today, submitAM, submitPM } = useRoutine();
  const { config } = useRoutineConfig();
  const { t } = useTranslation();
  const [justSaved, setJustSaved] = useState<RoutinePart | null>(null);

  const submitters: Record<RoutinePart, () => void> = {
    am: submitAM,
    pm: submitPM,
  };
  const submitAndReturn = (part: RoutinePart) => {
    submitters[part]();
    setJustSaved(part);
    setTimeout(() => router.replace('/'), SAVED_CONFIRM_MS);
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
          {bothDone ? t('routine.bothDoneAdherence') : t('routine.submitBoth')}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('routine.streakHint')}
        </ThemedText>
      </Card>

      {sections.map(({ titleKey, part }) => {
        const submitted = today[part];
        const open = part === 'am' ? amOpen : pmOpen;
        const title = t(titleKey);
        const locked = !open && !submitted;
        const steps = config[part];
        return (
          <Card
            key={part}
            title={title}
            action={
              <View style={styles.cardAction}>
                <ThemedText type="small" themeColor="textSecondary">
                  {submitted
                    ? t('routine.submitted')
                    : open
                      ? t('routine.now')
                      : t('routine.windowClosed', { window: windowLabel(part) })}
                </ThemedText>
                <EditIcon />
              </View>
            }>
            <ThemedView type="backgroundElement" style={styles.steps}>
              {steps.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {t('routine.noSteps')}
                </ThemedText>
              ) : (
                steps.map((step, index) => <Step key={`${step}-${index}`} label={step} />)
              )}
            </ThemedView>
            {justSaved === part ? (
              <ThemedText type="smallBold">{t('routine.savedConfirm')}</ThemedText>
            ) : (
              <Button
                label={
                  submitted
                    ? t('routine.submittedBtn', { title })
                    : locked
                      ? t('routine.locked', { window: windowLabel(part) })
                      : t('routine.submit', { title })
                }
                disabled={submitted || locked}
                onPress={() => submitAndReturn(part)}
                style={submitted || locked ? styles.submitted : undefined}
              />
            )}
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
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
