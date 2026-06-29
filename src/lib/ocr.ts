export const ocrSupported = false;

/**
 * Native placeholder. On-device OCR is wired up on web (`ocr.web.ts`);
 * native would use a vision/ML module, which isn't installed yet.
 */
export async function recognizeText(
  _image: string,
  _onProgress?: (progress: number) => void,
): Promise<string> {
  throw new Error('Label OCR is only available on web for now.');
}
