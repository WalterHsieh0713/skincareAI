import { runOcr } from '@/lib/ocr-native-bridge';

export const ocrSupported = true;

/**
 * Native OCR, via the hidden WebView host (`ocr-webview-host.tsx`, mounted
 * once at the app root) running the same tesseract.js engine `ocr.web.ts`
 * uses in the browser — no custom native module, so the app stays in Expo Go.
 */
export async function recognizeText(
  image: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  return runOcr(image, onProgress);
}
