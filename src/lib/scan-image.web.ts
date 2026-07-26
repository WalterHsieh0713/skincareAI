import type { RawSkinMetrics } from '@/lib/scan-types';
import { isSkin as isSkinPixel } from '@/lib/skin-classify';

const EMPTY: RawSkinMetrics = {
  redness: 0,
  texture: 0,
  blemishes: 0,
  hydration: 0,
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/** 3x3 box blur — suppresses camera sensor noise/JPEG artifacts before the
 * texture gradient is measured, so per-pixel noise doesn't dominate the signal. */
function boxBlur3(lum: Float32Array, n: number): Float32Array {
  const out = new Float32Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= n) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= n) continue;
          sum += lum[yy * n + xx];
          count++;
        }
      }
      out[y * n + x] = sum / count;
    }
  }
  return out;
}

/**
 * Derive raw skin measurements from a captured selfie by analyzing pixels:
 *  - redness:    skin red-channel excess over green/blue (lower = better)
 *  - texture:    mean local luminance gradient / roughness, measured on a
 *                blurred copy so sensor noise/compression artifacts don't
 *                dominate (lower = better)
 *  - blemishes:  fraction of skin pixels that spike red or dark (lower = better)
 *  - hydration:  luminance spread across skin, a smoothness/plumpness proxy (lower = better)
 *
 * These are relative, image-derived signals — not clinical measurements. The
 * 0-100 scores shown to the user are derived from these via
 * `@/lib/scan-scoring`, which maps them against the user's own baseline
 * rather than a fixed universal scale.
 */
export async function measureFace(dataUrl: string): Promise<RawSkinMetrics> {
  const image = await loadImage(dataUrl);
  const N = 200;
  const canvas = document.createElement('canvas');
  canvas.width = N;
  canvas.height = N;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return EMPTY;
  }
  ctx.drawImage(image, 0, 0, N, N);
  const { data } = ctx.getImageData(0, 0, N, N);

  const lum = new Float32Array(N * N);
  const redn = new Float32Array(N * N);
  const isSkin = new Uint8Array(N * N);
  let skinCount = 0;

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    lum[p] = 0.299 * r + 0.587 * g + 0.114 * b;
    redn[p] = r - (g + b) / 2;
    if (isSkinPixel(r, g, b, lum[p])) {
      isSkin[p] = 1;
      skinCount++;
    }
  }

  // Fall back to the whole frame if too little skin was detected.
  const useAll = skinCount < N * N * 0.05;
  const count = useAll ? N * N : skinCount;

  let rednessSum = 0;
  let lumSum = 0;
  for (let p = 0; p < N * N; p++) {
    if (useAll || isSkin[p]) {
      rednessSum += redn[p];
      lumSum += lum[p];
    }
  }
  const rednessMean = rednessSum / count;
  const lumMean = lumSum / count;

  // Texture: average luminance gradient across considered pixels, measured on
  // a blurred copy so sensor noise/compression artifacts don't dominate.
  const lumSmooth = boxBlur3(lum, N);
  let gradSum = 0;
  let gradCount = 0;
  for (let y = 0; y < N - 1; y++) {
    for (let x = 0; x < N - 1; x++) {
      const p = y * N + x;
      if (!useAll && !isSkin[p]) {
        continue;
      }
      gradSum += Math.abs(lumSmooth[p] - lumSmooth[p + 1]) + Math.abs(lumSmooth[p] - lumSmooth[p + N]);
      gradCount++;
    }
  }
  const texture = gradCount ? gradSum / gradCount : 0;

  // Luminance spread (hydration proxy) + blemish spike fraction. Thresholds are
  // set well past normal facial variance (lips, eyebrow shadow, subtle tone
  // shifts) so those don't get miscounted as blemishes and floor the score.
  let lumVar = 0;
  let blemish = 0;
  const redThreshold = rednessMean + 30;
  const darkThreshold = lumMean - 50;
  for (let p = 0; p < N * N; p++) {
    if (!useAll && !isSkin[p]) {
      continue;
    }
    const dl = lum[p] - lumMean;
    lumVar += dl * dl;
    if (redn[p] > redThreshold || lum[p] < darkThreshold) {
      blemish++;
    }
  }
  const lumStd = Math.sqrt(lumVar / count);
  const blemishFrac = blemish / count;

  return { redness: rednessMean, texture, blemishes: blemishFrac, hydration: lumStd };
}

/** Re-encode a capture to a smaller JPEG for storage (and smooth playback). */
export async function downscaleForStorage(dataUrl: string, max = 512): Promise<string> {
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, max / Math.max(image.width, image.height));
  const w = Math.round(image.width * scale);
  const h = Math.round(image.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return dataUrl;
  }
  ctx.drawImage(image, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', 0.8);
}
