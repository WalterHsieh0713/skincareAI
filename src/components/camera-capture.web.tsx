import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';
import { assessQuality, ISSUE_PRIORITY, WORK } from '@/lib/scan-calibration';
import type { ScanQuality } from '@/lib/scan-types';

// How often to re-judge the live frame while the selfie viewfinder is open.
const LIVE_CHECK_INTERVAL_MS = 400;
const LIVE_STATUS_COLORS = { ok: '#16a34a', issue: '#dc2626' } as const;

type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'streaming'
  | 'captured'
  | 'denied'
  | 'unsupported';

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
};

/**
 * Web implementation of the camera used by Feature 1 (guided selfie scan) and
 * Feature 4 (product label capture). Uses the browser `getUserMedia` API for a
 * live preview and draws the frame to a canvas on capture. Native platforms
 * fall back to `camera-capture.tsx`.
 */
export function CameraCapture({
  onCapture,
  facing = 'user',
  mirror = facing === 'user',
  crop = 'square',
  startLabel,
  keepLabel,
}: CameraCaptureProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [liveQuality, setLiveQuality] = useState<ScanQuality | null>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fall back to translated defaults when a caller doesn't pass a label.
  const resolvedStartLabel = startLabel ?? t('camera.startScan');
  const resolvedKeepLabel = keepLabel ?? t('camera.useScan');

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // Always release the camera when the screen unmounts.
  useEffect(() => stopStream, [stopStream]);

  // Attach the active stream to the video element once it is rendered.
  useEffect(() => {
    if (status === 'streaming' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [status]);

  // Live face-centering feedback for the selfie flow: judge the frame the
  // same way `calibrateScan` judges the final photo, so what the user sees
  // while framing matches what happens when they press capture.
  useEffect(() => {
    if (status !== 'streaming' || facing !== 'user') {
      setLiveQuality(null);
      return;
    }
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (!liveCanvasRef.current) {
      liveCanvasRef.current = document.createElement('canvas');
      liveCanvasRef.current.width = WORK;
      liveCanvasRef.current.height = WORK;
    }
    const canvas = liveCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return;
    }

    const id = setInterval(() => {
      if (video.readyState < video.HAVE_CURRENT_DATA) {
        return;
      }
      ctx.drawImage(video, 0, 0, WORK, WORK);
      const frame = ctx.getImageData(0, 0, WORK, WORK).data;
      setLiveQuality(assessQuality(frame, WORK));
    }, LIVE_CHECK_INTERVAL_MS);

    return () => clearInterval(id);
  }, [status, facing]);

  const start = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      setErrorKey('camera.unsupported');
      return;
    }

    setStatus('requesting');
    setErrorKey(null);
    setPhoto(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: facing,
          width: { ideal: 1440 },
          height: { ideal: 1440 },
        },
      });
      streamRef.current = stream;
      setStatus('streaming');
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      const denied = name === 'NotAllowedError';
      setStatus(denied ? 'denied' : 'unsupported');
      setErrorKey(denied ? 'camera.denied' : 'camera.notFound');
    }
  }, [facing]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const { videoWidth, videoHeight } = video;
    // Selfies center-crop to a square; label shots keep the full frame.
    const cropWidth = crop === 'square' ? Math.min(videoWidth, videoHeight) : videoWidth;
    const cropHeight = crop === 'square' ? cropWidth : videoHeight;
    const offsetX = (videoWidth - cropWidth) / 2;
    const offsetY = (videoHeight - cropHeight) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    if (mirror) {
      // Mirror to match the preview.
      context.translate(cropWidth, 0);
      context.scale(-1, 1);
    }
    context.drawImage(
      video,
      offsetX,
      offsetY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopStream();
    setPhoto(dataUrl);
    setStatus('captured');
  }, [crop, mirror, stopStream]);

  const keep = useCallback(() => {
    if (photo) {
      onCapture?.(photo);
    }
  }, [onCapture, photo]);

  const isLive = status === 'streaming';
  const showError = status === 'denied' || status === 'unsupported';
  const videoStyle = mirror ? mirroredVideoStyle : coverImageStyle;
  const viewfinderRatio = crop === 'square' ? styles.viewfinderSquare : styles.viewfinderTall;

  // Worst-first, same rule the post-capture retake card uses, so the live
  // hint and the eventual rejection reason never disagree.
  const liveIssue = liveQuality
    ? ISSUE_PRIORITY.find((issue) => liveQuality.issues.includes(issue))
    : undefined;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.viewfinder,
          viewfinderRatio,
          { backgroundColor: theme.backgroundSelected },
        ]}>
        {isLive ? (
          <video ref={videoRef} autoPlay playsInline muted style={videoStyle} />
        ) : null}

        {status === 'captured' && photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Captured" style={coverImageStyle} />
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

      {isLive && liveQuality ? (
        <ThemedText
          type="smallBold"
          style={[
            styles.center,
            { color: liveQuality.valid ? LIVE_STATUS_COLORS.ok : LIVE_STATUS_COLORS.issue },
          ]}>
          {liveQuality.valid ? t('camera.faceFound') : t(`scan.guidance.${liveIssue}`)}
        </ThemedText>
      ) : null}

      {showError && errorKey ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          {t(errorKey)}
        </ThemedText>
      ) : null}

      {status === 'idle' || showError ? (
        <Button label={showError ? t('camera.retryCamera') : resolvedStartLabel} onPress={start} />
      ) : null}

      {isLive ? <Button label={t('camera.capture')} onPress={capture} /> : null}

      {status === 'captured' ? (
        <View style={styles.actionRow}>
          <Button
            label={t('camera.retake')}
            variant="secondary"
            onPress={start}
            style={styles.action}
          />
          <Button label={resolvedKeepLabel} onPress={keep} style={styles.action} />
        </View>
      ) : null}
    </View>
  );
}

// Plain DOM styles for the raw <video>/<img> elements (not RN StyleSheet).
const coverImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
};

const mirroredVideoStyle = {
  ...coverImageStyle,
  transform: 'scaleX(-1)',
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
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
});
