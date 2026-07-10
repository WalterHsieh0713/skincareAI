import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { CameraCapture } from '@/components/camera-capture';
import { IngredientRow } from '@/components/ingredient-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import type { Ingredient } from '@/constants/ingredients';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';
import { matchIngredients } from '@/lib/match-ingredients';
import { recognizeText } from '@/lib/ocr';

type Phase = 'idle' | 'reading' | 'done';

export default function IngredientsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Ingredient[] | null>(null);
  const [manual, setManual] = useState('');
  const [hasError, setHasError] = useState(false);

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

  const actives = results?.filter((item) => item.active) ?? [];
  const others = results?.filter((item) => !item.active) ?? [];
  const concerns = results?.filter((item) => item.concern) ?? [];
  const summaryText = results && results.length > 0
    ? concerns.length > 0
      ? t('ingredients.summary', { actives: actives.length, concerns: concerns.length })
      : t('ingredients.summaryClear', { actives: actives.length })
    : null;

  return (
    <Screen title={t('ingredients.title')} subtitle={t('ingredients.subtitle')}>
      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          {t('ingredients.scanIntro')}
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
        <Card
          title={t('ingredients.identified')}
          hint={t('ingredients.found', { n: results.length })}>
          {results.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('ingredients.noMatch')}
            </ThemedText>
          ) : null}

          {summaryText ? (
            <ThemedView type="backgroundElement" style={styles.summaryBar}>
              <ThemedText type="smallBold">{summaryText}</ThemedText>
            </ThemedView>
          ) : null}

          {actives.length > 0 ? (
            <ThemedText type="smallBold" style={summaryText ? styles.sectionGap : undefined}>
              {t('ingredients.keyActives')}
            </ThemedText>
          ) : null}
          {actives.map((item) => (
            <IngredientRow key={item.name} ingredient={item} />
          ))}

          {others.length > 0 ? (
            <ThemedText type="smallBold" style={styles.sectionGap}>
              {t('ingredients.baseSupport')}
            </ThemedText>
          ) : null}
          {others.map((item) => (
            <IngredientRow key={item.name} ingredient={item} />
          ))}
        </Card>
      ) : null}

      <Card title={t('ingredients.pasteTitle')} hint={t('ingredients.pasteHint')}>
        <TextInput
          value={manual}
          onChangeText={setManual}
          placeholder={t('ingredients.pastePlaceholder')}
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.backgroundSelected },
          ]}
        />
        <Button label={t('ingredients.identifyBtn')} onPress={handleManual} />
      </Card>

      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          {t('ingredients.eduNote')}
        </ThemedText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  summaryBar: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  sectionGap: {
    marginTop: Spacing.two,
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
