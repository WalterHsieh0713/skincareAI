import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-scheme';
import { useTranslation } from '@/hooks/use-translation';

const TABS = [
  { name: 'index', labelKey: 'tabs.home', sf: 'house.fill', md: 'home' },
  { name: 'scan', labelKey: 'tabs.scan', sf: 'camera.viewfinder', md: 'center_focus_weak' },
  { name: 'routine', labelKey: 'tabs.routine', sf: 'checklist', md: 'checklist' },
  { name: 'ingredients', labelKey: 'tabs.ingredients', sf: 'list.bullet.rectangle', md: 'science' },
  { name: 'progress', labelKey: 'tabs.progress', sf: 'chart.line.uptrend.xyaxis', md: 'show_chart' },
] as const;

export default function AppTabs() {
  const colors = Colors[useResolvedColorScheme()];
  const { t } = useTranslation();

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{t(tab.labelKey)}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
