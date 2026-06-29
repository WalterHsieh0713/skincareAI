/**
 * Device-local time helpers for the AM/PM routine.
 *
 * On both iPhone and web, JS `Date` reads the OS time zone, so `getHours()` and
 * the `dayKeyOf` getters already reflect the user's current zone (including any
 * change from travel). We just surface that here for the routine UI.
 */

import type { RoutinePart } from '@/lib/routine';

/** AM window: 9:00 AM – 12:00 PM (noon). */
const AM_START = 9;
const AM_END = 12;

/** PM window: 7:00 PM – 12:00 AM (midnight). */
const PM_START = 19;
const PM_END = 24;

/**
 * The IANA time zone the device is currently set to (e.g. `America/New_York`).
 * Falls back to `'local'` on the rare runtime without `Intl` support.
 */
export function localTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'local';
  } catch {
    return 'local';
  }
}

/**
 * Which routine is active *right now* in the device's local time zone:
 * `'am'` during the AM window, `'pm'` during the PM window, or `'am'` as
 * fallback when outside both windows (used only for sort order, not submission).
 */
export function currentPart(now: number): RoutinePart {
  const h = new Date(now).getHours();
  if (h >= AM_START && h < AM_END) return 'am';
  if (h >= PM_START && h < PM_END) return 'pm';
  return 'am';
}

/** Whether the given part's submission window is open right now. */
export function isWindowOpen(now: number, part: RoutinePart): boolean {
  const h = new Date(now).getHours();
  if (part === 'am') return h >= AM_START && h < AM_END;
  return h >= PM_START && h < PM_END;
}

/** Human-readable window string for a part (e.g. "9 AM – 12 PM"). */
export function windowLabel(part: RoutinePart): string {
  if (part === 'am') return '9 AM – 12 PM';
  return '7 PM – 12 AM';
}
