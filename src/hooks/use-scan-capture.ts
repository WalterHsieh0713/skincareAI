import { useCallback, useEffect, useState } from 'react';

import { useScans } from '@/hooks/use-scans';
import { calibrateScan } from '@/lib/scan-calibration';
import { analyzeFace, downscaleForStorage } from '@/lib/scan-image';
import { addScan } from '@/lib/scan-store';
import { dayKeyOf, type ScanQuality, type SkinScores } from '@/lib/scan-types';

/**
 * The calibrate → score → save pipeline for a finalized (kept) capture,
 * shared by the Scan tab and the "never done skincare before" onboarding
 * scan step. Snapshots the previous overall score before saving so the
 * delta shown after is meaningful.
 */
export function useScanCapture() {
  const scans = useScans();
  const [busy, setBusy] = useState(false);
  const [scores, setScores] = useState<SkinScores | null>(null);
  const [quality, setQuality] = useState<ScanQuality | null>(null);
  const [prevScore, setPrevScore] = useState<number | null>(null);

  // Scan tabs stay mounted across tab switches, so a stale capture from
  // earlier in the session would otherwise keep rendering after the scan
  // history is cleared elsewhere (e.g. Progress tab's "Clear History").
  // Once the store goes empty, drop any locally-held result to match.
  useEffect(() => {
    if (scans.length === 0) {
      setScores(null);
      setQuality(null);
      setPrevScore(null);
    }
  }, [scans.length]);

  const capture = useCallback(
    async (dataUrl: string) => {
      // Capture the baseline before this scan is saved so the delta is meaningful.
      setPrevScore(scans.length > 0 ? scans[scans.length - 1].scores.overall : null);
      setBusy(true);
      setScores(null);
      setQuality(null);
      try {
        // 1. Validate + calibrate before anything is scored or saved.
        const { dataUrl: calibrated, quality: verdict } = await calibrateScan(dataUrl);
        setQuality(verdict);
        if (!verdict.valid) {
          // Reject: don't score or persist a non-comparable capture.
          return;
        }

        // 2. Score the calibrated image and persist it with its verdict.
        const [result, stored] = await Promise.all([
          analyzeFace(calibrated),
          downscaleForStorage(calibrated),
        ]);
        const takenAt = Date.now();
        await addScan({
          takenAt,
          dayKey: dayKeyOf(takenAt),
          image: stored,
          scores: result,
          quality: verdict,
        });
        setScores(result);
      } finally {
        setBusy(false);
      }
    },
    [scans],
  );

  return { busy, scores, quality, prevScore, capture };
}
