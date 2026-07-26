import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientText } from '@/components/ui/gradient-text';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { FontFamily, Spacing, WordmarkGradient, WordmarkGradientDirection } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useResolvedColorScheme } from '@/hooks/use-resolved-scheme';
import { useTranslation } from '@/hooks/use-translation';
import { EMPTY_PROFILE } from '@/lib/profile';

type Stage = 'welcome' | 'create' | 'createEmail' | 'signin';

/**
 * First screen a user ever sees, as a small step-by-step entry rather than
 * one big form: a big welcome hero with a small "Create account" / "Sign in"
 * pair at the bottom (`welcome`) → either account creation (Apple/Google/
 * Email, `create`/`createEmail`) or a credentials sign-in (`signin`). No real
 * backend — this app has none anywhere yet (see settings/account.tsx) — so
 * "auth" is a local, on-device mock. The profile questionnaire (gender/
 * birthday/skincare hobby) only runs once per account: creating an account
 * starts a fresh profile so it shows, signing in keeps whatever profile is
 * already stored so it doesn't — the (tabs) gate is what actually decides,
 * this screen never forces it.
 */
export default function LoginScreen() {
  const { t } = useTranslation();
  const scheme = useResolvedColorScheme();
  const profile = useProfile();
  const [stage, setStage] = useState<Stage>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function createWith(nextEmail: string) {
    profile.update({ ...EMPTY_PROFILE, authenticated: true, email: nextEmail || profile.email });
    router.replace('/');
  }

  function signIn() {
    profile.update({ authenticated: true, email: email.trim() || profile.email });
    router.replace('/');
  }

  if (stage === 'welcome') {
    return (
      <Screen hideHeader>
        <GradientText
          colors={WordmarkGradient[scheme]}
          direction={WordmarkGradientDirection[scheme]}
          style={styles.wordmark}>
          Dewpoint
        </GradientText>

        <View style={styles.intro}>
          <ThemedText type="subtitle" style={styles.headline}>
            {t('welcome.headline')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.body}>
            {t('welcome.body')}
          </ThemedText>
        </View>

        <View style={styles.entryRow}>
          <Button label={t('login.createAccount')} onPress={() => setStage('create')} />
          <Pressable onPress={() => setStage('signin')} accessibilityRole="button">
            <ThemedText type="small" themeColor="textSecondary" style={styles.signInLink}>
              {t('login.haveAccount')}
            </ThemedText>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen hideHeader>
      <Pressable onPress={() => setStage('welcome')} accessibilityRole="button" style={styles.back}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('login.back')}
        </ThemedText>
      </Pressable>

      {stage === 'create' ? (
        <Card title={t('login.createTitle')} hint={t('login.createHint')}>
          <Button
            label={t('login.continueApple')}
            variant="secondary"
            onPress={() => createWith('you@icloud.com')}
          />
          <Button
            label={t('login.continueGoogle')}
            variant="secondary"
            onPress={() => createWith('you@gmail.com')}
          />
          <Button
            label={t('login.continueEmail')}
            variant="secondary"
            onPress={() => setStage('createEmail')}
          />
        </Card>
      ) : null}

      {stage === 'createEmail' ? (
        <Card title={t('login.createTitle')}>
          <TextField
            label={t('login.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={t('login.emailPlaceholder')}
          />
          <TextField
            label={t('login.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={t('login.passwordPlaceholder')}
          />
          <Button label={t('login.createAccount')} onPress={() => createWith(email.trim())} />
        </Card>
      ) : null}

      {stage === 'signin' ? (
        <Card title={t('login.signInTitle')}>
          <TextField
            label={t('login.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={t('login.emailPlaceholder')}
          />
          <TextField
            label={t('login.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={t('login.passwordPlaceholder')}
          />
          <Button label={t('login.signIn')} onPress={signIn} />
        </Card>
      ) : null}

      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        {t('login.demoNote')}
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    fontFamily: FontFamily.displayBold,
    fontSize: 28,
    lineHeight: 40,
    paddingBottom: 6,
    textAlign: 'center',
  },
  intro: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  headline: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
  entryRow: {
    gap: Spacing.two,
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  signInLink: {
    textDecorationLine: 'underline',
    paddingVertical: Spacing.two,
  },
  back: {
    alignSelf: 'flex-start',
  },
  note: {
    textAlign: 'center',
    paddingHorizontal: Spacing.three,
  },
});
