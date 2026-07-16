import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/hooks/use-translation';
import type { Gender, SkincareHobby } from '@/lib/profile';

const GENDERS: Gender[] = ['female', 'male', 'nonbinary', 'prefer-not-to-say'];
const HOBBIES: SkincareHobby[] = ['fixed', 'building', 'new'];

function Option({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <ThemedView
        type={selected ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.option, selected && { borderColor: theme.text }]}>
        <ThemedText type="small">{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

/**
 * "Log in" → here: gender, birthday, and which of the three skincare-hobby
 * branches (a/b/c in the flowchart) the user is in. The hobby answer decides
 * where onboarding goes next — straight to logging products, or to a first
 * scan first for someone brand new to skincare.
 */
export default function OnboardingProfileScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const profile = useProfile();
  const [gender, setGender] = useState<Gender | null>(profile.gender);
  const [birthday, setBirthday] = useState(profile.birthday ?? '');
  const [hobby, setHobby] = useState<SkincareHobby | null>(profile.hobby);

  const canContinue = gender !== null && birthday.trim().length > 0 && hobby !== null;

  function handleContinue() {
    if (!canContinue || !hobby) {
      return;
    }
    profile.update({ gender, birthday: birthday.trim(), hobby });
    router.replace(hobby === 'new' ? '/onboarding/first-scan' : '/onboarding/products');
  }

  return (
    <Screen title={t('onboardingProfile.title')} subtitle={t('onboardingProfile.subtitle')}>
      <Card title={t('onboardingProfile.genderTitle')}>
        <View style={styles.optionRow}>
          {GENDERS.map((option) => (
            <Option
              key={option}
              label={t(`onboardingProfile.gender.${option}`)}
              selected={gender === option}
              onPress={() => setGender(option)}
            />
          ))}
        </View>
      </Card>

      <Card title={t('onboardingProfile.birthdayTitle')}>
        <TextField
          label={t('onboardingProfile.birthdayLabel')}
          value={birthday}
          onChangeText={setBirthday}
          placeholder={t('onboardingProfile.birthdayPlaceholder')}
          keyboardType="numbers-and-punctuation"
        />
      </Card>

      <Card title={t('onboardingProfile.hobbyTitle')} hint={t('onboardingProfile.hobbyHint')}>
        <View style={styles.hobbyList}>
          {HOBBIES.map((option) => (
            <Pressable key={option} onPress={() => setHobby(option)} accessibilityRole="button">
              <ThemedView
                type={hobby === option ? 'backgroundSelected' : 'backgroundElement'}
                style={[styles.hobbyCard, hobby === option && { borderColor: theme.text }]}>
                <ThemedText type="smallBold">{t(`onboardingProfile.hobby.${option}.title`)}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t(`onboardingProfile.hobby.${option}.desc`)}
                </ThemedText>
              </ThemedView>
            </Pressable>
          ))}
        </View>
      </Card>

      <Button
        label={t('onboardingProfile.continue')}
        onPress={handleContinue}
        disabled={!canContinue}
        style={!canContinue ? styles.disabled : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  option: {
    borderRadius: Spacing.four,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  hobbyList: {
    gap: Spacing.two,
  },
  hobbyCard: {
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    padding: Spacing.three,
    gap: Spacing.half,
  },
  disabled: {
    opacity: 0.5,
  },
});
