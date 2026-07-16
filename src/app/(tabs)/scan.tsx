import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CameraCapture } from '@/components/camera-capture';
import { ScoreTrendLine } from '@/components/score-trend-line';
import { SkinRecommendationsView } from '@/components/skin-recommendations';
import { SkinScoreView } from '@/components/skin-score';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useScanCapture } from '@/hooks/use-scan-capture';
import { useScans } from '@/hooks/use-scans';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';
import { ISSUE_PRIORITY } from '@/lib/scan-calibration';
import { dayKeyOf } from '@/lib/scan-types';

const CAPTURE_GUIDE_KEYS = ['guide1', 'guide2', 'guide3', 'guide4'] as const;
const TREND_WINDOW = 14;

export default function ScanScreen() {
  const scans = useScans();
  const theme = useTheme();
  const { t } = useTranslation();
  const { busy, scores, quality, prevScore, capture } = useScanCapture();

  const scannedToday = scans.length > 0 && scans[scans.length - 1].dayKey === dayKeyOf(Date.now());

  // Localized coaching for the most important issue (derived, not from the lib).
  const worstIssue = quality
    ? ISSUE_PRIORITY.find((issue) => quality.issues.includes(issue))
    : undefined;

  // Delta label for the score reveal — compare against the scan that existed before this capture.
  const isUp = scores !== null && prevScore !== null && scores.overall > prevScore;
  const isDown = scores !== null && prevScore !== null && scores.overall < prevScore;
  const deltaLabel = scores
    ? prevScore === null
      ? t('scan.scoreFirst')
      : scores.overall === prevScore
        ? t('scan.scoreDeltaEqual')
        : isUp
          ? t('scan.scoreDeltaUp', { delta: scores.overall - prevScore })
          : t('scan.scoreDeltaDown', { delta: prevScore - scores.overall })
    : null;

  const trendPoints = scans.slice(-TREND_WINDOW).map((s) => ({ dayKey: s.dayKey, overall: s.scores.overall }));

  return (
    <Screen title={t('scan.title')} subtitle={t('scan.subtitle')}>
      {!scannedToday ? (
        <Card>
          <CameraCapture onCapture={capture} keepLabel={t('scan.finalizeLabel')} liveGuide />

          {busy ? (
            <View style={styles.busyRow}>
              <ActivityIndicator color={theme.text} />
              <ThemedText type="small" themeColor="textSecondary">
                {t('scan.scoring')}
              </ThemedText>
            </View>
          ) : quality && !quality.valid ? (
            <ThemedView type="backgroundSelected" style={styles.rejectionBlock}>
              <ThemedText type="smallBold">{t('scan.retakeTitle')}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t('scan.notScored')}
              </ThemedText>
              <ThemedView type="backgroundElement" style={styles.guideList}>
                {quality.issues.map((issue) => (
                  <View key={issue} style={styles.guideRow}>
                    <ThemedText themeColor="textSecondary">•</ThemedText>
                    <ThemedText type="small" style={styles.guideText}>
                      {t(`scan.issue.${issue}`)}
                    </ThemedText>
                  </View>
                ))}
              </ThemedView>
              {worstIssue ? (
                <ThemedText type="small">{t(`scan.guidance.${worstIssue}`)}</ThemedText>
              ) : null}
            </ThemedView>
          ) : (
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              {t('scan.scoredNote')}
            </ThemedText>
          )}
        </Card>
      ) : !scores ? (
        <Card title={t('scan.alreadyScannedTitle')} hint={t('scan.alreadyScannedHint')}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('scan.alreadyScannedBody')}
          </ThemedText>
        </Card>
      ) : null}

      {scores && !busy ? (
        <Card title={t('scan.yourScore')} hint={t('scan.calibrated')}>
          <SkinScoreView scores={scores} />
          {deltaLabel ? (
            <View style={styles.deltaRow}>
              <ThemedText
                type="smallBold"
                themeColor={isUp ? 'positive' : isDown ? 'textSecondary' : 'text'}>
                {deltaLabel}
              </ThemedText>
            </View>
          ) : null}
          {trendPoints.length > 1 ? (
            <ScoreTrendLine points={trendPoints} />
          ) : null}
          <ThemedText type="small" themeColor="textSecondary">
            {t('scan.disclaimerNote')}
          </ThemedText>
          {quality ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('scan.passedValidation', {
                brightness: Math.round(quality.metrics.brightness),
              })}
            </ThemedText>
          ) : null}
          <ThemedText type="small" themeColor="textSecondary">
            {t('scan.savedNote')}
          </ThemedText>
        </Card>
      ) : null}

      {scores && !busy ? (
        <Card>
          <SkinRecommendationsView scores={scores} />
        </Card>
      ) : null}

      <Card title={t('scan.beforeScan')}>
        <ThemedView type="backgroundElement" style={styles.guideList}>
          {CAPTURE_GUIDE_KEYS.map((key) => (
            <View key={key} style={styles.guideRow}>
              <ThemedText themeColor="textSecondary">•</ThemedText>
              <ThemedText type="small" style={styles.guideText}>
                {t(`scan.${key}`)}
              </ThemedText>
            </View>
          ))}
        </ThemedView>
        <ThemedText type="small" themeColor="textSecondary">
          {t('scan.normalizeNote')}
        </ThemedText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rejectionBlock: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  guideList: {
    gap: Spacing.two,
  },
  guideRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  guideText: {
    flex: 1,
  },
});
