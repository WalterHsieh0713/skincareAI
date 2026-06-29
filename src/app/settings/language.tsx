import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { LANGUAGES } from '@/constants/languages';
import { useSettings } from '@/hooks/use-settings';
import { useTranslation } from '@/hooks/use-translation';
import { LOCALIZED_TAGS } from '@/i18n';

export default function LanguageScreen() {
  const router = useRouter();
  const { language, update } = useSettings();
  const { t } = useTranslation();

  const choose = (tag: string) => {
    update({ language: tag });
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <Screen title={t('nav.language')} hideHeader>
      <Card title={t('language.appLanguage')}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('language.pickDesc')}
        </ThemedText>
        <View>
          {LANGUAGES.map((lang) => {
            const selected = lang.tag === language;
            const coverage = LOCALIZED_TAGS.has(lang.tag)
              ? t('language.localized')
              : t('language.fallback');
            return (
              <Pressable
                key={lang.tag}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => choose(lang.tag)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                <View style={styles.text}>
                  <ThemedText type="smallBold">{lang.native}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {lang.english} · {coverage}
                  </ThemedText>
                </View>
                {selected ? <ThemedText type="smallBold">✓</ThemedText> : null}
              </Pressable>
            );
          })}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  text: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.6,
  },
});

// Subtle row divider via ThemedView would require per-row theming; the tight
// vertical rhythm above keeps the long list scannable without it.
