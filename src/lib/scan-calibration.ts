import type { CalibratedScan, ScanQuality, ScanQualityIssue } from '@/lib/scan-types';

/**
 * Native placeholder. The CV calibration + validation pipeline runs on the
 * browser canvas (`scan-calibration.web.ts`); native would use a vision module
 * (e.g. an Expo/MediaPipe FaceLandmarker), which isn't installed yet. The native
 * scan camera is disabled, so this isn't called in practice. Fails closed —
 * returns an invalid verdict so nothing unvalidated is ever scored.
 */
const UNAVAILABLE_QUALITY: ScanQuality = {
  valid: false,
  issues: ['no-face'],
  metrics: {
    faceFill: 0,
    centerOffset: 1,
    brightness: 0,
    evenness: 0,
    sharpness: 0,
    shadowFrac: 0,
    highlightFrac: 0,
  },
  guidance: 'Scan calibration is available on web for now.',
};

export async function calibrateScan(dataUrl: string): Promise<CalibratedScan> {
  return { dataUrl, quality: UNAVAILABLE_QUALITY };
}

/** Native stub for type parity with scan-calibration.web.ts; the native camera never calls this. */
export const ISSUE_PRIORITY: ScanQualityIssue[] = [
  'no-face',
  'blurry',
  'too-dark',
  'too-bright',
  'uneven-lighting',
  'face-too-small',
  'off-center',
];

/** Native stub for type parity with scan-calibration.web.ts; the native camera never calls this. */
export function assessFrame(_raw: Uint8ClampedArray, _n: number): ScanQuality {
  return UNAVAILABLE_QUALITY;
}

/** Native stub for type parity with scan-calibration.web.ts; the native camera never calls this. */
export function assessVideoFrame(_video: HTMLVideoElement): ScanQuality {
  return UNAVAILABLE_QUALITY;
}
