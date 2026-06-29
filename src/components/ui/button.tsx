import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary';
};

/** Pill button used for primary screen actions. Works standalone or via `<Link asChild>`. */
export function Button({ label, variant = 'primary', style, ...rest }: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        state.pressed && styles.pressed,
      ]}
      {...rest}>
      <ThemedView
        type={isPrimary ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.button, isPrimary && { backgroundColor: theme.text }]}>
        <ThemedText
          type="smallBold"
          style={isPrimary ? { color: theme.background } : undefined}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
