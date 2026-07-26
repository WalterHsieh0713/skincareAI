import { useCallback, useEffect, useState } from 'react';

import { useScans } from '@/hooks/use-scans';
import { calibrateScan } from '@/lib/scan-calibration';
import { measureFace, downscaleForStorage } from '@/lib/scan-image';
import { BASELINE_WINDOW, baselineFromHistory, scoreFromRaw } from '@/lib/scan-scoring';
import { addScan } from '@/lib/scan-store';
import { dayKeyOf, type ScanQuality, type SkinScores } from '@/lib/scan-types';

/**
 * The calibrate → measure → score → save pipeline for a finalized (kept)
 * capture, shared by the Scan tab and the "never done skincare before"
 * onboarding scan step. Snapshots the previous overall score before saving
 * so the delta shown after is meaningful.
 *
 * Scoring is baseline-relative (see `@/lib/scan-scoring`): once the user has
 * `BASELINE_WINDOW` valid prior scans, this scan's raw measurements are
 * normalized against the mean of that personal baseline rather than a fixed
 * global scale. Before that many scans exist, `calibrating` is true and the
 * shown score is a provisional fallback — never recomputed retroactively
 * once a baseline is established.
 */
export function useScanCapture() {
  const scans = useScans();
  const [busy, setBusy] = useState(false);
  const [scores, setScores] = useState<SkinScores | null>(null);
  const [quality, setQuality] = useState<ScanQuality | null>(null);
  const [prevScore, setPrevScore] = useState<number | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [scansUntilBaseline, setScansUntilBaseline] = useState(0);

  // Scan tabs stay mounted across tab switches, so a stale capture from
  // earlier in the session would otherwise keep rendering after the scan
  // history is cleared elsewhere (e.g. Progress tab's "Clear History").
  // Once the store goes empty, drop any locally-held result to match.
  useEffect(() => {
    if (scans.length === 0) {
      setScores(null);
      setQuality(null);
      setPrevScore(null);
      setCalibrating(false);
      setScansUntilBaseline(0);
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

        // 2. Measure the calibrated image, score it against the personal
        // baseline (if established yet), and persist it with its verdict.
        const priorRaw = scans.filter((s) => s.raw).map((s) => s.raw!);
        const baseline = baselineFromHistory(priorRaw);
        const [raw, stored] = await Promise.all([
          measureFace(calibrated),
          downscaleForStorage(calibrated),
        ]);
        const result = scoreFromRaw(raw, baseline);
        setCalibrating(baseline === null);
        setScansUntilBaseline(Math.max(0, BASELINE_WINDOW - (priorRaw.length + 1)));

        const takenAt = Date.now();
        await addScan({
          takenAt,
          dayKey: dayKeyOf(takenAt),
          image: stored,
          scores: result,
          raw,
          quality: verdict,
        });
        setScores(result);
      } finally {
        setBusy(false);
      }
    },
    [scans],
  );

  return { busy, scores, quality, prevScore, calibrating, scansUntilBaseline, capture };
}
