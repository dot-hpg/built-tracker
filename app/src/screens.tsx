import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Linking, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Card, Chip, DailyBars, HBars, Heatmap, Legend, Pill, ProgressBar, Tile, textStyles } from './components';
import { Day, fmtDate, fmtPct, fmtWeekday, Project, stats, TrackerData } from './data';
import { reminderOn, REMINDER_HOUR, setReminder } from './reminder';
import { barColor, statusColor, useTheme } from './theme';

type Props = { data: TrackerData; refreshing: boolean; refresh: () => void };

const tap = () => { if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {}); };

export function Dashboard({ data, refreshing, refresh }: Props) {
  const t = useTheme();
  const ts = textStyles(t);
  const st = useMemo(() => stats(data), [data]);
  const [sel, setSel] = useState<Day | null>(null);
  const [remind, setRemind] = useState(false);
  useEffect(() => { reminderOn().then(setRemind); }, []);
  const shown = sel ?? st.today ?? st.next;

  return (
    <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={t.muted} />}>
      <Text style={ts.body}>
        Day <Text style={ts.strong}>{st.dayNumber}</Text> of <Text style={ts.strong}>{st.totalDays}</Text>: a{' '}
        <Text style={ts.strong}>{st.streak}</Text>-day streak and <Text style={ts.strong}>{st.commits}</Text> commits so far.
        {st.next ? <> Next up on <Text style={ts.strong}>{fmtDate(st.next.date)}</Text>: <Text style={ts.strong}>{st.next.project}</Text>.</> : null}
      </Text>

      <View style={styles.tiles}>
        <Tile label="Projects built" value={String(st.projects)} note="Since July 2026" />
        <Tile label="Shipped" value={String(st.shipped)} note="Live or submitted" />
        <Tile label="Current streak" value={`${st.streak}d`} note="Days in a row with commits" />
        <Tile label="Commits" value={String(st.commits)} note="This sprint" />
        <Tile label="Avg progress" value={fmtPct(st.avgProgress)} note="Across every project" />
        <Tile label="Sprint" value={fmtPct(st.dayNumber / st.totalDays)} note={`${st.totalDays - st.dayNumber} days to go`} />
      </View>

      <Card title="48-day streak" note="Tap a day to see what was built or planned.">
        <Legend items={[
          { label: 'Built', color: t.c0 },
          { label: 'Today', color: t.fg, outline: true },
          { label: 'Missed', color: t.bad, outline: true },
          { label: 'Planned', color: t.muted, outline: true, dashed: true },
        ]} />
        <Heatmap days={data.days} selected={sel} onSelect={(d) => { tap(); setSel(d); }} />
        {shown && (
          <View style={[styles.dayBox, { backgroundColor: t.chip }]}>
            <View style={styles.rowBetween}>
              <Text style={ts.muted}>Day {shown.day} · {fmtWeekday(shown.date)}</Text>
              <Pill label={shown.status} color={shown.status === 'Today' ? t.fg : statusColor(t, shown.status)} />
            </View>
            <Text style={[ts.body, ts.strong]}>{shown.project}</Text>
            <Text style={ts.muted}>{shown.focus}</Text>
            <Text style={ts.muted}>{shown.status === 'Planned' ? `${shown.level} · ${shown.category}` : `${shown.commits ?? 0} commits · ${shown.category}`}</Text>
          </View>
        )}
      </Card>

      <Card title="Commits per day" note="All 48 days on one axis. The empty stretch is the plan still ahead.">
        <DailyBars days={data.days} />
      </Card>

      <Card title="Projects by category" note="Number of projects, with their average progress.">
        <HBars color={t.c0} rows={st.categories.map((c) => ({
          label: c.category, value: c.projects, max: st.categories[0]?.projects || 1, text: `${c.projects} · ${fmtPct(c.avg)} done`,
        }))} />
      </Card>

      <Card title="Progress by project" note="Estimated completion, most done first.">
        <Legend items={[{ label: 'Shipped', color: t.c0 }, { label: 'Active', color: t.c1 }, { label: 'Early stage', color: t.chartMuted }]} />
        <HBars color={t.c0} rows={[...data.projects].sort((a, b) => b.progress - a.progress).map((p) => ({
          label: p.name, value: p.progress, max: 100, text: `${p.progress}%`, color: barColor(t, p.status),
        }))} />
      </Card>

      <Card title="Where the 48 days go" note="Days per track, built and planned.">
        <HBars color={t.c2} rows={st.tracks.map((r) => ({ label: r.category, value: r.days, max: st.tracks[0]?.days || 1, text: `${r.days} days` }))} />
      </Card>

      {Platform.OS !== 'web' && (
        <Card>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[ts.body, ts.strong]}>Daily reminder</Text>
              <Text style={ts.muted}>A nudge at {REMINDER_HOUR - 12} pm to keep your streak alive.</Text>
            </View>
            <Switch value={remind} onValueChange={async (v) => { tap(); setRemind(await setReminder(v)); }} trackColor={{ true: t.c0, false: t.line }} />
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const STATUS_FILTERS = ['All', 'Shipped', 'Active', 'Early stage'];

export function Projects({ data, refreshing, refresh }: Props) {
  const t = useTheme();
  const ts = textStyles(t);
  const [q, setQ] = useState('');
  const [f, setF] = useState('All');
  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return [...data.projects]
      .filter((p) => (f === 'All' || p.status === f) && (!ql || [p.name, p.category, p.stack, p.description].join(' ').toLowerCase().includes(ql)))
      .sort((a, b) => b.progress - a.progress || b.last.localeCompare(a.last));
  }, [data, q, f]);

  return (
    <FlatList
      data={rows}
      keyExtractor={(p) => p.repo || p.name}
      contentContainerStyle={styles.page}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={t.muted} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          <TextInput value={q} onChangeText={setQ} placeholder="Search projects, stack, category" placeholderTextColor={t.muted}
            style={[styles.search, { color: t.fg, backgroundColor: t.panel, borderColor: t.line }]} clearButtonMode="while-editing" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {STATUS_FILTERS.map((s) => <Chip key={s} label={s} active={f === s} onPress={() => { tap(); setF(s); }} />)}
          </ScrollView>
          <Text style={ts.muted}>{rows.length} of {data.projects.length} projects</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={({ item }) => <ProjectCard p={item} />}
      ListEmptyComponent={<Text style={ts.muted}>No projects match that search.</Text>}
    />
  );
}

function ProjectCard({ p }: { p: Project }) {
  const t = useTheme();
  const ts = textStyles(t);
  return (
    <Card>
      <View style={styles.rowBetween}>
        <Text style={[ts.body, ts.strong, { flex: 1, fontSize: 17 }]}>{p.name}</Text>
        <Pill label={p.status} color={statusColor(t, p.status)} />
      </View>
      <Text style={ts.muted}>{p.category} · started {fmtDate(p.start)} · {p.commits} commits</Text>
      <View style={styles.progressRow}>
        <ProgressBar value={p.progress} color={barColor(t, p.status)} />
        <Text style={[ts.muted, { minWidth: 36, textAlign: 'right' }]}>{p.progress}%</Text>
      </View>
      <Text style={ts.body}>{p.description}</Text>
      {p.stack ? <Text style={ts.muted}>{p.stack}</Text> : null}
      <Pressable onPress={() => Linking.openURL(p.repo_url)} accessibilityRole="link">
        <Text style={[ts.muted, { color: t.c0, fontWeight: '600' }]}>View on GitHub →</Text>
      </Pressable>
    </Card>
  );
}

const DAY_FILTERS = ['All days', 'Built', 'Planned'];

export function Plan({ data, refreshing, refresh }: Props) {
  const t = useTheme();
  const ts = textStyles(t);
  const [f, setF] = useState('All days');
  const list = useRef<FlatList<Day>>(null);
  const rows = useMemo(() => data.days.filter((d) =>
    f === 'All days' || (f === 'Built' ? d.status !== 'Planned' : d.status === 'Planned')), [data, f]);
  const todayIndex = rows.findIndex((d) => d.status === 'Today');

  return (
    <FlatList
      ref={list}
      data={rows}
      keyExtractor={(d) => String(d.day)}
      contentContainerStyle={styles.page}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={t.muted} />}
      onScrollToIndexFailed={() => {}}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          <Text style={ts.muted}>Day 1 is Oct 25, 2026. Built days come from your commits; the rest is the plan, ending with a capstone.</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {DAY_FILTERS.map((s) => <Chip key={s} label={s} active={f === s} onPress={() => { tap(); setF(s); }} />)}
            {todayIndex >= 0 && <Chip label="Jump to today" active={false} onPress={() => { tap(); list.current?.scrollToIndex({ index: todayIndex, viewPosition: 0.2 }); }} />}
          </View>
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      renderItem={({ item: d, index }) => (
        <View>
          {(index === 0 || rows[index - 1].week !== d.week) && <Text style={[ts.eyebrow, { marginTop: index ? 14 : 4, marginBottom: 8 }]}>Week {d.week}</Text>}
          <View style={[styles.dayRow, { backgroundColor: d.status === 'Today' ? t.chip : t.panel, borderColor: d.status === 'Today' ? t.fg : t.line }]}>
            <View style={[styles.dayNum, { backgroundColor: d.status === 'Done' || d.status === 'Today' ? t.c0 : 'transparent', borderColor: d.status === 'Missed' ? t.bad : t.line }]}>
              <Text style={{ color: d.status === 'Done' || d.status === 'Today' ? '#fff' : t.muted, fontWeight: '700' }}>{d.day}</Text>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <View style={styles.rowBetween}>
                <Text style={ts.muted}>{fmtWeekday(d.date)}</Text>
                <Pill label={d.status} color={d.status === 'Today' ? t.fg : statusColor(t, d.status)} />
              </View>
              <Text style={[ts.body, ts.strong]}>{d.project}</Text>
              <Text style={ts.muted}>{d.focus}</Text>
              <Text style={[ts.muted, { fontSize: 12 }]}>{d.status === 'Planned' ? `${d.level} · ${d.category}` : `${d.commits ?? 0} commits · ${d.level}`}</Text>
            </View>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  dayBox: { borderRadius: 10, padding: 12, gap: 4 },
  search: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayRow: { flexDirection: 'row', gap: 12, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 14 },
  dayNum: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
