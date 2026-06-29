import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/hooks/use-settings';
import { useTranslation } from '@/hooks/use-translation';

const PERK_KEYS = [
  'subscription.perk1',
  'subscription.perk2',
  'subscription.perk3',
  'subscription.perk4',
];

export default function SubscriptionScreen() {
  const { plan, update } = useSettings();
  const { t } = useTranslation();
  const isPremium = plan === 'premium';

  return (
    <Screen title={t('nav.subscription')} hideHeader>
      <Card
        title={t('subscription.currentPlan')}
        hint={isPremium ? t('settings.planPremium') : t('settings.planFree')}>
        <ThemedText type="small" themeColor="textSecondary">
          {isPremium ? t('subscription.premiumDesc') : t('subscription.freeDesc')}
        </ThemedText>
      </Card>

      <Card title={t('subscription.premiumTitle')}>
        <View style={styles.perks}>
          {PERK_KEYS.map((perkKey) => (
            <View key={perkKey} style={styles.perkRow}>
              <ThemedText themeColor="textSecondary">•</ThemedText>
              <ThemedText type="small" style={styles.perkText}>
                {t(perkKey)}
              </ThemedText>
            </View>
          ))}
        </View>
        <Button
          label={isPremium ? t('subscription.switchFree') : t('subscription.upgrade')}
          variant={isPremium ? 'secondary' : 'primary'}
          onPress={() => update({ plan: isPremium ? 'free' : 'premium' })}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {t('subscription.billingNote')}
        </ThemedText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  perks: {
    gap: Spacing.two,
  },
  perkRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  perkText: {
    flex: 1,
  },
});
