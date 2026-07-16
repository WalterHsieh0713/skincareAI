import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { handleBridgeMessage, markWebViewReady, registerWebView } from '@/lib/ocr-native-bridge';

/**
 * Same tesseract.js engine `ocr.web.ts` already runs in the browser, hosted
 * in an invisible WebView so native gets working label OCR without a custom
 * dev client (see `src/lib/ocr.ts`). Mounted once, off-screen, at the app root.
 */
const OCR_HTML = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body>
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js"></script>
<script>
  function post(msg) {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }

  function handleRequest(raw) {
    var req;
    try {
      req = JSON.parse(raw);
    } catch (e) {
      return;
    }
    Tesseract.recognize(req.image, 'eng', {
      logger: function (m) {
        if (m.status === 'recognizing text') {
          post({ id: req.id, type: 'progress', progress: m.progress });
        }
      },
    })
      .then(function (result) {
        post({ id: req.id, type: 'done', text: result.data.text });
      })
      .catch(function (err) {
        post({ id: req.id, type: 'error', error: String((err && err.message) || err) });
      });
  }

  document.addEventListener('message', function (e) { handleRequest(e.data); });
  window.addEventListener('message', function (e) { handleRequest(e.data); });
</script>
</body>
</html>`;

export function OcrWebViewHost() {
  const webViewRef = useRef<WebView>(null);

  function handleMessage(event: WebViewMessageEvent) {
    handleBridgeMessage(event.nativeEvent.data);
  }

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html: OCR_HTML }}
      onMessage={handleMessage}
      onLoadEnd={() => {
        registerWebView((message) => webViewRef.current?.postMessage(message));
        markWebViewReady();
      }}
      style={styles.hidden}
    />
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    top: -1000,
  },
});
