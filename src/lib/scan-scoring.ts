import type { RawSkinMetrics, SkinScores } from '@/lib/scan-types';

/**
 * Maps raw per-pixel measurements to the 0-100 scores shown to the user.
 *
 * Scoring is self-relative, not a universal beauty-ideal scale: each axis is
 * normalized against the user's OWN personal baseline (the mean raw
 * measurement across their first `BASELINE_WINDOW` valid scans), not a fixed
 * global constant. This closes the tone-fairness gap left after
 * `skin-classify.ts` fixed pixel *detection* — even with unbiased skin-pixel
 * detection, comparing everyone's raw redness/texture/blemish/hydration
 * values against the same absolute numbers baked in from one (unvalidated
 * across skin tones) tuning pass would still bias the 0-100 mapping itself.
 * Scoring against your own baseline sidesteps that: a score of "your
 * personal 100" means "as good as your best-measured skin," for every user,
 * regardless of tone.
 *
 * Before a personal baseline exists (fewer than `BASELINE_WINDOW` valid
 * prior scans), scoring falls back to the original fixed global bounds
 * (`FALLBACK_LO`) purely so the very first scans still show a number instead
 * of nothing — this fallback score is provisional and is never recomputed
 * once a baseline is established (earlier scans keep the score they were
 * shown; only new scans use the baseline going forward).
 */

const BASELINE_WINDOW = 3;

/** Per-axis "one full 0->100 swing" sensitivity, reused from the original global lo/hi spans. */
const SCORE_SPAN: RawSkinMetrics = {
  redness: 55 - 8,
  // texture measured on a box-blurred gradient (see scan-image.*'s `boxBlur3`)
  // — runs on a much smaller raw scale than the old pre-blur range (3-22).
  texture: 34 - 4,
  blemishes: 0.25 - 0.01,
  hydration: 70 - 16,
};

/** Original global "ideal" raw values — used only as the pre-baseline fallback reference. */
const FALLBACK_LO: RawSkinMetrics = {
  redness: 8,
  texture: 4,
  blemishes: 0.01,
  hydration: 16,
};

const AXES: (keyof RawSkinMetrics)[] = ['redness', 'texture', 'blemishes', 'hydration'];

function norm(value: number, lo: number, hi: number): number {
  return Math.max(0, Math.min(1, (value - lo) / (hi - lo)));
}

/**
 * Average raw measurements across a set of prior scans to establish a
 * personal baseline. Callers should pass exactly the first `BASELINE_WINDOW`
 * valid scans (chronological) once that many exist.
 */
export function computeBaseline(rawList: RawSkinMetrics[]): RawSkinMetrics {
  const n = rawList.length;
  const sum: RawSkinMetrics = { redness: 0, texture: 0, blemishes: 0, hydration: 0 };
  for (const raw of rawList) {
    for (const axis of AXES) {
      sum[axis] += raw[axis];
    }
  }
  const mean = { ...sum };
  for (const axis of AXES) {
    mean[axis] = sum[axis] / n;
  }
  return mean;
}

/**
 * Given how many valid prior scans (with raw measurements) exist, returns
 * the personal baseline built from the earliest `BASELINE_WINDOW` of them,
 * or `null` if there aren't enough yet.
 */
export function baselineFromHistory(priorRaw: RawSkinMetrics[]): RawSkinMetrics | null {
  if (priorRaw.length < BASELINE_WINDOW) {
    return null;
  }
  return computeBaseline(priorRaw.slice(0, BASELINE_WINDOW));
}

/** Maps raw measurements to 0-100 scores, against a personal baseline when available. */
export function scoreFromRaw(raw: RawSkinMetrics, baseline: RawSkinMetrics | null): SkinScores {
  const scores = {} as Record<keyof RawSkinMetrics, number>;
  for (const axis of AXES) {
    const lo = baseline ? baseline[axis] : FALLBACK_LO[axis];
    const hi = lo + SCORE_SPAN[axis];
    scores[axis] = Math.round(100 * (1 - norm(raw[axis], lo, hi)));
  }
  const overall = Math.round((scores.redness + scores.texture + scores.blemishes + scores.hydration) / 4);
  return { overall, ...scores };
}

export { BASELINE_WINDOW };
