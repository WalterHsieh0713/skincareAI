import type { CalibratedScan } from '@/lib/scan-types';

/**
 * Native placeholder. The CV calibration + validation pipeline runs on the
 * browser canvas (`scan-calibration.web.ts`); native would use a vision module
 * (e.g. an Expo/MediaPipe FaceLandmarker), which isn't installed yet. The native
 * scan camera is disabled, so this isn't called in practice. Fails closed —
 * returns an invalid verdict so nothing unvalidated is ever scored.
 */
export async function calibrateScan(dataUrl: string): Promise<CalibratedScan> {
  return {
    dataUrl,
    quality: {
      valid: false,
      issues: ['no-face'],
      metrics: {
        faceFill: 0,
        centerOffset: 1,
        brightness: 0,
        evenness: 0,
        sharpness: 0,
      },
      guidance: 'Scan calibration is available on web for now.',
    },
  };
}
