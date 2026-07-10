import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-scheme';
import { useTranslation } from '@/hooks/use-translation';

const TABS = [
  { name: 'index', labelKey: 'tabs.home', sf: 'house.fill', md: 'home' },
  { name: 'scan', labelKey: 'tabs.scan', sf: 'camera.viewfinder', md: 'center-focus-weak' },
  { name: 'routine', labelKey: 'tabs.routine', sf: 'checklist', md: 'checklist' },
  { name: 'ingredients', labelKey: 'tabs.ingredients', sf: 'list.bullet.rectangle', md: 'science' },
  { name: 'progress', labelKey: 'tabs.progress', sf: 'chart.line.uptrend.xyaxis', md: 'show-chart' },
] as const;

export default function AppTabs() {
  const colors = Colors[useResolvedColorScheme()];
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <AppHeader />
      <NativeTabs
        backgroundColor={colors.background}
        indicatorColor={colors.backgroundElement}
        labelStyle={{ selected: { color: colors.text } }}>
        {TABS.map((tab) => (
          <NativeTabs.Trigger key={tab.name} name={tab.name}>
            <Label>{t(tab.labelKey)}</Label>
            <Icon sf={tab.sf} androidSrc={<VectorIcon family={MaterialIcons} name={tab.md} />} />
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
