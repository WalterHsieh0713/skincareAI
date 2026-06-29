import { useCallback } from 'react';

import { useSettings } from '@/hooks/use-settings';
import { translate } from '@/i18n';
import type { TParams } from '@/i18n/types';

/**
 * Reactive translator bound to the user's selected language. Because it reads
 * `language` from the settings store (via `useSettings`), every component that
 * calls `t()` re-renders when the language changes — so the whole app switches.
 */
export function useTranslation() {
  const { language } = useSettings();
  const t = useCallback(
    (key: string, params?: TParams) => translate(language, key, params),
    [language],
  );
  /** Plural helper: picks the `_one` / `_other` variant by count. */
  const tn = useCallback(
    (key: string, count: number, params?: TParams) =>
      translate(language, `${key}_${count === 1 ? 'one' : 'other'}`, {
        count,
        ...params,
      }),
    [language],
  );
  return { t, tn, language };
}
