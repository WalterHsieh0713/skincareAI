import { dayKeyOf, RANGE_DAYS, type TimelapseRange } from '@/lib/scan-types';

export type RoutinePart = 'am' | 'pm';
export type DayRoutine = { am: boolean; pm: boolean };
/** Map of day key (`YYYY-MM-DD`) → that day's AM/PM submission state. */
export type RoutineLog = Record<string, DayRoutine>;
/** Day keys patched by a streak restore → epoch ms the restore was spent. */
export type RestoreLog = Record<string, number>;
/** Full routine state: the daily AM/PM log plus the restores that have patched it. */
export type RoutineState = { log: RoutineLog; restored: RestoreLog };

const DAY_MS = 24 * 60 * 60 * 1000;
const EMPTY_DAY: DayRoutine = { am: false, pm: false };

/** Streak restores a user may spend per calendar month. */
export const MAX_RESTORES_PER_MONTH = 2;

export const EMPTY_STATE: RoutineState = { log: {}, restored: {} };

export function getDay(log: RoutineLog, dayKey: string): DayRoutine {
  return log[dayKey] ?? EMPTY_DAY;
}

/** A day counts toward the streak only when BOTH AM and PM are submitted. */
export function isDayComplete(day: DayRoutine): boolean {
  return day.am && day.pm;
}

/** A day holds the streak if both routines were done OR a restore patched it. */
function isDayCounted(state: RoutineState, dayKey: string): boolean {
  return isDayComplete(getDay(state.log, dayKey)) || dayKey in state.restored;
}

/**
 * Consecutive counted days ending today — or yesterday if today isn't done
 * yet, so an in-progress day doesn't prematurely break the streak. A single
 * fully-missed past day resets the streak to 0 (unless a restore patched it).
 */
export function computeStreak(state: RoutineState, now: number): number {
  let streak = 0;
  let cursor = now;
  if (!isDayCounted(state, dayKeyOf(cursor))) {
    cursor -= DAY_MS;
  }
  while (isDayCounted(state, dayKeyOf(cursor))) {
    streak++;
    cursor -= DAY_MS;
  }
  return streak;
}

/** `YYYY-MM` for an epoch-ms timestamp — the bucket restores are rationed by. */
function monthKeyOf(timestamp: number): string {
  return dayKeyOf(timestamp).slice(0, 7);
}

/** Restores already spent in `now`'s calendar month. */
export function restoresUsedThisMonth(state: RoutineState, now: number): number {
  const month = monthKeyOf(now);
  return Object.values(state.restored).filter(
    (spentAt) => monthKeyOf(spentAt) === month,
  ).length;
}

/** Restores still available this calendar month (0–{@link MAX_RESTORES_PER_MONTH}). */
export function restoresRemaining(state: RoutineState, now: number): number {
  return Math.max(0, MAX_RESTORES_PER_MONTH - restoresUsedThisMonth(state, now));
}

/**
 * The most recent missed day that's breaking the streak — the gap between the
 * run ending today and an earlier completed run. Returns `null` when there's
 * nothing to bridge (no break, or no earlier streak to reconnect to). Only a
 * single-day gap is repairable; a restore patches one day at a time.
 */
export function repairableDay(state: RoutineState, now: number): string | null {
  let cursor = now;
  // An in-progress today isn't a miss yet — start from the last settled day.
  if (!isDayCounted(state, dayKeyOf(cursor))) {
    cursor -= DAY_MS;
  }
  // Skip the current unbroken run down to the first gap day.
  while (isDayCounted(state, dayKeyOf(cursor))) {
    cursor -= DAY_MS;
  }
  const gapDay = dayKeyOf(cursor);
  // Only worth restoring if a counted day sits just before the gap to reconnect to.
  return isDayCounted(state, dayKeyOf(cursor - DAY_MS)) ? gapDay : null;
}

/** Whether a restore can be spent right now: credits remain and a gap is bridgeable. */
export function canRestore(state: RoutineState, now: number): boolean {
  return restoresRemaining(state, now) > 0 && repairableDay(state, now) !== null;
}

/**
 * Time-lapse ranges are gated by streak length: a range unlocks only once the
 * streak is at least as long as the range's span (weekly 7, monthly 30).
 */
export function isRangeUnlocked(range: TimelapseRange, streak: number): boolean {
  return streak >= RANGE_DAYS[range];
}
