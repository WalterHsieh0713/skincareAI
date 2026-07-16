import { Text, type TextProps } from 'react-native';

type GradientTextProps = TextProps & {
  colors: readonly [string, string, ...string[]];
  direction?: 'horizontal' | 'vertical';
};

/**
 * Web counterpart to `gradient-text.tsx`. `@react-native-masked-view`'s web
 * shim is a no-op (it renders only the mask element and silently drops the
 * gradient — https://github.com/react-native-masked-view — so the native
 * MaskedView + LinearGradient recipe never shows a gradient in a browser.
 * CSS `background-clip: text` is the real way to do gradient-filled text on
 * web, so this platform file uses that directly instead.
 */
export function GradientText({
  colors,
  direction = 'horizontal',
  style,
  children,
  ...rest
}: GradientTextProps) {
  const angle = direction === 'vertical' ? '180deg' : '90deg';
  return (
    <Text
      style={[
        style,
        {
          backgroundImage: `linear-gradient(${angle}, ${colors.join(', ')})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ]}
      {...rest}>
      {children}
    </Text>
  );
}
