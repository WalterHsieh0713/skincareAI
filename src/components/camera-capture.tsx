import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';

export type CameraCaptureProps = {
  /** Called with a captured image data URL when the user keeps a shot. */
  onCapture?: (dataUrl: string) => void;
  /** 'user' = selfie (Feature 1), 'environment' = rear camera for labels (Feature 4). */
  facing?: 'user' | 'environment';
  /** Mirror the preview/photo. */
  mirror?: boolean;
  /** 'square' center-crops (selfie); 'full' keeps the whole frame (labels). */
  crop?: 'square' | 'full';
  /** Override the idle/start button label. */
  startLabel?: string;
  /** Override the confirm button label. */
  keepLabel?: string;
  /** When true, runs live framing/lighting checks and blocks Capture until they pass (Feature 1 only). */
  liveGuide?: boolean;
  /** When true, calls onCapture immediately on Capture — no separate "keep" confirmation step. */
  autoConfirm?: boolean;
};

/**
 * Native placeholder for the camera used by Features 1 and 4. The live capture
 * flow is wired up on web (`camera-capture.web.tsx`); native uses `expo-camera`,
 * which isn't installed yet, so this keeps the screens building until then.
 */
export function CameraCapture({ startLabel }: CameraCaptureProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={[styles.viewfinder, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.ring, { borderColor: theme.background }]} />
        <ThemedText themeColor="textSecondary" type="small" style={styles.center}>
          {t('camera.webOnly')}
        </ThemedText>
      </View>
      <Button label={startLabel ?? t('camera.startScan')} disabled style={styles.disabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  viewfinder: {
    aspectRatio: 1,
    width: '100%',
    borderRadius: Spacing.three,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
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
  center: {
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
  disabled: {
    opacity: 0.5,
  },
});
