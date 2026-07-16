import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, type TextProps } from 'react-native';

type GradientTextProps = TextProps & {
  colors: readonly [string, string, ...string[]];
  direction?: 'horizontal' | 'vertical';
};

/**
 * Text filled with a gradient instead of a flat color, via the standard
 * MaskedView + LinearGradient recipe (RN Text has no native gradient-fill
 * support). Used for the "Dewpoint" wordmark.
 */
export function GradientText({
  colors,
  direction = 'horizontal',
  style,
  children,
  ...rest
}: GradientTextProps) {
  const end = direction === 'vertical' ? { x: 0, y: 1 } : { x: 1, y: 0 };
  return (
    <MaskedView maskElement={<Text style={style} {...rest}>{children}</Text>}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={end}>
        <Text style={[style, { opacity: 0 }]} {...rest}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}
