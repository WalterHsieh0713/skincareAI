import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from './app-header';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Glow, MaxContentWidth, Spacing } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-scheme';
import { useTranslation } from '@/hooks/use-translation';

const TABS = [
  { name: 'home', href: '/', labelKey: 'tabs.home' },
  { name: 'scan', href: '/scan', labelKey: 'tabs.scan' },
  { name: 'routine', href: '/routine', labelKey: 'tabs.routine' },
  { name: 'ingredients', href: '/ingredients', labelKey: 'tabs.ingredients' },
  { name: 'progress', href: '/progress', labelKey: 'tabs.progress' },
] as const;

/**
 * Web tab navigator. Renders the persistent Dewpoint wordmark + streak row
 * (`AppHeader`) first, then the 5-function tab bar as a normal (non-floating)
 * row directly below it, then the active tab's content filling the rest.
 */
export default function AppTabs() {
  const { t } = useTranslation();
  const scheme = useResolvedColorScheme();
  return (
    <Tabs style={[styles.root, { backgroundColor: Glow[scheme][0] }]}>
      <AppHeader />
      <TabList asChild>
        <CustomTabList>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton>{t(tab.labelKey)}</TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
      <TabSlot style={styles.slot} />
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="default" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    height: '100%',
  },
  slot: {
    flex: 1,
  },
  tabListContainer: {
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexGrow: 1,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
  },
});
