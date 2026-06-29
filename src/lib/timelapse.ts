import type { Scan, TimelapseRange } from '@/lib/scan-types';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Collapse scans to one per calendar day — the *last* photo captured that day
 * wins (e.g. if 5 photos are taken on 6/27, only the 5th represents 6/27).
 * Returns chronological order (oldest → newest).
 */
export function lastPerDay(scans: Scan[]): Scan[] {
  const byDay = new Map<string, Scan>();
  for (const scan of scans) {
    const existing = byDay.get(scan.dayKey);
    if (!existing || scan.takenAt > existing.takenAt) {
      byDay.set(scan.dayKey, scan);
    }
  }
  return [...byDay.values()].sort((a, b) => a.takenAt - b.takenAt);
}

/** Start-of-day (midnight local) for a given epoch ms. */
function startOfDay(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * How many complete periods exist from the user's first scan to now.
 * Week 0 = days 1–7 from the first scan, week 1 = days 8–14, etc.
 * Month 0 = days 1–30, month 1 = days 31–60, etc.
 */
export function periodCount(
  scans: Scan[],
  range: TimelapseRange,
  now: number,
): number {
  if (scans.length === 0) return 0;
  const earliest = scans.reduce((min, s) => Math.min(min, s.takenAt), Infinity);
  const spanDays = range === 'weekly' ? 7 : 30;
  const totalDays = Math.floor((startOfDay(now) - startOfDay(earliest)) / DAY_MS) + 1;
  return Math.max(1, Math.ceil(totalDays / spanDays));
}

/**
 * Build the frames for a specific period index.
 * Period 0 is the first week/month from the user's earliest scan.
 */
export function buildTimelapse(
  scans: Scan[],
  range: TimelapseRange,
  period: number,
): Scan[] {
  if (scans.length === 0) return [];
  const earliest = scans.reduce((min, s) => Math.min(min, s.takenAt), Infinity);
  const originDay = startOfDay(earliest);
  const spanDays = range === 'weekly' ? 7 : 30;
  const periodStart = originDay + period * spanDays * DAY_MS;
  const periodEnd = periodStart + spanDays * DAY_MS;
  return lastPerDay(scans).filter(
    (scan) => scan.takenAt >= periodStart && scan.takenAt < periodEnd,
  );
}

/**
 * Human-readable label for a period, e.g. "Week 3" or "Month 2".
 * `period` is 0-indexed internally but shown 1-indexed.
 */
export function periodLabel(range: TimelapseRange, period: number): string {
  if (range === 'weekly') return `Week ${period + 1}`;
  return `Month ${period + 1}`;
}
