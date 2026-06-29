/** Shared, DOM-free types for the scan + time-lapse data layer. */

/**
 * Image-derived skin indicators, each 0–100 (higher = better).
 * These are relative signals from the photo, not clinical measurements.
 */
export type SkinScores = {
  overall: number;
  redness: number;
  texture: number;
  blemishes: number;
  hydration: number;
};

/** One captured, scored selfie scan. */
export type Scan = {
  id: string;
  /** Epoch ms the photo was captured. */
  takenAt: number;
  /** Local calendar day, `YYYY-MM-DD`, used to pick one photo per day. */
  dayKey: string;
  /** (Downscaled, calibrated) JPEG data URL. */
  image: string;
  scores: SkinScores;
  /** The capture-quality verdict that gated this scan (valid scans only). */
  quality?: ScanQuality;
};

/** A reason a capture failed validation and shouldn't be scored. */
export type ScanQualityIssue =
  | 'no-face'
  | 'face-too-small'
  | 'off-center'
  | 'too-dark'
  | 'too-bright'
  | 'uneven-lighting'
  | 'blurry';

/** Raw computer-vision measurements behind the validation verdict. */
export type ScanMetrics = {
  /** Fraction of the frame classified as skin, 0–1. */
  faceFill: number;
  /** Skin centroid distance from frame center, 0 (centered) – 1. */
  centerOffset: number;
  /** Mean skin luminance, 0–255. */
  brightness: number;
  /** Lighting evenness across the face, 0 (harsh side-light) – 1 (flat). */
  evenness: number;
  /** Laplacian variance — focus/sharpness; higher = crisper. */
  sharpness: number;
};

/**
 * The verdict for one capture: whether it's normalized well enough to score,
 * the specific issues if not, and the metrics that produced them.
 */
export type ScanQuality = {
  valid: boolean;
  issues: ScanQualityIssue[];
  metrics: ScanMetrics;
  /** One-line, fix-this-next coaching for the most important issue. */
  guidance: string | null;
};

/** A capture run through calibration: normalized image + its quality verdict. */
export type CalibratedScan = {
  /** White-balanced, exposure-normalized JPEG data URL ready for scoring. */
  dataUrl: string;
  quality: ScanQuality;
};

export type TimelapseRange = 'weekly' | 'monthly';

export const RANGE_DAYS: Record<TimelapseRange, number> = {
  weekly: 7,
  monthly: 30,
};

/** Local calendar day key (`YYYY-MM-DD`) for an epoch-ms timestamp. */
export function dayKeyOf(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Short, human label for a day key, e.g. `Jun 27`. */
export function formatDayKey(dayKey: string): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
