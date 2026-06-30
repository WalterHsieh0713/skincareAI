import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SkinScoreView } from '@/components/skin-score';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useRoutine } from '@/hooks/use-routine';
import { useScans } from '@/hooks/use-scans';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';
import { isRangeUnlocked } from '@/lib/routine';
import { clearScans } from '@/lib/scan-store';
import type { Scan } from '@/lib/scan-types';
import { formatDayKey, RANGE_DAYS, type TimelapseRange } from '@/lib/scan-types';
import { buildTimelapse, periodCount, periodLabel } from '@/lib/timelapse';

const INSIGHT_WINDOW = 7;

function buildInsight(
  scans: Scan[],
  streak: number,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (scans.length < 3) {
    return t('progress.insightFirst');
  }
  const recent = scans.slice(-Math.min(INSIGHT_WINDOW, scans.length));
  const first = recent[0].scores.overall;
  const last = recent[recent.length - 1].scores.overall;
  const delta = last - first;
  const n = recent.length;
  const adherence = streak > 0 ? ` ${t('progress.insightAdherence', { streak })}` : '';
  if (Math.abs(delta) <= 1) {
    return t('progress.insightStable', { n }) + adherence;
  }
  if (delta > 0) {
    return t('progress.insightImproved', { delta, n }) + adherence;
  }
  return t('progress.insightDeclined', { delta: Math.abs(delta), n }) + adherence;
}

const RANGES: TimelapseRange[] = ['weekly', 'monthly'];
const FRAME_MS = 600;

const RANGE_KEY: Record<TimelapseRange, string> = {
  weekly: 'progress.rangeWeekly',
  monthly: 'progress.rangeMonthly',
};

export default function ProgressScreen() {
  const scans = useScans();
  const { streak } = useRoutine();
  const { t, tn } = useTranslation();
  const latest = scans.length > 0 ? scans[scans.length - 1] : null;
  const insight = buildInsight(scans, streak, t);

  const [range, setRange] = useState<TimelapseRange>('weekly');
  const rangeUnlocked = isRangeUnlocked(range, streak);

  const now = Date.now();
  const totalPeriods = periodCount(scans, range, now);
  const [period, setPeriod] = useState(0);

  // Reset to the latest period when range changes or new scans arrive.
  useEffect(() => {
    setPeriod(Math.max(0, periodCount(scans, range, Date.now()) - 1));
  }, [range, scans.length]);

  const frames = useMemo(
    () => buildTimelapse(scans, range, period),
    [scans, range, period],
  );

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [range, period, frames.length]);

  useEffect(() => {
    if (!playing || frames.length < 2) {
      return;
    }
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, FRAME_MS);
    return () => clearInterval(timer);
  }, [playing, frames.length]);

  const current = frames[index];
  const first = frames[0];
  const last = frames[frames.length - 1];
  const overallDelta =
    first && last ? last.scores.overall - first.scores.overall : 0;

  const canGoBack = period > 0;
  const canGoForward = period < totalPeriods - 1;

  return (
    <Screen title={t('progress.title')} subtitle={t('progress.subtitle')}>
      <Card
        title={t('progress.multiAxis')}
        hint={latest ? t('progress.latestScan') : t('progress.noScans')}>
        {latest ? (
          <SkinScoreView scores={latest.scores} />
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            {t('progress.scanToPopulate')}
          </ThemedText>
        )}
        <ThemedText type="small" themeColor="textSecondary">
          {t('progress.indicatorsNote')}
        </ThemedText>
      </Card>

      <Card title={t('progress.insightTitle')}>
        <ThemedText>{insight}</ThemedText>
      </Card>

      <Card title={t('progress.timelapseTitle')}>
        {/* Range toggle: Weekly / Monthly */}
        <View style={styles.rangeRow}>
          {RANGES.map((option) => {
            const locked = !isRangeUnlocked(option, streak);
            return (
              <Button
                key={option}
                label={locked ? t('progress.rangeLocked', { label: t(RANGE_KEY[option]) }) : t(RANGE_KEY[option])}
                variant={option === range ? 'primary' : 'secondary'}
                onPress={() => setRange(option)}
                style={[styles.rangeButton, locked && styles.rangeLocked]}
              />
            );
          })}
        </View>

        {/* Period navigation: ← Week 3 → */}
        {rangeUnlocked && totalPeriods > 0 ? (
          <PeriodNav
            label={periodLabel(range, period)}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onBack={() => setPeriod((p) => p - 1)}
            onForward={() => setPeriod((p) => p + 1)}
          />
        ) : null}

        {!rangeUnlocked ? (
          <ThemedText type="small" themeColor="textSecondary">
            {t('progress.rangeLockedHint', {
              range: t(RANGE_KEY[range]),
              n: RANGE_DAYS[range],
              streak,
            })}
          </ThemedText>
        ) : frames.length < 2 ? (
          <ThemedText type="small" themeColor="textSecondary">
            {t('progress.needsTwo', { range: t(RANGE_KEY[range]), period: periodLabel(range, period) })}
          </ThemedText>
        ) : (
          <TimelapsePlayer
            uri={current?.image}
            dayLabel={current ? formatDayKey(current.dayKey) : ''}
            overall={current?.scores.overall ?? 0}
            playing={playing}
            onTogglePlay={() => setPlaying((p) => !p)}
            position={index + 1}
            total={frames.length}
            first={first}
            last={last}
            overallDelta={overallDelta}
          />
        )}
      </Card>

      {scans.length > 0 ? (
        <Card>
          <ThemedText type="small" themeColor="textSecondary">
            {tn('progress.savedCount', scans.length, { count: scans.length })}
          </ThemedText>
          <Button
            label={t('progress.clearHistory')}
            variant="secondary"
            onPress={() => clearScans()}
          />
        </Card>
      ) : null}
    </Screen>
  );
}

function PeriodNav({
  label,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
}: {
  label: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.periodNav}>
      <Pressable
        onPress={onBack}
        disabled={!canGoBack}
        style={[styles.arrow, !canGoBack && styles.arrowDisabled]}>
        <ThemedText
          type="smallBold"
          themeColor={canGoBack ? 'text' : 'textSecondary'}>
          ‹
        </ThemedText>
      </Pressable>
      <ThemedView type="backgroundElement" style={styles.periodLabel}>
        <ThemedText type="smallBold">{label}</ThemedText>
      </ThemedView>
      <Pressable
        onPress={onForward}
        disabled={!canGoForward}
        style={[styles.arrow, !canGoForward && styles.arrowDisabled]}>
        <ThemedText
          type="smallBold"
          themeColor={canGoForward ? 'text' : 'textSecondary'}>
          ›
        </ThemedText>
      </Pressable>
    </View>
  );
}

type PlayerProps = {
  uri?: string;
  dayLabel: string;
  overall: number;
  playing: boolean;
  onTogglePlay: () => void;
  position: number;
  total: number;
  first: { image: string; dayKey: string; scores: { overall: number } };
  last: { image: string; dayKey: string; scores: { overall: number } };
  overallDelta: number;
};

function TimelapsePlayer({
  uri,
  dayLabel,
  overall,
  playing,
  onTogglePlay,
  position,
  total,
  first,
  last,
  overallDelta,
}: PlayerProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const deltaText =
    overallDelta === 0
      ? t('progress.noChange')
      : t('progress.deltaOverall', {
          delta: `${overallDelta > 0 ? '+' : '−'}${Math.abs(overallDelta)}`,
        });

  return (
    <View style={styles.player}>
      <Pressable onPress={onTogglePlay} style={styles.stage}>
        {uri ? (
          <Image source={{ uri }} style={styles.stageImage} contentFit="cover" />
        ) : null}
        <ThemedView type="backgroundSelected" style={styles.dayBadge}>
          <ThemedText type="small">
            {dayLabel} · {overall}
          </ThemedText>
        </ThemedView>
      </Pressable>

      <View style={styles.controls}>
        <Button
          label={playing ? t('progress.pause') : t('progress.play')}
          onPress={onTogglePlay}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {position} / {total}
        </ThemedText>
      </View>

      <View style={styles.compareRow}>
        <CompareTile
          label={t('progress.before', { day: formatDayKey(first.dayKey) })}
          uri={first.image}
          score={first.scores.overall}
        />
        <CompareTile
          label={t('progress.after', { day: formatDayKey(last.dayKey) })}
          uri={last.image}
          score={last.scores.overall}
        />
      </View>

      <ThemedView
        type="backgroundSelected"
        style={[styles.delta, { borderColor: theme.textSecondary }]}>
        <ThemedText type="smallBold">{deltaText}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('progress.tapToWatch')}
        </ThemedText>
      </ThemedView>
    </View>
  );
}

function CompareTile({
  label,
  uri,
  score,
}: {
  label: string;
  uri: string;
  score: number;
}) {
  return (
    <View style={styles.compareTile}>
      <Image source={{ uri }} style={styles.compareImage} contentFit="cover" />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{score}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  rangeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  rangeButton: {
    flex: 1,
  },
  rangeLocked: {
    opacity: 0.5,
  },
  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  arrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  periodLabel: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  player: {
    gap: Spacing.three,
  },
  stage: {
    aspectRatio: 1,
    width: '100%',
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  stageImage: {
    width: '100%',
    height: '100%',
  },
  dayBadge: {
    position: 'absolute',
    left: Spacing.two,
    bottom: Spacing.two,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  compareRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  compareTile: {
    flex: 1,
    gap: Spacing.one,
  },
  compareImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.three,
  },
  delta: {
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.one,
  },
});
