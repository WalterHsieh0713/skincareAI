import { LinearGradient } from 'expo-linear-gradient';
import { Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Glow, MaxContentWidth, Spacing } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-scheme';

type ScreenProps = {
  /** Per-page heading (e.g. "Routine", "Scan"). Omit on screens that only need
   * body copy under the global Dewpoint header (e.g. Home). */
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  /** Hide the in-page title block (e.g. when a native header already shows it). */
  hideHeader?: boolean;
};

/**
 * Scrollable, theme-aware page wrapper shared by every Dewpoint tab. Paints
 * a soft top-down glow — light fading into the flat page background, like a
 * spotlight from above — rather than a flat color or a corner-to-corner
 * wash. Handles safe-area insets, the floating tab bar offset, and max
 * content width so individual screens only describe their content. The
 * brand wordmark, streak badge, and settings gear live in the persistent
 * `AppHeader` above the tab navigator, not here — this only renders the
 * page-specific heading.
 */
export function Screen({
  title,
  subtitle,
  children,
  contentStyle,
  hideHeader = false,
}: ScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const scheme = useResolvedColorScheme();

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.two,
      paddingBottom: Spacing.four,
    },
    default: {
      paddingBottom: insets.bottom,
    },
  });

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Glow[scheme][0], Glow[scheme][1], Glow[scheme][1]]}
        locations={[0, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        style={styles.scrollView}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
        <ThemedView style={[styles.container, contentStyle, styles.transparent]}>
          {hideHeader ? null : (
            <ThemedView style={[styles.header, styles.transparent]}>
              {title ? (
                <ThemedText type="subtitle" style={styles.headerTitle}>
                  {title}
                </ThemedText>
              ) : null}
              {subtitle ? (
                <ThemedText themeColor="textSecondary">{subtitle}</ThemedText>
              ) : null}
            </ThemedView>
          )}
          {children}
        </ThemedView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.one,
    paddingTop: Spacing.three,
  },
  headerTitle: {
    flexShrink: 1,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
});
