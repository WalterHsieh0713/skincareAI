import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CameraCapture } from '@/components/camera-capture';
import { SkinRecommendationsView } from '@/components/skin-recommendations';
import { SkinScoreView } from '@/components/skin-score';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useScanCapture } from '@/hooks/use-scan-capture';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';
import { ISSUE_PRIORITY } from '@/lib/scan-calibration';
import { EMPTY_ROUTINE_CONFIG } from '@/lib/routine-config';
import { setRoutine } from '@/lib/routine-config-store';

const CAPTURE_GUIDE_KEYS = ['guide1', 'guide2', 'guide3', 'guide4'] as const;

/**
 * Onboarding path (c): "never done skincare before". Take a first guided
 * scan — this becomes the user's baseline — then show ingredient
 * recommendations based on that scan's results before landing on Home.
 */
export default function OnboardingFirstScanScreen() {
  const theme = useTheme();
  const { t, tn } = useTranslation();
  const profile = useProfile();
  const { busy, scores, quality, calibrating, scansUntilBaseline, capture } = useScanCapture();

  const worstIssue = quality
    ? ISSUE_PRIORITY.find((issue) => quality.issues.includes(issue))
    : undefined;

  function finish() {
    setRoutine(EMPTY_ROUTINE_CONFIG);
    profile.update({ onboarded: true });
    router.replace('/');
  }

  return (
    <Screen title={t('onboardingFirstScan.title')} subtitle={t('onboardingFirstScan.subtitle')}>
      {!scores ? (
        <Card>
          <CameraCapture onCapture={capture} keepLabel={t('scan.finalizeLabel')} liveGuide />
        </Card>
      ) : null}

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
          <View style={styles.guideList}>
            {quality.issues.map((issue) => (
              <View key={issue} style={styles.guideRow}>
                <ThemedText themeColor="textSecondary">•</ThemedText>
                <ThemedText type="small" style={styles.guideText}>
                  {t(`scan.issue.${issue}`)}
                </ThemedText>
              </View>
            ))}
          </View>
          {worstIssue ? (
            <ThemedText type="small">{t(`scan.guidance.${worstIssue}`)}</ThemedText>
          ) : null}
        </Card>
      ) : null}

      {scores && !busy ? (
        <Card
          title={t('onboardingFirstScan.baselineTitle')}
          hint={calibrating ? tn('scan.calibratingHint', scansUntilBaseline) : t('scan.calibrated')}>
          <SkinScoreView scores={scores} />
        </Card>
      ) : null}

      {scores && !busy ? (
        <Card>
          <SkinRecommendationsView scores={scores} />
        </Card>
      ) : null}

      {!scores ? (
        <Card title={t('scan.beforeScan')}>
          <View style={styles.guideList}>
            {CAPTURE_GUIDE_KEYS.map((key) => (
              <View key={key} style={styles.guideRow}>
                <ThemedText themeColor="textSecondary">•</ThemedText>
                <ThemedText type="small" style={styles.guideText}>
                  {t(`scan.${key}`)}
                </ThemedText>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {scores && !busy ? (
        <Button label={t('onboardingFirstScan.continue')} onPress={finish} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
