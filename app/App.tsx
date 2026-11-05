import { InstrumentSerif_400Regular, useFonts } from '@expo-google-fonts/instrument-serif';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { textStyles } from './src/components';
import { fmtUpdated, useTracker } from './src/data';
import { Dashboard, Plan, Projects } from './src/screens';
import { useTheme } from './src/theme';

type Tab = 'dashboard' | 'projects' | 'plan';
const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'projects', label: 'Projects' },
  { id: 'plan', label: '48 days' },
];

function TabIcon({ id, color }: { id: Tab; color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      {id === 'dashboard' && <Path d="M5 20V12M10 20V6M15 20V10M20 20V4" stroke={color} strokeWidth={2.4} strokeLinecap="round" fill="none" />}
      {id === 'projects' && <Path d="M4 6h16M4 12h16M4 18h10" stroke={color} strokeWidth={2.4} strokeLinecap="round" fill="none" />}
      {id === 'plan' && <>
        <Rect x={3.5} y={5} width={17} height={15} rx={3} stroke={color} strokeWidth={2} fill="none" />
        <Path d="M3.5 10h17M8 3v4M16 3v4" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
      </>}
    </Svg>
  );
}

function Shell() {
  const t = useTheme();
  const ts = textStyles(t);
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('dashboard');
  const { data, error, refreshing, refresh } = useTracker();
  const titles: Record<Tab, string> = { dashboard: 'Build Streak', projects: 'All projects', plan: '48-day tracker' };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={ts.eyebrow}>Guntuku Hariprasad{data?.updated ? ` · updated ${fmtUpdated(data.updated)}` : ''}</Text>
        <Text style={ts.h1}>{titles[tab]}</Text>
        {error ? <Text style={[ts.muted, { color: t.warn }]}>{error}</Text> : null}
      </View>

      <View style={{ flex: 1 }}>
        {!data ? (
          <View style={styles.center}>
            {error ? <Text style={ts.muted}>{error}</Text> : <ActivityIndicator color={t.muted} />}
          </View>
        ) : tab === 'dashboard' ? <Dashboard data={data} refreshing={refreshing} refresh={refresh} />
          : tab === 'projects' ? <Projects data={data} refreshing={refreshing} refresh={refresh} />
          : <Plan data={data} refreshing={refreshing} refresh={refresh} />}
      </View>

      <View style={[styles.tabbar, { paddingBottom: Math.max(insets.bottom, 10), borderTopColor: t.line, backgroundColor: t.panel }]}>
        {TABS.map((x) => {
          const active = x.id === tab;
          const color = active ? t.c0 : t.muted;
          return (
            <Pressable key={x.id} onPress={() => setTab(x.id)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: active }}>
              <TabIcon id={x.id} color={color} />
              <Text style={[styles.tabLabel, { color }]}>{x.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({ InstrumentSerif_400Regular });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <Shell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 8, gap: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  tabbar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});
