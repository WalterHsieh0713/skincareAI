import { BlurView } from 'expo-blur';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Glass, GlassBorder } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-scheme';

/**
 * Frosted-glass surface: a real blur of whatever's behind it, a thin
 * translucent tint, and a soft white glint border (light catching a glass
 * edge, rather than an outline tinted to match the surface). Used wherever a
 * surface should read as glassy rather than a flat panel — `Card`, `Button`,
 * the onboarding preview, etc. `style` should carry layout/spacing/
 * borderRadius; this component owns the blur/tint/border layers and clips
 * them to that shape.
 */
export function GlassView({ style, children, ...rest }: ViewProps) {
  const scheme = useResolvedColorScheme();
  const glass = Glass[scheme];

  return (
    <View style={[styles.clip, { borderColor: GlassBorder[scheme] }, style]} {...rest}>
      <BlurView intensity={glass.intensity} tint={glass.blurTint} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: glass.tint }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    borderWidth: 1,
  },
});
