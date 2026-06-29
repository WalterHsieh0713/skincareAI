import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import {
  TERMS_EFFECTIVE_DATE,
  TERMS_INTRO,
  TERMS_SECTIONS,
} from '@/constants/legal';
import { useTranslation } from '@/hooks/use-translation';

export default function TermsScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('nav.terms')} hideHeader>
      <Card
        title={t('terms.docTitle')}
        hint={t('terms.effective', { date: TERMS_EFFECTIVE_DATE })}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('terms.englishOnly')}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {TERMS_INTRO}
        </ThemedText>
      </Card>

      <Card>
        <View style={styles.sections}>
          {TERMS_SECTIONS.map((section) => (
            <View key={section.heading} style={styles.section}>
              <ThemedText type="smallBold">{section.heading}</ThemedText>
              {section.body.map((paragraph, index) => (
                <ThemedText
                  key={index}
                  type="small"
                  themeColor="textSecondary"
                  style={styles.paragraph}>
                  {paragraph}
                </ThemedText>
              ))}
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sections: {
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  paragraph: {
    lineHeight: 20,
  },
});
