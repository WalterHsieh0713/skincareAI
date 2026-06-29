import AppTabs from '@/components/app-tabs';

/** The tab group. Lives under a root Stack so screens like Settings can be
 * pushed on top of the whole tab bar. The `(tabs)` group name is URL-transparent,
 * so routes stay at `/`, `/scan`, `/routine`, `/ingredients`, `/progress`. */
export default function TabsLayout() {
  return <AppTabs />;
}
