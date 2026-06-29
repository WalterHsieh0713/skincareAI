/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-scheme';

export function useTheme() {
  // Resolves the user's Preferences override (System / Light / Dark), falling
  // back to the OS appearance — so toggling the theme re-colors the whole app.
  return Colors[useResolvedColorScheme()];
}
