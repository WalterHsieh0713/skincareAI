import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Ingredient } from '@/constants/ingredients';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** One identified ingredient: name, category chip, function, and optional concern. */
export function IngredientRow({ ingredient }: { ingredient: Ingredient }) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.itemRow}>
      <View style={styles.itemHeader}>
        <ThemedText type="smallBold" style={styles.itemName}>
          {ingredient.name}
        </ThemedText>
        <ThemedView type="backgroundSelected" style={styles.chip}>
          <ThemedText type="small" themeColor="textSecondary">
            {ingredient.category}
          </ThemedText>
        </ThemedView>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {ingredient.function}
      </ThemedText>
      {ingredient.concern ? (
        <ThemedText type="small" style={{ color: theme.text }}>
          ⚠ {ingredient.concern}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  itemRow: {
    gap: Spacing.one,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemName: {
    flex: 1,
  },
  chip: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
});
