import { useColorScheme } from 'react-native';

const light = {
  bg: '#f6f7f4',
  panel: '#ffffff',
  fg: '#161a17',
  muted: '#626b64',
  line: '#e1e5df',
  grid: '#e8ebe6',
  ok: '#137a52',
  warn: '#a35f00',
  bad: '#c0392b',
  c0: '#129a6b',
  c1: '#d4890a',
  c2: '#5a5fd6',
  chartMuted: '#c3c9c3',
  chip: '#eef1ec',
};

const dark: typeof light = {
  bg: '#111411',
  panel: '#181c19',
  fg: '#e9ede8',
  muted: '#98a29a',
  line: '#2a302b',
  grid: '#252b26',
  ok: '#4fd39c',
  warn: '#f0b04a',
  bad: '#f07a6c',
  c0: '#34c48e',
  c1: '#f0a73a',
  c2: '#8b8ff0',
  chartMuted: '#424a43',
  chip: '#222823',
};

export type Theme = typeof light;

export function useTheme(): Theme & { dark: boolean } {
  const scheme = useColorScheme();
  return scheme === 'dark' ? { ...dark, dark: true } : { ...light, dark: false };
}

export const serif = 'InstrumentSerif_400Regular';

export const statusColor = (t: Theme, status: string) =>
  status === 'Shipped' || status === 'Done' ? t.ok : status === 'Active' ? t.warn : status === 'Missed' ? t.bad : t.muted;

export const barColor = (t: Theme, status: string) =>
  status === 'Shipped' ? t.c0 : status === 'Active' ? t.c1 : t.chartMuted;
