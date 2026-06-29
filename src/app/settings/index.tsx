import { Link } from 'expo-router';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { SettingsRow } from '@/components/ui/settings-row';
import { ThemedText } from '@/components/themed-text';
import { languageLabel } from '@/constants/languages';
import { useSettings } from '@/hooks/use-settings';
import { useTranslation } from '@/hooks/use-translation';

const THEME_KEY = {
  system: 'settings.themeSystem',
  light: 'settings.themeLight',
  dark: 'settings.themeDark',
} as const;

export default function SettingsScreen() {
  const { themePreference, language, plan, username } = useSettings();
  const { t } = useTranslation();

  return (
    <Screen title={t('nav.settings')} hideHeader>
      <Card title={t('settings.groupAccount')}>
        <Link href="/settings/account" asChild>
          <SettingsRow label={t('settings.rowAccount')} value={username} />
        </Link>
        <Link href="/settings/subscription" asChild>
          <SettingsRow
            label={t('settings.rowSubscription')}
            value={plan === 'premium' ? t('settings.planPremium') : t('settings.planFree')}
          />
        </Link>
      </Card>

      <Card title={t('settings.groupApp')}>
        <Link href="/settings/preferences" asChild>
          <SettingsRow label={t('settings.rowPreferences')} value={t(THEME_KEY[themePreference])} />
        </Link>
        <Link href="/settings/language" asChild>
          <SettingsRow label={t('settings.rowLanguage')} value={languageLabel(language)} />
        </Link>
      </Card>

      <Card title={t('settings.groupPrivacyLegal')}>
        <Link href="/settings/privacy" asChild>
          <SettingsRow label={t('settings.rowPrivacy')} value={t('settings.privacyValue')} />
        </Link>
        <Link href="/settings/terms" asChild>
          <SettingsRow label={t('settings.rowTerms')} />
        </Link>
      </Card>

      <ThemedText type="small" themeColor="textSecondary">
        {t('settings.version')}
      </ThemedText>
    </Screen>
  );
}
