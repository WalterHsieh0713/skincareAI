import { Pressable, type PressableProps, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type SettingsRowProps = PressableProps & {
  label: string;
  /** Current value / status shown on the right. */
  value?: string;
  /** Optional helper line under the label. */
  description?: string;
  /** Hide the trailing chevron (e.g. for non-navigating rows). */
  chevron?: boolean;
};

/**
 * One tappable row in a settings list. Forwards press/ref props, so it works as
 * a `<Link href=... asChild>` child for navigation or with a plain `onPress`.
 */
export function SettingsRow({
  label,
  value,
  description,
  chevron = true,
  style,
  ...rest
}: SettingsRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={(state) => [
        styles.row,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      <View style={styles.text}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {description ? (
          <ThemedText type="small" themeColor="textSecondary">
            {description}
          </ThemedText>
        ) : null}
      </View>
      <View style={styles.right}>
        {value ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {value}
          </ThemedText>
        ) : null}
        {chevron ? (
          <ThemedText type="small" themeColor="textSecondary">
            ›
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  text: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.6,
  },
});
