import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { CameraCapture } from '@/components/camera-capture';
import { IngredientRow } from '@/components/ingredient-row';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';
import type { Ingredient } from '@/constants/ingredients';
import { EMPTY_ROUTINE_CONFIG } from '@/lib/routine-config';
import { setRoutine } from '@/lib/routine-config-store';
import { matchIngredients } from '@/lib/match-ingredients';
import { recognizeText } from '@/lib/ocr';

type Phase = 'idle' | 'reading' | 'done';

/**
 * Onboarding path (a) fixed routine/fixed products and (b) building
 * routine/finding products: log what the user already uses, via the same
 * scan-a-label / paste-a-list flow as the Ingredients tab. Routine steps
 * themselves are added later from Home/Routine — this step only needs to
 * finish onboarding, so Continue/Skip both move on the same way.
 */
export default function OnboardingProductsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const profile = useProfile();
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Ingredient[] | null>(null);
  const [manual, setManual] = useState('');
  const [hasError, setHasError] = useState(false);

  const isFixed = profile.hobby === 'fixed';

  const runMatch = useCallback((text: string) => {
    setResults(matchIngredients(text));
    setPhase('done');
  }, []);

  const handleCapture = useCallback(
    async (dataUrl: string) => {
      setHasError(false);
      setPhase('reading');
      setProgress(0);
      try {
        const text = await recognizeText(dataUrl, setProgress);
        runMatch(text);
      } catch {
        setHasError(true);
        setPhase('idle');
      }
    },
    [runMatch],
  );

  const handleManual = useCallback(() => {
    if (manual.trim()) {
      runMatch(manual);
    }
  }, [manual, runMatch]);

  function finish() {
    setRoutine(EMPTY_ROUTINE_CONFIG);
    profile.update({ onboarded: true });
    router.replace('/');
  }

  return (
    <Screen
      title={t('onboardingProducts.title')}
      subtitle={isFixed ? t('onboardingProducts.subtitleFixed') : t('onboardingProducts.subtitleBuilding')}>
      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          {t('onboardingProducts.intro')}
        </ThemedText>
        <CameraCapture
          facing="environment"
          crop="full"
          startLabel={t('ingredients.startLabel')}
          keepLabel={t('ingredients.keepLabel')}
          onCapture={handleCapture}
        />
      </Card>

      {phase === 'reading' ? (
        <Card>
          <View style={styles.readingRow}>
            <ActivityIndicator color={theme.text} />
            <ThemedText type="small" themeColor="textSecondary">
              {t('ingredients.reading', { pct: Math.round(progress * 100) })}
            </ThemedText>
          </View>
        </Card>
      ) : null}

      {hasError ? (
        <Card>
          <ThemedText type="small" themeColor="textSecondary">
            {t('ingredients.readError')}
          </ThemedText>
        </Card>
      ) : null}

      {phase === 'done' && results ? (
        <Card title={t('ingredients.identified')} hint={t('ingredients.found', { n: results.length })}>
          {results.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('ingredients.noMatch')}
            </ThemedText>
          ) : (
            results.map((item) => <IngredientRow key={item.name} ingredient={item} />)
          )}
        </Card>
      ) : null}

      <Card title={t('ingredients.pasteTitle')} hint={t('ingredients.pasteHint')}>
        <TextInput
          value={manual}
          onChangeText={setManual}
          placeholder={t('ingredients.pastePlaceholder')}
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundSelected }]}
        />
        <Button label={t('ingredients.identifyBtn')} onPress={handleManual} />
      </Card>

      <Button label={t('onboardingProducts.continue')} onPress={finish} />
      <Button label={t('onboardingProducts.skip')} variant="secondary" onPress={finish} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  input: {
    minHeight: 96,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
  },
});
