import {
  applyGains,
  decodeJpegDataUrl,
  downsampleRgba,
  downsampleToSquare,
  encodeRgbaToJpegDataUrl,
} from '@/lib/native-pixels';
import type {
  CalibratedScan,
  ScanMetrics,
  ScanQuality,
  ScanQualityIssue,
} from '@/lib/scan-types';

/**
 * Native on-device CV calibration + validation for the guided scan.
 *
 * Same moat as the web version (`scan-calibration.web.ts`): every capture is
 * (1) VALIDATED — face present, framed, minimally evenly lit — and (2)
 * CALIBRATED — white-balanced and exposure-normalized — before it's ever
 * scored. `detectFace`/`assessFrame`/`validate` below are ported VERBATIM
 * from the web file (pure math, no DOM dependency there to begin with) —
 * only the pixel acquisition/re-encode steps differ, via the pure-JS codecs
 * in `@/lib/native-pixels` (no expo-gl/Skia, no custom dev client required).
 *
 * There's no live-video equivalent of the web preview's ~3x/sec polling here:
 * expo-camera has no cheap way to sample raw frames at that rate, so native
 * lets every tap through to Capture and validates the still photo instead —
 * `camera-capture.tsx` doesn't call `assessVideoFrame` (kept only for type
 * parity below, same as it was in the pre-native-camera placeholder).
 */

// --- Calibration constants (identical to scan-calibration.web.ts) ---
const WORK = 256;
const MAX_OUT = 1024;

const MIN_FACE_FILL = 0.1;
const NO_FACE_FILL = 0.02; // loosened per Sean's feedback (2026-07-16): "no face detected" false-rejected real faces too often
const MAX_CENTER_OFFSET = 0.26;
const SHADOW_LUM = 30; // still feeds shadowFrac/highlightFrac on ScanMetrics, not a gate (see validate())
const HIGHLIGHT_LUM = 210;
const MIN_EVENNESS = 0.22; // loosened further per Sean's feedback (2026-07-16): normal indoor lighting asymmetry was still tripping "uneven lighting"

const TARGET_LUMA = 170;
const MAX_GAIN = 1.8;

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
// too-dark/too-bright/blurry are never pushed by validate() (dropped as gates
// per product feedback — see scan-calibration.web.ts), same as web.
export const ISSUE_PRIORITY: ScanQualityIssue[] = [
  'no-face',
  'uneven-lighting',
  'face-too-small',
  'off-center',
];

/** Chrominance-based skin test — ported verbatim from scan-calibration.web.ts. */
function isSkin(r: number, g: number, b: number, lum: number): boolean {
  const sum = r + g + b;
  if (sum < 20 || lum > 250) return false;
  const nr = r / sum;
  const ng = g / sum;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = (max - min) / sum;
  // Range widened per Sean's feedback (2026-07-16) — see scan-calibration.web.ts.
  return nr > 0.33 && nr < 0.50 && ng > 0.24 && ng < 0.44 && nr > ng && saturation > 0.02;
}

type FaceStats = {
  count: number;
  sumR: number;
  sumG: number;
  sumB: number;
  sumLum: number;
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

/** Localize the face by skin classification — ported verbatim from scan-calibration.web.ts. */
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

    // Spanning either opposite edge pair marks enveloping background (see
    // scan-calibration.web.ts's comment on this same check).
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

/** Variance of the Laplacian over luminance — ported verbatim from scan-calibration.web.ts. */
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

/** Pure pixel-in, verdict-out — ported verbatim from scan-calibration.web.ts. */
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

/**
 * No live video stream to sample on native (see the file header) — this is
 * never called by `camera-capture.tsx`, kept only for type parity with
 * scan-calibration.web.ts's export.
 */
export function assessVideoFrame(_video: unknown): ScanQuality {
  return validate({
    faceFill: 0, centerOffset: 1, brightness: 0, evenness: 0, sharpness: 0,
    shadowFrac: 0, highlightFrac: 0,
  });
}

function clampGain(g: number): number {
  if (!Number.isFinite(g) || g <= 0) return 1;
  return Math.max(1 / MAX_GAIN, Math.min(MAX_GAIN, g));
}

/**
 * Run validation + calibration on a raw capture. Same algorithm and shape as
 * `calibrateScan` in scan-calibration.web.ts — only the pixel acquisition
 * (jpeg-js decode instead of `<img>`+`<canvas>`) and re-encode (jpeg-js encode
 * instead of `canvas.toDataURL`) differ, via `@/lib/native-pixels`.
 */
export async function calibrateScan(dataUrl: string): Promise<CalibratedScan> {
  const full = decodeJpegDataUrl(dataUrl);

  // --- 1. Analysis pass at WORK resolution (fast). ---
  const raw = downsampleToSquare(full, WORK);
  const face = detectFace(raw, WORK);
  const brightness = face.count ? face.sumLum / face.count : 0;
  const quality = assessFrame(raw, WORK);

  // --- 2. Compute calibration gains from skin pixels. ---
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
  const exposure = brightness > 0 ? clampGain(TARGET_LUMA / brightness) : 1;

  // --- 3. Apply gains to the full-resolution image for storage + scoring. ---
  const scale = Math.min(1, MAX_OUT / Math.max(full.width, full.height));
  const ow = Math.max(1, Math.round(full.width * scale));
  const oh = Math.max(1, Math.round(full.height * scale));
  const out = scale < 1 ? downsampleRgba(full, ow, oh) : full.data;
  const outData = new Uint8Array(out);

  const adjusts =
    Math.abs(gainR - 1) > 0.02 || Math.abs(gainG - 1) > 0.02 ||
    Math.abs(gainB - 1) > 0.02 || Math.abs(exposure - 1) > 0.02;
  if (adjusts) {
    applyGains(outData, gainR * exposure, gainG * exposure, gainB * exposure);
  }

  const dataUrl2 = encodeRgbaToJpegDataUrl(outData, ow, oh, 92);
  return { dataUrl: dataUrl2, quality };
}
