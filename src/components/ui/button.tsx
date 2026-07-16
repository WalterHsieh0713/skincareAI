import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassView } from '@/components/ui/glass-view';
import { AccentGradient, Colors, GlassBorder, Spacing } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-scheme';

type ButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary';
};

/** Pill button used for primary screen actions. Works standalone or via `<Link asChild>`. */
export function Button({ label, variant = 'primary', style, ...rest }: ButtonProps) {
  const scheme = useResolvedColorScheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        state.pressed && styles.pressed,
      ]}
      {...rest}>
      {isPrimary ? (
        <LinearGradient
          colors={AccentGradient[scheme]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, { borderColor: GlassBorder[scheme] }]}>
          {/* AccentGradient stays a light pastel in both themes, so the label
              is always dark rather than following theme.text. */}
          <ThemedText type="smallBold" style={styles.primaryLabel}>
            {label}
          </ThemedText>
        </LinearGradient>
      ) : (
        <GlassView style={[styles.button]}>
          <ThemedText type="smallBold">{label}</ThemedText>
        </GlassView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: Colors.light.text,
  },
  pressed: {
    opacity: 0.7,
  },
});
