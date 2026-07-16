/** User-facing app settings, persisted on-device (no backend in this build). */

export type ThemePreference = 'system' | 'light' | 'dark';
export type SubscriptionPlan = 'free' | 'premium';

export type Settings = {
  /** Light/dark override; 'system' follows the OS appearance. */
  themePreference: ThemePreference;
  /** Preferred language as a BCP-47 tag (e.g. 'en', 'pt-BR'). */
  language: string;
  /** Display name, editable under Privacy & Security. */
  username: string;
  /** Account email. */
  email: string;
  /** Current subscription tier. */
  plan: SubscriptionPlan;
};

export const DEFAULT_SETTINGS: Settings = {
  themePreference: 'light',
  language: 'en',
  username: 'dewdrop',
  email: 'you@example.com',
  plan: 'free',
};

/** Merge a persisted (possibly partial/old) blob onto the current defaults. */
export function normalizeSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_SETTINGS };
  }
  return { ...DEFAULT_SETTINGS, ...(raw as Partial<Settings>) };
}
