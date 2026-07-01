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
 * Runs entirely on the browser canvas (no network, no model download). The skin
 * classifier here is the same heuristic the scorer uses; the documented seam at
 * `detectFace()` is where a MediaPipe FaceLandmarker can drop in for true
 * landmark-based framing/alignment without changing callers.
 */

// --- Calibration constants (tuned against the canvas pipeline at WORK px) ---
const WORK = 256; // analysis resolution — fast, enough for stats
const MAX_OUT = 1024; // cap stored/scored image so calibration stays cheap

// Validation thresholds. Each maps directly to one ScanQualityIssue.
const MIN_FACE_FILL = 0.1; // skin must cover ≥10% of frame
const NO_FACE_FILL = 0.04; // below this, treat as "no face at all"
const MAX_CENTER_OFFSET = 0.26; // skin centroid must sit near the middle
const MIN_BRIGHTNESS = 60; // mean skin luminance floor (0–255)
const MAX_BRIGHTNESS = 212; // ceiling before highlights blow out
const MIN_EVENNESS = 0.6; // 1 = flat light, lower = harsh side/top light
const MIN_SHARPNESS = 14; // Laplacian variance floor — below = blurry

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
const ISSUE_PRIORITY: ScanQualityIssue[] = [
  'no-face',
  'blurry',
  'too-dark',
  'too-bright',
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

/** Same skin rule the scorer uses — keep them in lockstep. */
function isSkin(r: number, g: number, b: number, lum: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return (
    r > 50 && g > 30 && b > 20 && r >= g && g >= b * 0.9 &&
    max - min > 10 && lum > 40 && lum < 235
  );
}

type FaceStats = {
  mask: Uint8Array;
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
};

/**
 * Localize the face by skin classification and gather the per-region stats the
 * validators and calibrator need. SEAM: swap this for a landmark detector
 * (MediaPipe FaceLandmarker) to get a true face box/mesh — the return shape is
 * all downstream code depends on.
 */
function detectFace(data: Uint8ClampedArray, n: number): FaceStats {
  const mask = new Uint8Array(n * n);
  let count = 0;
  let sumR = 0, sumG = 0, sumB = 0, sumLum = 0;
  let sumX = 0, sumY = 0;
  let leftLum = 0, leftN = 0, rightLum = 0, rightN = 0;
  let topLum = 0, topN = 0, bottomLum = 0, bottomN = 0;
  const half = n / 2;

  for (let y = 0, p = 0; y < n; y++) {
    for (let x = 0; x < n; x++, p++) {
      const i = p * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (!isSkin(r, g, b, lum)) continue;
      mask[p] = 1;
      count++;
      sumR += r; sumG += g; sumB += b; sumLum += lum;
      sumX += x; sumY += y;
      if (x < half) { leftLum += lum; leftN++; } else { rightLum += lum; rightN++; }
      if (y < half) { topLum += lum; topN++; } else { bottomLum += lum; bottomN++; }
    }
  }

  return {
    mask,
    count,
    sumR, sumG, sumB, sumLum,
    cx: count ? sumX / count / n : 0.5,
    cy: count ? sumY / count / n : 0.5,
    leftLum: leftN ? leftLum / leftN : 0,
    rightLum: rightN ? rightLum / rightN : 0,
    topLum: topN ? topLum / topN : 0,
    bottomLum: bottomN ? bottomLum / bottomN : 0,
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
  if (metrics.brightness < MIN_BRIGHTNESS) issues.push('too-dark');
  if (metrics.brightness > MAX_BRIGHTNESS) issues.push('too-bright');
  if (metrics.faceFill >= NO_FACE_FILL && metrics.evenness < MIN_EVENNESS) {
    issues.push('uneven-lighting');
  }
  if (metrics.sharpness < MIN_SHARPNESS) issues.push('blurry');

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
    return validate({ faceFill: 0, centerOffset: 1, brightness: 0, evenness: 0, sharpness: 0 });
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
