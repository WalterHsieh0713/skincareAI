import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CameraCapture } from '@/components/camera-capture';
import { SkinScoreView } from '@/components/skin-score';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';
import { calibrateScan } from '@/lib/scan-calibration';
import { analyzeFace, downscaleForStorage } from '@/lib/scan-image';
import { addScan } from '@/lib/scan-store';
import {
  dayKeyOf,
  type ScanQuality,
  type ScanQualityIssue,
  type SkinScores,
} from '@/lib/scan-types';

const CAPTURE_GUIDE_KEYS = ['guide1', 'guide2', 'guide3', 'guide4'] as const;

// Worst-first order so the coaching line targets the single most important fix.
const ISSUE_PRIORITY: ScanQualityIssue[] = [
  'no-face',
  'blurry',
  'too-dark',
  'too-bright',
  'uneven-lighting',
  'face-too-small',
  'off-center',
];

export default function ScanScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [scores, setScores] = useState<SkinScores | null>(null);
  const [quality, setQuality] = useState<ScanQuality | null>(null);

  const handleCapture = useCallback(async (dataUrl: string) => {
    setBusy(true);
    setScores(null);
    setQuality(null);
    try {
      // 1. Validate + calibrate before anything is scored or saved.
      const { dataUrl: calibrated, quality: verdict } = await calibrateScan(dataUrl);
      setQuality(verdict);
      if (!verdict.valid) {
        // Reject: don't score or persist a non-comparable capture.
        return;
      }

      // 2. Score the calibrated image and persist it with its verdict.
      const [result, stored] = await Promise.all([
        analyzeFace(calibrated),
        downscaleForStorage(calibrated),
      ]);
      const takenAt = Date.now();
      await addScan({
        takenAt,
        dayKey: dayKeyOf(takenAt),
        image: stored,
        scores: result,
        quality: verdict,
      });
      setScores(result);
    } finally {
      setBusy(false);
    }
  }, []);

  // Localized coaching for the most important issue (derived, not from the lib).
  const worstIssue = quality
    ? ISSUE_PRIORITY.find((issue) => quality.issues.includes(issue))
    : undefined;

  return (
    <Screen title={t('scan.title')} subtitle={t('scan.subtitle')}>
      <Card>
        <CameraCapture onCapture={handleCapture} keepLabel={t('scan.keepLabel')} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          {t('scan.scoredNote')}
        </ThemedText>
      </Card>

      {busy ? (
        <Card>
          <View style={styles.busyRow}>
            <ActivityIndicator color={theme.text} />
            <ThemedText type="small" themeColor="textSecondary">
              {t('scan.scoring')}
            </ThemedText>
          </View>
        </Card>
      ) : null}

      {quality && !quality.valid && !busy ? (
        <Card title={t('scan.retakeTitle')} hint={t('scan.notScored')}>
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
          <ThemedText type="small" themeColor="textSecondary">
            {t('scan.onlyScoreNote')}
          </ThemedText>
        </Card>
      ) : null}

      {scores && !busy ? (
        <Card title={t('scan.yourScore')} hint={t('scan.calibrated')}>
          <SkinScoreView scores={scores} />
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
