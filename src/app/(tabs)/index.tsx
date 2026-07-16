import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { FontFamily, Spacing } from '@/constants/theme';
import { useRoutine } from '@/hooks/use-routine';
import { useScans } from '@/hooks/use-scans';
import { useTranslation } from '@/hooks/use-translation';
import { dayKeyOf } from '@/lib/scan-types';

export default function HomeScreen() {
  const scans = useScans();
  const { streak, restoresRemaining, canRestore, restoreStreak } = useRoutine();
  const { t, tn } = useTranslation();

  const latest = scans.length > 0 ? scans[scans.length - 1] : null;
  const previous = scans.length > 1 ? scans[scans.length - 2] : null;
  const delta = latest && previous ? latest.scores.overall - previous.scores.overall : null;
  const scannedToday = latest?.dayKey === dayKeyOf(Date.now());

  const deltaLabel = !latest
    ? t('home.noScans')
    : delta === null
      ? t('home.firstScan')
      : delta >= 0
        ? t('home.vsLastUp', { n: Math.abs(delta) })
        : t('home.vsLastDown', { n: Math.abs(delta) });

  return (
    <Screen subtitle={t('home.subtitle')}>
      {/* Dew Score — the at-a-glance hook, from your latest scan. */}
      <Card title={t('home.dewScore')} hint={t('home.dewScoreHint')}>
        <View style={styles.scoreRow}>
          <ThemedText style={styles.scoreValue}>
            {latest ? latest.scores.overall : '—'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.scoreUnit}>
            {deltaLabel}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {t('home.trackedSelf')}
        </ThemedText>
        <Link href="/scan" asChild>
          <Button
            label={scannedToday ? t('home.scanDoneToday') : latest ? t('home.takeToday') : t('home.takeFirst')}
            disabled={scannedToday}
            style={scannedToday ? styles.scanBlurred : undefined}
          />
        </Link>
      </Card>

      {/* Streak — adherence is the real product. */}
      <Card
        title={t('home.routineStreak')}
        action={
          <RestoreButton
            label={t('home.restoreStreak')}
            enabled={canRestore}
            onPress={restoreStreak}
          />
        }>
        <View style={styles.streakRow}>
          <ThemedText style={styles.streakValue}>{streak}</ThemedText>
          <ThemedText themeColor="textSecondary">{t('home.dayStreak')}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {scannedToday ? t('home.scannedToday') : t('home.noScanToday')}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {tn('home.restoresLeft', restoresRemaining, { count: restoresRemaining })}
        </ThemedText>
        <Link href="/routine" asChild>
          <Button label={t('home.openRoutine')} variant="secondary" />
        </Link>
      </Card>

      <ThemedView style={styles.quickRow}>
        <Link href="/ingredients" asChild>
          <Button label={t('home.auditProduct')} variant="secondary" style={styles.quickButton} />
        </Link>
        <Link href="/progress" asChild>
          <Button label={t('home.seeProgress')} variant="secondary" style={styles.quickButton} />
        </Link>
      </ThemedView>
    </Screen>
  );
}

/** Compact top-right action on the streak card. Dimmed when no restore is available. */
function RestoreButton({
  label,
  enabled,
  onPress,
}: {
  label: string;
  enabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!enabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.restoreButton,
        !enabled && styles.restoreDisabled,
        pressed && styles.restorePressed,
      ]}>
      <ThemedView type="backgroundSelected" style={styles.restorePill}>
        <ThemedText type="small">{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  restoreButton: {
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  restorePill: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
  },
  restoreDisabled: {
    opacity: 0.4,
  },
  restorePressed: {
    opacity: 0.7,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.three,
  },
  scoreValue: {
    fontFamily: FontFamily.displayBold,
    fontSize: 64,
    lineHeight: 68,
  },
  scoreUnit: {
    fontSize: 16,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  streakValue: {
    fontFamily: FontFamily.displayBold,
    fontSize: 40,
    lineHeight: 44,
  },
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  quickButton: {
    flex: 1,
  },
  scanBlurred: {
    opacity: 0.4,
  },
});
