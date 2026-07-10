import { useCallback, useRef, useState } from 'react';
import { Image as RNImage, StyleSheet, View } from 'react-native';

import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { CameraType } from 'expo-camera';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';

type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'streaming'
  | 'captured'
  | 'denied'
  | 'unsupported';

const LIVE_GUIDE_HINT_KEY = 'camera.captureThenCheck';

export type CameraCaptureProps = {
  /** Called with a JPEG data URL when the user keeps a captured shot. */
  onCapture?: (dataUrl: string) => void;
  /** 'user' = selfie (Feature 1), 'environment' = rear camera for labels (Feature 4). */
  facing?: 'user' | 'environment';
  /** Mirror the preview/photo. Defaults to true for selfies, false otherwise. */
  mirror?: boolean;
  /** 'square' center-crops (selfie); 'full' keeps the whole frame (labels). */
  crop?: 'square' | 'full';
  /** Override the idle/start button label. */
  startLabel?: string;
  /** Override the confirm button label. */
  keepLabel?: string;
  /**
   * On web this runs live framing/lighting checks and blocks Capture until
   * they pass. expo-camera has no cheap way to sample raw frames ~3x/sec, so
   * on native this is a no-op — Capture is never disabled; validation runs
   * once, after the photo is taken, via the same `calibrateScan` call
   * `scan.tsx` already runs post-capture on both platforms.
   */
  liveGuide?: boolean;
  /** When true, calls onCapture immediately on Capture — no separate "keep" confirmation step. */
  autoConfirm?: boolean;
};

/**
 * Native implementation of the camera used by Feature 1 (guided selfie scan)
 * and Feature 4 (product label capture), backed by `expo-camera` — a
 * first-party, Expo-Go-compatible module (no custom dev client required).
 * Mirrors `camera-capture.web.tsx`'s prop contract and state machine exactly
 * so `scan.tsx`/`ingredients.tsx` need no changes.
 */
export function CameraCapture({
  onCapture,
  facing = 'user',
  mirror = facing === 'user',
  crop = 'square',
  startLabel,
  keepLabel,
  liveGuide = false,
  autoConfirm = false,
}: CameraCaptureProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [status, setStatus] = useState<CameraStatus>('idle');
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resolvedStartLabel = startLabel ?? t('camera.startScan');
  const resolvedKeepLabel = keepLabel ?? t('camera.useScan');
  const cameraType: CameraType = facing === 'user' ? 'front' : 'back';

  const start = useCallback(async () => {
    setStatus('requesting');
    setPhoto(null);
    try {
      const result = permission?.granted ? permission : await requestPermission();
      setStatus(result.granted ? 'streaming' : 'denied');
    } catch {
      setStatus('unsupported');
    }
  }, [permission, requestPermission]);

  const capture = useCallback(async () => {
    const camera = cameraRef.current;
    if (!camera || busy) {
      return;
    }
    setBusy(true);
    try {
      const shot = await camera.takePictureAsync({ quality: 0.92 });
      const side = Math.min(shot.width, shot.height);
      const context = ImageManipulator.manipulate(shot.uri);
      if (crop === 'square') {
        context.crop({
          originX: Math.round((shot.width - side) / 2),
          originY: Math.round((shot.height - side) / 2),
          width: side,
          height: side,
        });
      }
      if (mirror) {
        context.flip('horizontal');
      }
      const rendered = await context.renderAsync();
      const saved = await rendered.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.92,
        base64: true,
      });
      const dataUrl = `data:image/jpeg;base64,${saved.base64}`;
      setPhoto(dataUrl);
      setStatus('captured');
      if (autoConfirm) {
        onCapture?.(dataUrl);
      }
    } finally {
      setBusy(false);
    }
  }, [autoConfirm, busy, crop, mirror, onCapture]);

  const keep = useCallback(() => {
    if (photo) {
      onCapture?.(photo);
    }
  }, [onCapture, photo]);

  const isLive = status === 'streaming';
  const showError = status === 'denied' || status === 'unsupported';
  const viewfinderRatio = crop === 'square' ? styles.viewfinderSquare : styles.viewfinderTall;
  const previewStyle = mirror ? [styles.cover, styles.mirrored] : styles.cover;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.viewfinder,
          viewfinderRatio,
          { backgroundColor: theme.backgroundSelected },
        ]}>
        {isLive ? (
          <CameraView ref={cameraRef} facing={cameraType} style={previewStyle} />
        ) : null}

        {status === 'captured' && photo ? (
          <RNImage source={{ uri: photo }} style={styles.cover} />
        ) : null}

        {!isLive && status !== 'captured' ? (
          <ThemedText themeColor="textSecondary" type="small" style={styles.placeholder}>
            {status === 'requesting'
              ? t('camera.requesting')
              : facing === 'user'
                ? t('camera.frontPreview')
                : t('camera.rearPreview')}
          </ThemedText>
        ) : null}

        {crop === 'square' ? (
          <View
            pointerEvents="none"
            style={[styles.ring, { borderColor: theme.background }]}
          />
        ) : null}
      </View>

      {showError ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          {t(status === 'denied' ? 'camera.deniedNative' : 'camera.unsupportedNative')}
        </ThemedText>
      ) : null}

      {isLive && liveGuide ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          {t(LIVE_GUIDE_HINT_KEY)}
        </ThemedText>
      ) : null}

      {status === 'idle' || showError ? (
        <Button label={showError ? t('camera.retryCamera') : resolvedStartLabel} onPress={start} />
      ) : null}

      {isLive ? (
        <Button
          label={t('camera.capture')}
          onPress={capture}
          disabled={busy}
          style={busy ? styles.disabled : undefined}
        />
      ) : null}

      {status === 'captured' ? (
        <View style={styles.actionRow}>
          <Button
            label={t('camera.retake')}
            variant="secondary"
            onPress={start}
            style={autoConfirm ? undefined : styles.action}
          />
          {!autoConfirm ? (
            <Button label={resolvedKeepLabel} onPress={keep} style={styles.action} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  mirrored: {
    transform: [{ scaleX: -1 }],
  },
  viewfinder: {
    width: '100%',
    borderRadius: Spacing.three,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderSquare: {
    aspectRatio: 1,
  },
  viewfinderTall: {
    aspectRatio: 3 / 4,
  },
  ring: {
    position: 'absolute',
    width: '70%',
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  placeholder: {
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  action: {
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
