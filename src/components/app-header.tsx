import { Link } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useRoutine } from '@/hooks/use-routine';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';

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
          <ThemedText type="smallBold" style={styles.streakText}>🔥</ThemedText>
          <ThemedText type="smallBold" style={styles.streakText}>{streak}</ThemedText>
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
        <ThemedText type="smallBold" style={[styles.gearIcon, styles.gearText]}>⚙</ThemedText>
      </Pressable>
    </Link>
  );
}

/**
 * Persistent, app-wide top bar: the 60pt "Dewpoint" wordmark on the left,
 * streak badge + settings gear on the right — all on one row. Rendered once,
 * above the tab navigator (web: above the custom tab pill; native: above the
 * OS-controlled NativeTabs), so it never scrolls away and never duplicates
 * per-screen.
 */
export function AppHeader() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ThemedView
      style={[
        styles.wrapper,
        { backgroundColor: theme.background, paddingLeft: insets.left, paddingRight: insets.right },
        Platform.select({
          web: { paddingTop: Spacing.four },
          default: { paddingTop: insets.top + Spacing.two },
        }),
      ]}>
      <View style={styles.row}>
        <ThemedText type="wordmark">Dewpoint</ThemedText>
        <View style={styles.actions}>
          <StreakBadge />
          <SettingsGear />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  row: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  actions: {
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
  streakText: {
    fontSize: 20,
    lineHeight: 24,
  },
  gearIcon: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  gearText: {
    fontSize: 20,
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.7,
  },
});
