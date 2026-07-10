import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-scheme';
import { useTranslation } from '@/hooks/use-translation';

/**
 * Root stack: the `(tabs)` group renders chromeless (its own native tab bar),
 * while Settings and its sub-pages push on top with a themed native header
 * (title + back). The theme follows the user's Preferences override
 * (System / Light / Dark) via `useResolvedColorScheme`.
 */
export default function RootLayout() {
  const scheme = useResolvedColorScheme();
  const colors = Colors[scheme];
  const { t } = useTranslation();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/routine" options={{ headerShown: false }} />
        <Stack.Screen name="routine-editor" options={{ title: t('routine.editRoutine') }} />
        <Stack.Screen name="settings/index" options={{ title: t('nav.settings') }} />
        <Stack.Screen name="settings/account" options={{ title: t('nav.account') }} />
        <Stack.Screen name="settings/subscription" options={{ title: t('nav.subscription') }} />
        <Stack.Screen name="settings/preferences" options={{ title: t('nav.preferences') }} />
        <Stack.Screen name="settings/language" options={{ title: t('nav.language') }} />
        <Stack.Screen name="settings/privacy" options={{ title: t('nav.privacy') }} />
        <Stack.Screen name="settings/terms" options={{ title: t('nav.terms') }} />
      </Stack>
    </ThemeProvider>
  );
}
