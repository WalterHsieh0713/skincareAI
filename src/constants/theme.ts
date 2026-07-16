/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * "Cherry blossom" — clean cream/rice-white with a soft-pink accent, aiming
 * for a glassy, well-scented, K-beauty-flagship-store feel: airy blush
 * surfaces in light mode, a warm charcoal boutique in dark mode. Actual
 * translucency + blur (see `GlassView`) carries the "glassy" read — flat
 * colors here stay light and thin rather than doing the work with heavy
 * tint or saturation. No green anywhere — pale lavender stands in for
 * "selected" states instead.
 */
export const Colors = {
  light: {
    text: '#3A3234',
    // Rice-white/cream with a whisper of pink.
    background: '#FBEDE5',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8E6E4',
    textSecondary: '#7C6D6F',
    accent: '#F2C7C7',
    accentSoft: '#FBE7E4',
    border: 'rgba(214, 130, 130, 0.22)',
  },
  dark: {
    text: '#FBF2F2',
    background: '#3B2E30',
    backgroundElement: '#4C3B3D',
    backgroundSelected: '#9A9AA2',
    textSecondary: '#D6C4C6',
    accent: '#FFC4D1',
    accentSoft: '#F2C7C7',
    border: 'rgba(255, 255, 255, 0.1)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Blossom-pink gradient stops for CTAs and glow accents. */
export const AccentGradient = {
  light: ['#F2C7C7', '#FFB7C5'] as const,
  dark: ['#FFC4D1', '#F2C7C7'] as const,
};

/** Tint overlay + blur intensity for `GlassView` frosted surfaces. */
export const Glass = {
  light: { tint: 'rgba(255, 255, 255, 0.5)', intensity: 35, blurTint: 'light' as const },
  dark: { tint: 'rgba(51, 42, 44, 0.4)', intensity: 35, blurTint: 'dark' as const },
};

/** Soft glint border for `GlassView` — mimics light catching a glass edge,
 * rather than a tinted outline matched to the surface color. */
export const GlassBorder = {
  light: 'rgba(255, 255, 255, 0.6)',
  dark: 'rgba(255, 255, 255, 0.14)',
};

/**
 * "Dewpoint" wordmark gradient (see `GradientText`). Light mode runs
 * top-to-bottom, purple → black, for contrast against the pale background;
 * dark mode runs left-to-right, white → peach → pink, since a black bookend
 * would vanish into the dark background instead of standing out.
 * `WordmarkGradientDirection` pairs each with its orientation.
 */
export const WordmarkGradient = {
  light: ['#6B4E8C', '#211A1C'] as const,
  dark: ['#FFFFFF', '#FFD9C2', '#FFB7C5'] as const,
};

export const WordmarkGradientDirection = {
  light: 'vertical' as const,
  dark: 'horizontal' as const,
};

/**
 * Soft top-down glow — a spotlight fading into the flat page background,
 * rather than a corner-to-corner color wash. Rendered once behind `Screen`
 * content and the tab header for a "light coming from above" read.
 */
export const Glow = {
  light: ['#F2F2F5', '#FBEDE5'] as const,
  dark: ['#5C4D5C', '#3B2E30'] as const,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/**
 * Brand type pairing: Fraunces (soft-contrast serif) for headlines/wordmark/
 * hero numbers, Manrope (geometric sans) for body/UI text — loaded via
 * `useFonts` in the root layout. Falls back to the system font until loaded.
 */
export const FontFamily = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  body: 'Manrope_500Medium',
  bodyBold: 'Manrope_700Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
