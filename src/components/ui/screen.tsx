import { useFocusEffect } from '@react-navigation/native';
import { useSegments } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
 * Scrollable, theme-aware page wrapper shared by every Dewpoint tab.
 * Handles safe-area insets, the floating tab bar offset, and max content width
 * so individual screens only describe their content, plus the page-specific
 * heading. On native, `AppHeader` (wordmark/streak/settings) renders here for
 * `(tabs)` screens only, once per screen — `NativeTabs` must own its screen
 * directly (wrapping it with a sibling header broke the native tab bar
 * entirely), so each tab screen renders its own copy instead of sharing one
 * above the navigator. Settings/routine-editor screens already have a native
 * Stack header and opt out via the `(tabs)` segment check.
 * On web, `AppHeader` still renders once above the tab pill in `app-tabs.web.tsx`.
 * Resets scroll to top whenever the screen regains focus (switching tabs
 * used to leave scroll position stale).
 */
export function Screen({
  title,
  subtitle,
  children,
  contentStyle,
  hideHeader = false,
}: ScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const isTabScreen = useSegments()[0] === '(tabs)';

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
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
    <>
      {Platform.OS !== 'web' && isTabScreen && <AppHeader />}
      <ScrollView
        ref={scrollRef}
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
        <ThemedView style={[styles.container, contentStyle]}>
          {hideHeader ? null : (
            <ThemedView style={styles.header}>
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
    </>
  );
}

const styles = StyleSheet.create({
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
});
