import type {
  CalibratedScan,
  ScanMetrics,
  ScanQuality,
  ScanQualityIssue,
} from '@/lib/scan-types';

/**
 * On-device computer-vision calibration + validation for the guided scan.
 *
 * This is Feature 1's moat: a score from an un-normalized photo is noise, so
 * every capture is (1) VALIDATED — face present, framed, well-lit, in focus —
 * and (2) CALIBRATED — white-balanced and exposure-normalized — before it ever
 * reaches the scorer. Only captures that pass are scored and saved, so the
 * timeline compares like with like.
 *
 * Runs entirely on the browser canvas (no network, no model download). The
 * documented seam at `detectFace()` is where a MediaPipe FaceLandmarker can
 * drop in for true landmark-based framing/alignment without changing callers.
 *
 * NOTE: the skin classifier here has intentionally DIVERGED from the copy in
 * `scan-image.web.ts` (the scorer). This file's `isSkin()` was made
 * chrominance-based (tone-invariant) to fix a fairness bug where the old
 * shared absolute-luminance-floor rule made capture validation systematically
 * harder to pass for darker skin tones. The scorer's copy hasn't been ported
 * yet — that's a tracked follow-up, not an oversight.
 */

// --- Calibration constants (tuned against the canvas pipeline at WORK px) ---
const WORK = 256; // analysis resolution — fast, enough for stats
const MAX_OUT = 1024; // cap stored/scored image so calibration stays cheap

// Validation thresholds. Each maps directly to one ScanQualityIssue.
const MIN_FACE_FILL = 0.1; // skin must cover ≥10% of frame
const NO_FACE_FILL = 0.04; // below this, treat as "no face at all"
const MAX_CENTER_OFFSET = 0.26; // skin centroid must sit near the middle
// SHADOW_LUM/HIGHLIGHT_LUM still feed shadowFrac/highlightFrac on ScanMetrics
// (used by calibration's exposure gain), but no longer gate validation —
// too-dark/too-bright were dropped as gates per product feedback (too sensitive).
const SHADOW_LUM = 30; // below this, a pixel has no recoverable tonal detail
const HIGHLIGHT_LUM = 210; // above this, a pixel is blown out
const MIN_EVENNESS = 0.35; // loosened per product feedback: only catch harsh/lopsided light, not minor unevenness

// Normalization targets.
const TARGET_LUMA = 170; // exposure-normalize skin toward this mean
const MAX_GAIN = 1.8; // clamp white-balance/exposure gains (no hallucination)

const GUIDANCE: Record<ScanQualityIssue, string> = {
  'no-face': 'No face detected — fill the ring with your face and try again.',
  'face-too-small': 'Move a little closer so your face fills the ring.',
  'off-center': 'Center your face in the ring, eyes level.',
  'too-dark': 'Find brighter, even, front-facing light.',
  'too-bright': 'Too bright — move out of direct light or glare.',
  'uneven-lighting': 'Light is uneven — face a window or lamp head-on, not from the side.',
  blurry: 'Hold steady — the shot is blurry. Brace your arm and retake.',
};

// Issues are reported worst-first so the UI can coach the single best fix.
// Per product feedback, capture validation was too sensitive: only the
// minimum lighting-consistency check and face-centering/framing remain
// active. too-dark/too-bright/blurry stay in ScanQualityIssue for type
// parity (metrics still record shadowFrac/highlightFrac/sharpness) but
// validate() never pushes them.
export const ISSUE_PRIORITY: ScanQualityIssue[] = [
  'no-face',
  'uneven-lighting',
  'face-too-small',
  'off-center',
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/**
 * Chrominance-based skin test: normalize away overall brightness (`r/sum`,
 * `g/sum`) before judging hue, so the same rule applies whether the frame is
 * a dark-skinned face in bright light or a light-skinned face in dim light —
 * their hue RATIO can match even though their absolute RGB values don't. The
 * old rule gated on absolute floors (`r>50`, `lum>40`), which scale with
 * brightness rather than hue, so it silently doubled as a brightness gate
 * that penalized darker skin. The luminance check here is only a loose sanity
 * bound (reject true sensor black/white clipping), not a skin-tone floor.
 *
 * The saturation check is normalized (`chroma/sum`), not absolute, for the
 * same reason: an absolute `max-min` floor shrinks toward zero as brightness
 * drops for any fixed hue, so it would silently reintroduce a brightness-
 * dependent floor at the low end (rejecting genuinely-colored dark skin as
 * "too gray" well before it's actually gray).
 */
function isSkin(r: number, g: number, b: number, lum: number): boolean {
  const sum = r + g + b;
  if (sum < 20 || lum > 250) return false;
  const nr = r / sum;
  const ng = g / sum;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = (max - min) / sum;
  return nr > 0.36 && nr < 0.47 && ng > 0.28 && ng < 0.40 && nr > ng && saturation > 0.04;
}

type FaceStats = {
  count: number;
  sumR: number;
  sumG: number;
  sumB: number;
  sumLum: number;
  // centroid (in 0..1 frame coords) and quadrant luminance for evenness
  cx: number;
  cy: number;
  leftLum: number;
  rightLum: number;
  topLum: number;
  bottomLum: number;
  shadowFrac: number;
  highlightFrac: number;
};

type ComponentAccum = {
  count: number;
  sumR: number; sumG: number; sumB: number; sumLum: number;
  sumX: number; sumY: number;
  leftLum: number; leftN: number; rightLum: number; rightN: number;
  topLum: number; topN: number; bottomLum: number; bottomN: number;
  touchesTop: boolean; touchesBottom: boolean; touchesLeft: boolean; touchesRight: boolean;
  shadowN: number; highlightN: number;
};

/**
 * Localize the face by skin classification and gather the per-region stats the
 * validators and calibrator need. SEAM: swap this for a landmark detector
 * (MediaPipe FaceLandmarker) to get a true face box/mesh — the return shape is
 * all downstream code depends on.
 *
 * A skin-toned background (a wall, wood door, a hand) commonly passes the same
 * color heuristic as the face. Averaging over every matching pixel in the
 * frame would let that background pull the centroid back toward the middle
 * even when the actual face sits off to one side — silently defeating the
 * off-center check. So stats are computed from connected components (flood
 * fill) of skin pixels, picking the largest one that does NOT touch all four
 * frame edges: enveloping background wraps around and touches every edge,
 * while a properly framed face doesn't (even if hair or a shoulder clips one
 * edge in a normal selfie). A component that wraps the whole frame is
 * excluded outright rather than risking its centroid as "the face."
 */
function detectFace(data: Uint8ClampedArray, n: number): FaceStats {
  const size = n * n;
  const skin = new Uint8Array(size);
  const rArr = new Float32Array(size);
  const gArr = new Float32Array(size);
  const bArr = new Float32Array(size);
  const lumArr = new Float32Array(size);

  for (let p = 0; p < size; p++) {
    const i = p * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    rArr[p] = r; gArr[p] = g; bArr[p] = b; lumArr[p] = lum;
    if (isSkin(r, g, b, lum)) skin[p] = 1;
  }

  const half = n / 2;
  const visited = new Uint8Array(size);
  const queue = new Int32Array(size);
  let best: ComponentAccum | null = null;

  for (let start = 0; start < size; start++) {
    if (!skin[start] || visited[start]) continue;

    let head = 0, tail = 0;
    queue[tail++] = start;
    visited[start] = 1;
    const acc: ComponentAccum = {
      count: 0, sumR: 0, sumG: 0, sumB: 0, sumLum: 0, sumX: 0, sumY: 0,
      leftLum: 0, leftN: 0, rightLum: 0, rightN: 0, topLum: 0, topN: 0, bottomLum: 0, bottomN: 0,
      touchesTop: false, touchesBottom: false, touchesLeft: false, touchesRight: false,
      shadowN: 0, highlightN: 0,
    };

    while (head < tail) {
      const p = queue[head++];
      const x = p % n;
      const y = (p - x) / n;
      acc.count++;
      acc.sumR += rArr[p]; acc.sumG += gArr[p]; acc.sumB += bArr[p]; acc.sumLum += lumArr[p];
      acc.sumX += x; acc.sumY += y;
      if (lumArr[p] < SHADOW_LUM) acc.shadowN++;
      if (lumArr[p] > HIGHLIGHT_LUM) acc.highlightN++;
      if (x < half) { acc.leftLum += lumArr[p]; acc.leftN++; } else { acc.rightLum += lumArr[p]; acc.rightN++; }
      if (y < half) { acc.topLum += lumArr[p]; acc.topN++; } else { acc.bottomLum += lumArr[p]; acc.bottomN++; }
      if (x === 0) acc.touchesLeft = true;
      if (x === n - 1) acc.touchesRight = true;
      if (y === 0) acc.touchesTop = true;
      if (y === n - 1) acc.touchesBottom = true;

      if (x > 0) { const q = p - 1; if (skin[q] && !visited[q]) { visited[q] = 1; queue[tail++] = q; } }
      if (x < n - 1) { const q = p + 1; if (skin[q] && !visited[q]) { visited[q] = 1; queue[tail++] = q; } }
      if (y > 0) { const q = p - n; if (skin[q] && !visited[q]) { visited[q] = 1; queue[tail++] = q; } }
      if (y < n - 1) { const q = p + n; if (skin[q] && !visited[q]) { visited[q] = 1; queue[tail++] = q; } }
    }

    // Enveloping background (e.g. a skin-toned wall) never needs to touch all
    // four edges to wrap the face — a wall showing on both sides, or above and
    // below, spans an opposite edge pair while a torso/shirt/hair blocks just
    // one of the remaining two, so it can slip past an all-four-edges check.
    // Spanning either opposite pair is enough to disqualify it as a candidate.
    const wrapsFrame =
      (acc.touchesLeft && acc.touchesRight) || (acc.touchesTop && acc.touchesBottom);
    if (wrapsFrame) {
      continue;
    }
    if (!best || acc.count > best.count) {
      best = acc;
    }
  }

  const count = best?.count ?? 0;
  return {
    count,
    sumR: best?.sumR ?? 0, sumG: best?.sumG ?? 0, sumB: best?.sumB ?? 0, sumLum: best?.sumLum ?? 0,
    cx: count ? best!.sumX / count / n : 0.5,
    cy: count ? best!.sumY / count / n : 0.5,
    leftLum: best?.leftN ? best.leftLum / best.leftN : 0,
    rightLum: best?.rightN ? best.rightLum / best.rightN : 0,
    topLum: best?.topN ? best.topLum / best.topN : 0,
    bottomLum: best?.bottomN ? best.bottomLum / best.bottomN : 0,
    shadowFrac: count ? (best?.shadowN ?? 0) / count : 0,
    highlightFrac: count ? (best?.highlightN ?? 0) / count : 0,
  };
}

/** Variance of the Laplacian over luminance — the classic focus/blur metric. */
function laplacianVariance(data: Uint8ClampedArray, n: number): number {
  const lum = new Float32Array(n * n);
  for (let p = 0; p < n * n; p++) {
    const i = p * 4;
    lum[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  let sum = 0, sumSq = 0, cnt = 0;
  for (let y = 1; y < n - 1; y++) {
    for (let x = 1; x < n - 1; x++) {
      const p = y * n + x;
      const lap = 4 * lum[p] - lum[p - 1] - lum[p + 1] - lum[p - n] - lum[p + n];
      sum += lap;
      sumSq += lap * lap;
      cnt++;
    }
  }
  if (!cnt) return 0;
  const mean = sum / cnt;
  return sumSq / cnt - mean * mean;
}

function evennessFrom(face: FaceStats): number {
  const meanLum = face.count ? face.sumLum / face.count : 0;
  if (meanLum <= 0) return 0;
  const sideDiff = Math.abs(face.leftLum - face.rightLum) / meanLum;
  const vertDiff = Math.abs(face.topLum - face.bottomLum) / meanLum;
  // Worst axis dominates; map a 0–80% relative swing onto 1→0.
  return Math.max(0, 1 - Math.max(sideDiff, vertDiff) / 0.8);
}

function validate(metrics: ScanMetrics): ScanQuality {
  const issues: ScanQualityIssue[] = [];
  if (metrics.faceFill < NO_FACE_FILL) {
    issues.push('no-face');
  } else if (metrics.faceFill < MIN_FACE_FILL) {
    issues.push('face-too-small');
  }
  if (metrics.faceFill >= NO_FACE_FILL && metrics.centerOffset > MAX_CENTER_OFFSET) {
    issues.push('off-center');
  }
  if (metrics.faceFill >= NO_FACE_FILL && metrics.evenness < MIN_EVENNESS) {
    issues.push('uneven-lighting');
  }

  const worst = ISSUE_PRIORITY.find((issue) => issues.includes(issue)) ?? null;
  return {
    valid: issues.length === 0,
    issues,
    metrics,
    guidance: worst ? GUIDANCE[worst] : null,
  };
}

/** Pure pixel-in, verdict-out — shared by calibrateScan() and the live preview loop. */
export function assessFrame(raw: Uint8ClampedArray, n: number): ScanQuality {
  const face = detectFace(raw, n);
  const faceFill = face.count / (n * n);
  const centerOffset = face.count
    ? Math.min(1, Math.hypot(face.cx - 0.5, face.cy - 0.5) / 0.5)
    : 1;
  const brightness = face.count ? face.sumLum / face.count : 0;
  const metrics: ScanMetrics = {
    faceFill,
    centerOffset,
    brightness,
    evenness: evennessFrom(face),
    sharpness: laplacianVariance(raw, n),
    shadowFrac: face.shadowFrac,
    highlightFrac: face.highlightFrac,
  };
  return validate(metrics);
}

// Reused across ticks so the live preview loop doesn't allocate a canvas ~3x/sec.
let liveCanvas: HTMLCanvasElement | null = null;
let liveCtx: CanvasRenderingContext2D | null = null;

/** Draws the current square-cropped video frame at WORK resolution and assesses it. */
export function assessVideoFrame(video: HTMLVideoElement): ScanQuality {
  if (!liveCanvas) {
    liveCanvas = document.createElement('canvas');
    liveCanvas.width = WORK;
    liveCanvas.height = WORK;
    liveCtx = liveCanvas.getContext('2d', { willReadFrequently: true });
  }
  if (!liveCtx || !video.videoWidth || !video.videoHeight) {
    return validate({
      faceFill: 0, centerOffset: 1, brightness: 0, evenness: 0, sharpness: 0,
      shadowFrac: 0, highlightFrac: 0,
    });
  }
  const size = Math.min(video.videoWidth, video.videoHeight);
  const offsetX = (video.videoWidth - size) / 2;
  const offsetY = (video.videoHeight - size) / 2;
  liveCtx.drawImage(video, offsetX, offsetY, size, size, 0, 0, WORK, WORK);
  return assessFrame(liveCtx.getImageData(0, 0, WORK, WORK).data, WORK);
}

/**
 * Run validation + calibration on a raw capture.
 *
 * Validation metrics are measured on the RAW pixels (that's what we're judging
 * about capture conditions). Calibration then white-balances and
 * exposure-normalizes the FULL-resolution image so the scorer and the stored
 * time-lapse frame are comparable day to day.
 */
export async function calibrateScan(dataUrl: string): Promise<CalibratedScan> {
  const image = await loadImage(dataUrl);

  // --- 1. Analysis pass at WORK resolution (fast). ---
  const work = document.createElement('canvas');
  work.width = WORK;
  work.height = WORK;
  const wctx = work.getContext('2d', { willReadFrequently: true });
  if (!wctx) {
    // No canvas → can't validate; fail closed rather than save junk.
    return {
      dataUrl,
      quality: validate({
        faceFill: 0, centerOffset: 1, brightness: 0, evenness: 0, sharpness: 0,
        shadowFrac: 0, highlightFrac: 0,
      }),
    };
  }
  wctx.drawImage(image, 0, 0, WORK, WORK);
  const raw = wctx.getImageData(0, 0, WORK, WORK).data;

  const face = detectFace(raw, WORK);
  const brightness = face.count ? face.sumLum / face.count : 0;
  const quality = assessFrame(raw, WORK);

  // --- 2. Compute calibration gains from skin pixels. ---
  // Gray-world white balance: push the mean skin tone toward neutral so ambient
  // color casts (warm bulb, cool daylight) don't masquerade as redness changes.
  let gainR = 1, gainG = 1, gainB = 1;
  if (face.count > 0) {
    const mR = face.sumR / face.count;
    const mG = face.sumG / face.count;
    const mB = face.sumB / face.count;
    const gray = (mR + mG + mB) / 3;
    gainR = clampGain(gray / (mR || gray));
    gainG = clampGain(gray / (mG || gray));
    gainB = clampGain(gray / (mB || gray));
  }
  // Exposure normalization: scale luminance toward a fixed target.
  const exposure = brightness > 0 ? clampGain(TARGET_LUMA / brightness) : 1;

  // --- 3. Apply gains to the full-resolution image for storage + scoring. ---
  const scale = Math.min(1, MAX_OUT / Math.max(image.width, image.height));
  const ow = Math.max(1, Math.round(image.width * scale));
  const oh = Math.max(1, Math.round(image.height * scale));
  const out = document.createElement('canvas');
  out.width = ow;
  out.height = oh;
  const octx = out.getContext('2d', { willReadFrequently: true });
  if (!octx) {
    return { dataUrl, quality };
  }
  octx.drawImage(image, 0, 0, ow, oh);

  // Skip pixel rewrite when calibration is a no-op (gains all ~1).
  const adjusts =
    Math.abs(gainR - 1) > 0.02 || Math.abs(gainG - 1) > 0.02 ||
    Math.abs(gainB - 1) > 0.02 || Math.abs(exposure - 1) > 0.02;
  if (adjusts) {
    const img = octx.getImageData(0, 0, ow, oh);
    const px = img.data;
    const kR = gainR * exposure;
    const kG = gainG * exposure;
    const kB = gainB * exposure;
    for (let i = 0; i < px.length; i += 4) {
      px[i] = clamp255(px[i] * kR);
      px[i + 1] = clamp255(px[i + 1] * kG);
      px[i + 2] = clamp255(px[i + 2] * kB);
    }
    octx.putImageData(img, 0, 0);
  }

  return { dataUrl: out.toDataURL('image/jpeg', 0.92), quality };
}

function clampGain(g: number): number {
  if (!Number.isFinite(g) || g <= 0) return 1;
  return Math.max(1 / MAX_GAIN, Math.min(MAX_GAIN, g));
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}
