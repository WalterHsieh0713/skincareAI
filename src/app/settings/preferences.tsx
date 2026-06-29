import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/hooks/use-settings';
import { useTranslation } from '@/hooks/use-translation';
import type { ThemePreference } from '@/lib/settings';

const OPTIONS: { value: ThemePreference; labelKey: string; hintKey: string }[] = [
  { value: 'system', labelKey: 'preferences.system', hintKey: 'preferences.systemHint' },
  { value: 'light', labelKey: 'preferences.light', hintKey: 'preferences.lightHint' },
  { value: 'dark', labelKey: 'preferences.dark', hintKey: 'preferences.darkHint' },
];

export default function PreferencesScreen() {
  const theme = useTheme();
  const { themePreference, update } = useSettings();
  const { t } = useTranslation();

  return (
    <Screen title={t('nav.preferences')} hideHeader>
      <Card title={t('preferences.appearance')}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('preferences.appearanceDesc')}
        </ThemedText>
        <View style={styles.options}>
          {OPTIONS.map((option) => {
            const selected = themePreference === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => update({ themePreference: option.value })}
                style={({ pressed }) => [pressed && styles.pressed]}>
                <ThemedView
                  type={selected ? 'backgroundSelected' : 'background'}
                  style={[
                    styles.option,
                    { borderColor: selected ? theme.text : theme.backgroundSelected },
                  ]}>
                  <View style={styles.optionText}>
                    <ThemedText type="smallBold">{t(option.labelKey)}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {t(option.hintKey)}
                    </ThemedText>
                  </View>
                  <ThemedText type="smallBold">{selected ? '✓' : ''}</ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: Spacing.two,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  optionText: {
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
