import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useSettings } from '@/hooks/use-settings';
import { useTranslation } from '@/hooks/use-translation';

export default function AccountScreen() {
  const { username, email, plan, update } = useSettings();
  const { t } = useTranslation();
  const [draftEmail, setDraftEmail] = useState(email);
  const [message, setMessage] = useState<string | null>(null);

  const dirty = draftEmail.trim() !== email;

  const save = () => {
    update({ email: draftEmail.trim() });
    setMessage(t('account.emailUpdated'));
  };

  return (
    <Screen title={t('nav.account')} hideHeader>
      <Card title={t('account.profile')}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('account.signedInAs', {
            name: username,
            plan: plan === 'premium' ? t('settings.planPremium') : t('settings.planFree'),
          })}
        </ThemedText>
        <TextField
          label={t('account.email')}
          value={draftEmail}
          onChangeText={setDraftEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <Button label={t('account.save')} onPress={save} disabled={!dirty} />
        <ThemedText type="small" themeColor="textSecondary">
          {t('account.changeUserPwNote')}
        </ThemedText>
      </Card>

      <Card title={t('account.actions')}>
        <Button
          label={t('account.signOut')}
          variant="secondary"
          onPress={() => setMessage(t('account.signedOutMsg'))}
        />
        <Button
          label={t('account.deleteAccount')}
          variant="secondary"
          onPress={() => setMessage(t('account.deleteMsg'))}
        />
      </Card>

      {message ? (
        <ThemedText type="small" themeColor="textSecondary">
          {message}
        </ThemedText>
      ) : null}
    </Screen>
  );
}
