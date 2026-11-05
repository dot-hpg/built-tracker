import { ReactNode, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { Day, fmtDate } from './data';
import { serif, Theme, useTheme } from './theme';

export function Card({ title, note, children }: { title?: string; note?: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[s.card, { backgroundColor: t.panel, borderColor: t.line }]}>
      {title ? <Text style={[s.cardTitle, { color: t.fg }]}>{title}</Text> : null}
      {note ? <Text style={[s.note, { color: t.muted }]}>{note}</Text> : null}
      {children}
    </View>
  );
}

export function Tile({ label, value, note }: { label: string; value: string; note: string }) {
  const t = useTheme();
  return (
    <View style={[s.tile, { backgroundColor: t.panel, borderColor: t.line }]}>
      <Text style={[s.tileLabel, { color: t.muted }]}>{label}</Text>
      <Text style={[s.tileValue, { color: t.fg }]}>{value}</Text>
      <Text style={[s.tileNote, { color: t.muted }]}>{note}</Text>
    </View>
  );
}

export function Pill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.pill, { borderColor: color }]}>
      <Text style={[s.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }}
      style={[s.chip, { backgroundColor: active ? t.fg : t.chip }]}>
      <Text style={[s.chipText, { color: active ? t.bg : t.muted }]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color }: { value: number; color: string }) {
  const t = useTheme();
  return (
    <View style={[s.track, { backgroundColor: t.grid }]}>
      <View style={[s.fill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} />
    </View>
  );
}

function useWidth(): [number, (e: LayoutChangeEvent) => void] {
  const [w, setW] = useState(0);
  return [w, (e) => setW(Math.round(e.nativeEvent.layout.width))];
}

// One square per day, weeks as columns, GitHub style.
export function Heatmap({ days, onSelect, selected }: { days: Day[]; onSelect: (d: Day) => void; selected: Day | null }) {
  const t = useTheme();
  const [w, onLayout] = useWidth();
  const weeks = Math.ceil(days.length / 7);
  const labelW = 30, gap = 5, top = 18;
  const cell = w ? Math.max(16, Math.min(46, (w - labelW - gap * weeks) / weeks)) : 0;
  const offset = days.length ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay() : 0;
  const maxC = Math.max(1, ...days.map((d) => d.commits ?? 0));
  const H = top + 7 * (cell + gap);
  return (
    <View onLayout={onLayout} style={{ minHeight: H }}>
      {w > 0 && (
        <Svg width={w} height={H}>
          {['Sun', '', 'Tue', '', 'Thu', '', 'Sat'].map((l, i) => (
            <SvgText key={i} x={0} y={top + i * (cell + gap) + cell / 2 + 4} fill={t.muted} fontSize={11}>{l}</SvgText>
          ))}
          {Array.from({ length: weeks }, (_, i) => (
            <SvgText key={`w${i}`} x={labelW + i * (cell + gap)} y={11} fill={t.muted} fontSize={11}>{`W${i + 1}`}</SvgText>
          ))}
          {days.map((d, i) => {
            const k = i + offset, col = Math.floor(k / 7), row = k % 7;
            const x = labelW + col * (cell + gap), y = top + row * (cell + gap);
            const planned = d.status === 'Planned', missed = d.status === 'Missed';
            const op = planned || missed ? 0 : 0.25 + 0.75 * Math.sqrt((d.commits ?? 0) / maxC);
            const isSel = selected?.day === d.day;
            return (
              <Rect key={d.day} x={x} y={y} width={cell} height={cell} rx={4}
                fill={planned || missed ? 'transparent' : t.c0} fillOpacity={op}
                stroke={isSel ? t.fg : d.status === 'Today' ? t.fg : missed ? t.bad : planned ? t.muted : 'none'}
                strokeWidth={isSel || d.status === 'Today' || missed ? 2 : 1}
                strokeDasharray={planned && !isSel ? '3 3' : undefined} strokeOpacity={planned && !isSel ? 0.6 : 1}
                onPress={() => onSelect(d)} />
            );
          })}
          {cell >= 22 && days.map((d, i) => {
            const k = i + offset, col = Math.floor(k / 7), row = k % 7;
            const strong = d.status !== 'Planned' && d.status !== 'Missed' && (d.commits ?? 0) / maxC > 0.3;
            return (
              <SvgText key={`t${d.day}`} x={labelW + col * (cell + gap) + cell / 2} y={top + row * (cell + gap) + cell / 2 + 4}
                fill={d.status === 'Missed' ? t.bad : strong ? t.bg : d.status === 'Planned' ? t.muted : t.fg}
                fontSize={11} textAnchor="middle" onPress={() => onSelect(d)}>{String(d.day)}</SvgText>
            );
          })}
        </Svg>
      )}
    </View>
  );
}

export function DailyBars({ days }: { days: Day[] }) {
  const t = useTheme();
  const [w, onLayout] = useWidth();
  const H = 170, m = { t: 14, b: 22, l: 26, r: 4 };
  const maxC = Math.max(1, ...days.map((d) => d.commits ?? 0));
  const niceMax = Math.ceil(maxC / 5) * 5;
  const step = w ? (w - m.l - m.r) / days.length : 0;
  const bw = Math.max(2, step * 0.7);
  const y = (v: number) => H - m.b - (v / niceMax) * (H - m.t - m.b);
  const ticks = [0, niceMax / 2, niceMax];
  const today = days.find((d) => d.status === 'Today');
  return (
    <View onLayout={onLayout} style={{ minHeight: H }}>
      {w > 0 && (
        <Svg width={w} height={H}>
          {ticks.map((v) => (
            <Line key={v} x1={m.l} x2={w - m.r} y1={y(v)} y2={y(v)} stroke={t.grid} strokeWidth={1} />
          ))}
          {ticks.map((v) => (
            <SvgText key={`l${v}`} x={m.l - 6} y={y(v) + 4} fill={t.muted} fontSize={11} textAnchor="end">{String(v)}</SvgText>
          ))}
          {days.filter((d) => (d.day - 1) % 14 === 0).map((d) => (
            <SvgText key={`x${d.day}`} x={m.l + (d.day - 1) * step} y={H - 6} fill={t.muted} fontSize={11}>{fmtDate(d.date)}</SvgText>
          ))}
          {days.map((d) => d.status === 'Planned'
            ? <Rect key={d.day} x={m.l + (d.day - 1) * step + step / 2 - 1} y={y(0) - 3} width={2} height={2} fill={t.chartMuted} />
            : <Rect key={d.day} x={m.l + (d.day - 1) * step + (step - bw) / 2} y={y(d.commits ?? 0)} width={bw}
                height={Math.max(0, y(0) - y(d.commits ?? 0))} rx={Math.min(3, bw / 2)} fill={t.c0} />)}
          {today && (
            <>
              <Line x1={m.l + (today.day - 0.5) * step} x2={m.l + (today.day - 0.5) * step} y1={m.t} y2={y(0)} stroke={t.muted} strokeDasharray="3 3" />
              <SvgText x={m.l + (today.day - 0.5) * step + 4} y={m.t + 8} fill={t.muted} fontSize={11}>Today</SvgText>
            </>
          )}
        </Svg>
      )}
    </View>
  );
}

export function HBars({ rows, color }: { rows: { label: string; value: number; max: number; text: string; color?: string }[]; color: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 10 }}>
      {rows.map((r) => (
        <View key={r.label} style={{ gap: 4 }}>
          <View style={s.hbarHead}>
            <Text style={[s.hbarLabel, { color: t.fg }]} numberOfLines={1}>{r.label}</Text>
            <Text style={[s.hbarText, { color: t.muted }]}>{r.text}</Text>
          </View>
          <View style={[s.hbarTrack, { backgroundColor: t.grid }]}>
            <View style={[s.fill, { width: `${(r.value / r.max) * 100}%`, backgroundColor: r.color ?? color }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function Legend({ items }: { items: { label: string; color: string; outline?: boolean; dashed?: boolean }[] }) {
  const t = useTheme();
  return (
    <View style={s.legend}>
      {items.map((i) => (
        <View key={i.label} style={s.legendItem}>
          <View style={[s.sw, i.outline
            ? { borderWidth: 2, borderColor: i.color, borderStyle: i.dashed ? 'dashed' : 'solid', borderRadius: 3 }
            : { backgroundColor: i.color }]} />
          <Text style={[s.legendText, { color: t.muted }]}>{i.label}</Text>
        </View>
      ))}
    </View>
  );
}

export const textStyles = (t: Theme) => StyleSheet.create({
  h1: { fontFamily: serif, fontSize: 38, lineHeight: 42, color: t.fg },
  eyebrow: { fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: t.muted, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, color: t.fg },
  muted: { fontSize: 13, lineHeight: 19, color: t.muted },
  strong: { fontWeight: '700', color: t.fg },
});

const s = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 16, gap: 10 },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  note: { fontSize: 13, lineHeight: 18 },
  tile: { flexBasis: '47%', flexGrow: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 14, gap: 2 },
  tileLabel: { fontSize: 12 },
  tileValue: { fontFamily: serif, fontSize: 36, lineHeight: 40, fontVariant: ['tabular-nums'] },
  tileNote: { fontSize: 12 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2, alignSelf: 'flex-start' },
  pillText: { fontSize: 12, fontWeight: '700' },
  chip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  chipText: { fontSize: 13, fontWeight: '600' },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  hbarHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  hbarLabel: { fontSize: 13, flexShrink: 1 },
  hbarText: { fontSize: 12, fontVariant: ['tabular-nums'] },
  hbarTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sw: { width: 11, height: 11, borderRadius: 2 },
  legendText: { fontSize: 12 },
});
