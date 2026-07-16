import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SkinScoreView } from '@/components/skin-score';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { GlassView } from '@/components/ui/glass-view';
import { GradientText } from '@/components/ui/gradient-text';
import { FontFamily, Spacing, WordmarkGradient, WordmarkGradientDirection } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-scheme';
import { useTranslation } from '@/hooks/use-translation';

/** Fabricated scores used purely to illustrate what a scored scan looks like. */
const PREVIEW_SCORES = { overall: 82, redness: 74, texture: 68, blemishes: 88, hydration: 71 };

/**
 * First screen a new install ever sees: a preview of the Dew Score card
 * (the app's core hook) filling most of the screen, with a value-prop line
 * and a single "Get Started" CTA pinned to the bottom. Continues into the
 * existing routine-builder onboarding wizard — no account form yet, since
 * there's no backend to back one.
 */
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const scheme = useResolvedColorScheme();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.preview}>
        <GlassView style={[styles.previewCard, styles.shadow]}>
          <View style={styles.previewHeader}>
            <GradientText
              colors={WordmarkGradient[scheme]}
              direction={WordmarkGradientDirection[scheme]}
              style={styles.wordmark}>
              Dewpoint
            </GradientText>
            <ThemedView type="backgroundSelected" style={styles.streakPill}>
              <ThemedText type="smallBold">🔥 12</ThemedText>
            </ThemedView>
          </View>
          <SkinScoreView scores={PREVIEW_SCORES} />
        </GlassView>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.four }]}>
        <ThemedText type="subtitle" style={styles.headline}>
          {t('welcome.headline')}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.body}>
          {t('welcome.body')}
        </ThemedText>
        <Button
          label={t('welcome.getStarted')}
          onPress={() => router.replace('/onboarding/routine')}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  previewCard: {
    borderRadius: Spacing.five,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  shadow: {
    shadowColor: '#FFB7C5',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: FontFamily.displayBold,
    fontSize: 28,
    lineHeight: 40,
    paddingBottom: 6,
  },
  streakPill: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  footer: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  headline: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
});
