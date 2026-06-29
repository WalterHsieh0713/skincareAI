import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/hooks/use-settings';

/**
 * The effective light/dark scheme: the user's Preferences override when set,
 * otherwise the OS appearance. Used by the theme and the root navigation header.
 */
export function useResolvedColorScheme(): 'light' | 'dark' {
  const system = useColorScheme();
  const { themePreference } = useSettings();
  if (themePreference === 'light' || themePreference === 'dark') {
    return themePreference;
  }
  return system === 'dark' ? 'dark' : 'light';
}
