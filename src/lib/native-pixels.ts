import { Buffer } from 'buffer';
import { fromByteArray, toByteArray } from 'base64-js';
import * as jpeg from 'jpeg-js';

/**
 * Shared native (non-DOM) pixel plumbing for `scan-calibration.ts` and
 * `scan-image.ts` — the native equivalent of the web files' `<canvas>` +
 * `getImageData`/`toDataURL` calls, backed by pure-JS codecs (no native
 * modules, no custom dev client) so this still runs in plain Expo Go.
 *
 * jpeg-js's encoder unconditionally does `Buffer.from(...)` at the end of
 * encode() (see its source — under Metro's CommonJS wrapper it never takes
 * the `Uint8Array` fallback branch), and Hermes has no global `Buffer`. The
 * `buffer` package is a pure-JS, native-module-free polyfill; registering it
 * once here (rather than at app entry) keeps the shim scoped to the only
 * module that actually needs it.
 */
if (typeof (globalThis as { Buffer?: unknown }).Buffer === 'undefined') {
  (globalThis as { Buffer?: unknown }).Buffer = Buffer;
}

const DATA_URL_PREFIX = /^data:image\/\w+;base64,/;

export type RgbaImage = {
  data: Uint8Array;
  width: number;
  height: number;
};

/** Decodes a JPEG data URL into a raw RGBA pixel buffer (native's getImageData equivalent). */
export function decodeJpegDataUrl(dataUrl: string): RgbaImage {
  const base64 = dataUrl.replace(DATA_URL_PREFIX, '');
  const bytes = toByteArray(base64);
  // useTArray: true makes jpeg-js allocate a Uint8Array instead of taking its
  // Buffer.alloc() path, so decode needs no Buffer polyfill at all.
  const { data, width, height } = jpeg.decode(bytes, { useTArray: true });
  return { data, width, height };
}

/**
 * Nearest-neighbor resample to a dstW x dstH RGBA buffer — native's
 * equivalent of the web files' `ctx.drawImage(image, 0, 0, dstW, dstH)`
 * resize (which likewise doesn't preserve aspect ratio itself; callers pass
 * dimensions that already account for that, same as here).
 */
export function downsampleRgba(src: RgbaImage, dstW: number, dstH: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(dstW * dstH * 4);
  const { data, width, height } = src;
  for (let y = 0; y < dstH; y++) {
    const sy = Math.min(height - 1, Math.floor((y * height) / dstH));
    for (let x = 0; x < dstW; x++) {
      const sx = Math.min(width - 1, Math.floor((x * width) / dstW));
      const srcIdx = (sy * width + sx) * 4;
      const dstIdx = (y * dstW + x) * 4;
      out[dstIdx] = data[srcIdx];
      out[dstIdx + 1] = data[srcIdx + 1];
      out[dstIdx + 2] = data[srcIdx + 2];
      out[dstIdx + 3] = data[srcIdx + 3];
    }
  }
  return out;
}

/** Square convenience wrapper over `downsampleRgba` for the WORK-resolution analysis pass. */
export function downsampleToSquare(src: RgbaImage, n: number): Uint8ClampedArray {
  return downsampleRgba(src, n, n);
}

/** In-place per-channel gain application over a full RGBA buffer (native's getImageData+putImageData-with-gains equivalent). */
export function applyGains(data: Uint8Array, kR: number, kG: number, kB: number): void {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp255(data[i] * kR);
    data[i + 1] = clamp255(data[i + 1] * kG);
    data[i + 2] = clamp255(data[i + 2] * kB);
  }
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

/** Re-encodes an RGBA buffer as a JPEG data URL (native's canvas.toDataURL equivalent). */
export function encodeRgbaToJpegDataUrl(
  data: Uint8Array,
  width: number,
  height: number,
  quality = 92,
): string {
  const encoded = jpeg.encode({ data, width, height }, quality);
  return `data:image/jpeg;base64,${fromByteArray(encoded.data)}`;
}
