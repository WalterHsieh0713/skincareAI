import { Link } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';

type ScreenProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  /** Hide the in-page title block (e.g. when a native header already shows it). */
  hideHeader?: boolean;
  /** Show the Settings toolbar button in the header. Defaults to true. */
  showSettings?: boolean;
};

/** Top-row toolbar action that opens the Settings page. */
function SettingsButton() {
  const { t } = useTranslation();
  return (
    <Link href="/settings" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.settings')}
        hitSlop={Spacing.two}
        style={({ pressed }) => [pressed && styles.pressed]}>
        <ThemedView type="backgroundElement" style={styles.settingsButton}>
          <ThemedText type="smallBold">⚙</ThemedText>
          <ThemedText type="smallBold">{t('common.settings')}</ThemedText>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

/**
 * Scrollable, theme-aware page wrapper shared by every Dewpoint tab.
 * Handles safe-area insets, the floating tab bar offset, and max content width
 * so individual screens only describe their content.
 */
export function Screen({
  title,
  subtitle,
  children,
  contentStyle,
  hideHeader = false,
  showSettings = true,
}: ScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

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
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
    default: {
      paddingBottom: insets.bottom,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={[styles.container, contentStyle]}>
        {hideHeader ? null : (
          <ThemedView style={styles.header}>
            <ThemedView style={styles.headerRow}>
              <ThemedText type="subtitle" style={styles.headerTitle}>
                {title}
              </ThemedText>
              {showSettings ? <SettingsButton /> : null}
            </ThemedView>
            {subtitle ? (
              <ThemedText themeColor="textSecondary">{subtitle}</ThemedText>
            ) : null}
          </ThemedView>
        )}
        {children}
      </ThemedView>
    </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerTitle: {
    flexShrink: 1,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
});
