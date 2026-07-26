import type { SkinScores } from '@/lib/scan-types';

const EMPTY: SkinScores = {
  overall: 0,
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

function norm(value: number, lo: number, hi: number): number {
  return Math.max(0, Math.min(1, (value - lo) / (hi - lo)));
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
 * Derive 0–100 skin indicators from a captured selfie by analyzing pixels:
 *  - redness:    skin red-channel excess over green/blue (lower = better score)
 *  - texture:    mean local luminance gradient / roughness (lower = better)
 *  - blemishes:  fraction of skin pixels that spike red or dark (fewer = better)
 *  - hydration:  evenness of luminance, a smoothness/plumpness proxy
 *
 * These are relative, image-derived signals — not clinical measurements — meant
 * to be tracked against the user's own past scans.
 */
export async function analyzeFace(dataUrl: string): Promise<SkinScores> {
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
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (r > 50 && g > 30 && b > 20 && r >= g && g >= b * 0.9 && max - min > 10 && lum[p] > 40 && lum[p] < 235) {
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

  const redness = Math.round(100 * (1 - norm(rednessMean, 8, 55)));
  // Same linear norm as the other three metrics (kept on the same scale so
  // texture doesn't read artificially lower/higher than redness/blemishes/
  // hydration for a comparable photo). Bounds are tuned for the post-blur
  // gradient, which runs much smaller than the old pre-blur range (3-22).
  const textureScore = Math.round(100 * (1 - norm(texture, 4, 34)));
  const blemishes = Math.round(100 * (1 - norm(blemishFrac, 0.01, 0.25)));
  const hydration = Math.round(100 * (1 - norm(lumStd, 16, 70)));
  const overall = Math.round((redness + textureScore + blemishes + hydration) / 4);

  return { overall, redness, texture: textureScore, blemishes, hydration };
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
