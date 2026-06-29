import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useSettings } from '@/hooks/use-settings';
import { useTranslation } from '@/hooks/use-translation';

export default function PrivacyScreen() {
  const { username, update } = useSettings();
  const { t } = useTranslation();

  const [draftName, setDraftName] = useState(username);
  const [nameMessage, setNameMessage] = useState<string | null>(null);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwMessage, setPwMessage] = useState<string | null>(null);

  const saveUsername = () => {
    const trimmed = draftName.trim();
    if (trimmed.length < 3) {
      setNameMessage(t('privacy.usernameShort'));
      return;
    }
    update({ username: trimmed });
    setNameMessage(t('privacy.usernameUpdated'));
  };

  const savePassword = () => {
    if (!current || !next || !confirm) {
      setPwMessage(t('privacy.fillAll'));
      return;
    }
    if (next.length < 8) {
      setPwMessage(t('privacy.pwShort'));
      return;
    }
    if (next !== confirm) {
      setPwMessage(t('privacy.pwMismatch'));
      return;
    }
    // No backend in this build: validate and simulate a successful change.
    setCurrent('');
    setNext('');
    setConfirm('');
    setPwMessage(t('privacy.pwChanged'));
  };

  return (
    <Screen title={t('nav.privacy')} hideHeader>
      <Card title={t('privacy.usernameTitle')}>
        <TextField
          label={t('privacy.username')}
          value={draftName}
          onChangeText={setDraftName}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button
          label={t('privacy.updateUsername')}
          onPress={saveUsername}
          disabled={draftName.trim() === username}
        />
        {nameMessage ? (
          <ThemedText type="small" themeColor="textSecondary">
            {nameMessage}
          </ThemedText>
        ) : null}
      </Card>

      <Card title={t('privacy.passwordTitle')}>
        <TextField
          label={t('privacy.currentPw')}
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
          autoCapitalize="none"
          placeholder="••••••••"
        />
        <TextField
          label={t('privacy.newPw')}
          value={next}
          onChangeText={setNext}
          secureTextEntry
          autoCapitalize="none"
          placeholder={t('privacy.newPwPlaceholder')}
        />
        <TextField
          label={t('privacy.confirmPw')}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoCapitalize="none"
          placeholder={t('privacy.confirmPwPlaceholder')}
        />
        <Button label={t('privacy.changePw')} onPress={savePassword} />
        {pwMessage ? (
          <ThemedText type="small" themeColor="textSecondary">
            {pwMessage}
          </ThemedText>
        ) : null}
      </Card>

      <ThemedText type="small" themeColor="textSecondary">
        {t('privacy.onDeviceNote')}
      </ThemedText>
    </Screen>
  );
}
