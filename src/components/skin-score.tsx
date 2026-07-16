import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';
import type { SkinScores } from '@/lib/scan-types';

export function AxisBar({ label, value }: { label: string; value: number }) {
  const theme = useTheme();
  return (
    <View style={styles.axis}>
      <View style={styles.axisLabelRow}>
        <ThemedText type="small">{label}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {value}
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View
          style={[styles.fill, { width: `${value}%`, backgroundColor: theme.accent }]}
        />
      </View>
    </View>
  );
}

const AXES: { key: keyof SkinScores }[] = [
  { key: 'redness' },
  { key: 'texture' },
  { key: 'blemishes' },
  { key: 'hydration' },
];

/** Overall skin score headline plus the four axis bars. */
export function SkinScoreView({ scores }: { scores: SkinScores }) {
  const { t } = useTranslation();
  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={styles.headline}>
        <ThemedText type="title">{scores.overall}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('skinScore.overall')}
        </ThemedText>
      </View>
      <View style={styles.axes}>
        {AXES.map((axis) => (
          <AxisBar key={axis.key} label={t(`skinScore.${axis.key}`)} value={scores[axis.key]} />
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  headline: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  axes: {
    gap: Spacing.three,
  },
  axis: {
    gap: Spacing.one,
  },
  axisLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
