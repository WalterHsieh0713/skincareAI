import { StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type CardProps = {
  title?: string;
  hint?: string;
  /** Optional element pinned to the top-right of the title row (e.g. an action button). */
  action?: React.ReactNode;
  children?: React.ReactNode;
  style?: ViewStyle;
};

/** Rounded surface used to group content on a screen. */
export function Card({ title, hint, action, children, style }: CardProps) {
  return (
    <ThemedView type="backgroundElement" style={[styles.card, style]}>
      {title ? (
        <ThemedView type="backgroundElement" style={styles.titleRow}>
          <ThemedText type="smallBold">{title}</ThemedText>
          {action ? (
            action
          ) : hint ? (
            <ThemedText type="small" themeColor="textSecondary">
              {hint}
            </ThemedText>
          ) : null}
        </ThemedView>
      ) : null}
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
