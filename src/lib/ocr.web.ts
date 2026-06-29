import { recognize } from 'tesseract.js';

export const ocrSupported = true;

/**
 * Run browser-side OCR (tesseract.js) on a captured image data URL.
 * The worker, wasm, and English language data stream from the CDN on first use.
 */
export async function recognizeText(
  image: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const { data } = await recognize(image, 'eng', {
    logger: (message) => {
      if (message.status === 'recognizing text') {
        onProgress?.(message.progress);
      }
    },
  });
  return data.text;
}
