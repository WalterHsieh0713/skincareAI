import type { SkinScores } from '@/lib/scan-types';

/**
 * Native placeholder. The pixel-based scorer runs on a canvas (`scan-image.web.ts`);
 * native would use a vision module, which isn't installed yet. The native scan
 * camera is disabled, so this isn't called in practice.
 */
export async function analyzeFace(_dataUrl: string): Promise<SkinScores> {
  return { overall: 0, redness: 0, texture: 0, blemishes: 0, hydration: 0 };
}

export async function downscaleForStorage(dataUrl: string, _max = 512): Promise<string> {
  return dataUrl;
}
