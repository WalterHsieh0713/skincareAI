import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDayKey } from '@/lib/scan-types';

type Point = { dayKey: string; overall: number };

/**
 * A simple line graph of overall score over time — days on the x-axis, score
 * (0–100) on the y-axis. Used both as the small "trend up until today" line
 * under a Scan result and as Progress's full-history graph.
 */
export function ScoreTrendLine({
  points,
  height = 90,
}: {
  points: Point[];
  height?: number;
}) {
  const theme = useTheme();

  if (points.length < 2) {
    return null;
  }

  const width = 320;
  const padX = 8;
  const padY = 10;
  const min = Math.min(...points.map((p) => p.overall));
  const max = Math.max(...points.map((p) => p.overall));
  const span = Math.max(1, max - min);

  const coords = points.map((p, i) => {
    const x = padX + (i / (points.length - 1)) * (width - padX * 2);
    const y = padY + (1 - (p.overall - min) / span) * (height - padY * 2);
    return { x, y };
  });

  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const last = coords[coords.length - 1];

  return (
    <View style={styles.container}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line
          x1={padX}
          y1={height - padY}
          x2={width - padX}
          y2={height - padY}
          stroke={theme.backgroundSelected}
          strokeWidth={1}
        />
        <Polyline
          points={linePoints}
          fill="none"
          stroke={theme.text}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Circle cx={last.x} cy={last.y} r={3.5} fill={theme.text} />
      </Svg>
      <View style={styles.axisRow}>
        <ThemedText type="small" themeColor="textSecondary">
          {formatDayKey(points[0].dayKey)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatDayKey(points[points.length - 1].dayKey)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
