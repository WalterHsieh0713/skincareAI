/**
 * Bridges `recognizeText` calls to the hidden WebView (`ocr-webview-host.tsx`)
 * that actually runs tesseract.js on native — expo-camera gives us pixels but
 * there's no first-party, Expo-Go-compatible native OCR module, so we reuse
 * the exact same engine already running on web, hosted in an invisible page.
 */

type PendingRequest = {
  resolve: (text: string) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: number) => void;
};

let postToWebView: ((message: string) => void) | null = null;
let webViewReady = false;
const pendingReady: (() => void)[] = [];
const pending = new Map<string, PendingRequest>();
let nextId = 0;

export function registerWebView(post: (message: string) => void) {
  postToWebView = post;
}

export function markWebViewReady() {
  webViewReady = true;
  pendingReady.splice(0).forEach((resolve) => resolve());
}

function waitForWebView(): Promise<void> {
  if (webViewReady) {
    return Promise.resolve();
  }
  return new Promise((resolve) => pendingReady.push(resolve));
}

/** Called by the WebView host's `onMessage` with the raw JSON string it posted. */
export function handleBridgeMessage(raw: string) {
  let msg: { id: string; type: 'progress' | 'done' | 'error'; progress?: number; text?: string; error?: string };
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }
  const request = pending.get(msg.id);
  if (!request) {
    return;
  }
  if (msg.type === 'progress') {
    request.onProgress?.(msg.progress ?? 0);
    return;
  }
  pending.delete(msg.id);
  if (msg.type === 'done') {
    request.resolve(msg.text ?? '');
  } else {
    request.reject(new Error(msg.error ?? 'OCR failed'));
  }
}

/** Run OCR on a captured image data URL via the hidden WebView's tesseract.js. */
export async function runOcr(image: string, onProgress?: (progress: number) => void): Promise<string> {
  await waitForWebView();
  if (!postToWebView) {
    throw new Error('OCR WebView is not mounted.');
  }
  const id = String(nextId++);
  const done = new Promise<string>((resolve, reject) => {
    pending.set(id, { resolve, reject, onProgress });
  });
  postToWebView(JSON.stringify({ id, image }));
  return done;
}
