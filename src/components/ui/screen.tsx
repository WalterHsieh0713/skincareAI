import { Link } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useRoutine } from '@/hooks/use-routine';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';

type ScreenProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  /** Hide the in-page title block (e.g. when a native header already shows it). */
  hideHeader?: boolean;
  /** Show the streak badge in the header. Defaults to true. */
  showStreak?: boolean;
};

/** Flame streak badge — shows current consecutive-day routine streak, links to /routine. */
function StreakBadge() {
  const { streak } = useRoutine();
  const { t } = useTranslation();
  return (
    <Link href="/routine" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.streakLabel', { n: streak })}
        hitSlop={Spacing.two}
        style={({ pressed }) => [pressed && styles.pressed]}>
        <ThemedView type="backgroundElement" style={styles.streakBadge}>
          <ThemedText type="smallBold">🔥</ThemedText>
          <ThemedText type="smallBold">{streak}</ThemedText>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

/** Compact gear icon that opens the Settings page. */
function SettingsGear() {
  const { t } = useTranslation();
  return (
    <Link href="/settings" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.settings')}
        hitSlop={Spacing.two}
        style={({ pressed }) => [pressed && styles.pressed]}>
        <ThemedText type="smallBold" style={styles.gearIcon}>⚙</ThemedText>
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
  showStreak = true,
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
              <View style={styles.headerActions}>
                {showStreak ? <StreakBadge /> : null}
                <SettingsGear />
              </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  gearIcon: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
