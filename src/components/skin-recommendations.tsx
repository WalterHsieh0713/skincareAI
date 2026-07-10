import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { IngredientRow } from '@/components/ingredient-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { getSkinRecommendations } from '@/lib/recommendations';
import type { SkinScores } from '@/lib/scan-types';

/**
 * Post-scan, brand-neutral ingredient + product-type education for whichever
 * axes scored below the "looking good" threshold — e.g. elevated blemishes
 * surfaces salicylic acid / benzoyl peroxide + "a BHA cleanser". These are
 * educational suggestions from an image-derived indicator, never a diagnosis
 * or a personalized "buy this" verdict (see `recommendations.disclaimer`).
 */
export function SkinRecommendationsView({ scores }: { scores: SkinScores }) {
  const { t } = useTranslation();
  const results = getSkinRecommendations(scores);

  if (results.length === 0) {
    return (
      <ThemedView type="backgroundElement" style={styles.container}>
        <ThemedText type="smallBold">{t('recommendations.allGoodTitle')}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('recommendations.allGoodBody')}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold">{t('recommendations.title')}</ThemedText>

      {results.map((result) => (
        <View key={result.axis} style={styles.axisBlock}>
          <ThemedText type="small">{t(`recommendations.reason.${result.axis}`)}</ThemedText>

          <View style={styles.productTypes}>
            {result.productTypeKeys.map((key) => (
              <View key={key} style={styles.bulletRow}>
                <ThemedText themeColor="textSecondary">•</ThemedText>
                <ThemedText type="small" style={styles.bulletText}>
                  {t(`recommendations.productType.${key}`)}
                </ThemedText>
              </View>
            ))}
          </View>

          {result.ingredients.map((ingredient) => (
            <IngredientRow key={ingredient.name} ingredient={ingredient} />
          ))}
        </View>
      ))}

      <Link href="/ingredients" asChild>
        <Button variant="secondary" label={t('recommendations.checkIngredients')} />
      </Link>

      <ThemedText type="small" themeColor="textSecondary">
        {t('recommendations.disclaimer')}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  axisBlock: {
    gap: Spacing.two,
  },
  productTypes: {
    gap: Spacing.one,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  bulletText: {
    flex: 1,
  },
});
