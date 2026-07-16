import { StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassView } from '@/components/ui/glass-view';
import { Spacing } from '@/constants/theme';

type CardProps = {
  title?: string;
  hint?: string;
  /** Optional element pinned to the top-right of the title row (e.g. an action button). */
  action?: React.ReactNode;
  children?: React.ReactNode;
  style?: ViewStyle;
};

/** Rounded, frosted-glass surface used to group content on a screen. */
export function Card({ title, hint, action, children, style }: CardProps) {
  return (
    <GlassView style={[styles.card, styles.shadow, style]}>
      {title ? (
        <View style={styles.titleRow}>
          <ThemedText type="smallBold">{title}</ThemedText>
          {action ? (
            action
          ) : hint ? (
            <ThemedText type="small" themeColor="textSecondary">
              {hint}
            </ThemedText>
          ) : null}
        </View>
      ) : null}
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  shadow: {
    shadowColor: '#FFB7C5',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
