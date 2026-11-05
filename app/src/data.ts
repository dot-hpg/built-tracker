import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

// The website publishes the tracker as JSON; the app reads the same files.
export const DATA_URL = 'https://dot-hpg.github.io/built-tracker/data';
const CACHE_KEY = 'built-tracker-cache-v1';

export type Project = {
  name: string;
  category: string;
  description: string;
  stack: string;
  repo: string;
  repo_url: string;
  start: string;
  last: string;
  commits: number;
  status: 'Shipped' | 'Active' | 'Early stage' | string;
  progress: number;
  evidence: string;
};

export type Day = {
  day: number;
  date: string;
  week: number;
  project: string;
  category: string;
  focus: string;
  level: string;
  status: 'Done' | 'Today' | 'Missed' | 'Planned' | string;
  commits: number | null;
};

export type TrackerData = { projects: Project[]; days: Day[]; updated: string | null };

async function getJson(name: string) {
  const res = await fetch(`${DATA_URL}/${name}?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${name}: ${res.status}`);
  return res.json();
}

export async function fetchTracker(): Promise<TrackerData> {
  const [p, t, m] = await Promise.all([getJson('projects.json'), getJson('tracker.json'), getJson('meta.json').catch(() => ({}))]);
  return { projects: p.rows ?? p, days: t.rows ?? t, updated: m.updated ?? null };
}

export function useTracker() {
  const [data, setData] = useState<TrackerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fresh = await fetchTracker();
      setData(fresh);
      setError(null);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh)).catch(() => {});
    } catch {
      setError("Couldn't reach the tracker. Showing the last saved copy.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => { if (raw) setData((d) => d ?? JSON.parse(raw)); })
      .catch(() => {})
      .finally(refresh);
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') refresh(); });
    return () => sub.remove();
  }, [refresh]);

  return { data, error, refreshing, refresh };
}

export function stats(d: TrackerData) {
  const elapsed = d.days.filter((x) => x.status !== 'Planned');
  let streak = 0;
  for (let i = elapsed.length - 1; i >= 0; i--) {
    if ((elapsed[i].commits ?? 0) > 0) streak++;
    else if (elapsed[i].status === 'Today') continue; // today isn't over yet
    else break;
  }
  const avg = d.projects.reduce((s, p) => s + Number(p.progress), 0) / Math.max(1, d.projects.length) / 100;
  const byCat = new Map<string, { n: number; sum: number }>();
  d.projects.forEach((p) => {
    const c = byCat.get(p.category) ?? { n: 0, sum: 0 };
    c.n += 1; c.sum += Number(p.progress);
    byCat.set(p.category, c);
  });
  const tracks = new Map<string, number>();
  d.days.forEach((x) => tracks.set(x.category, (tracks.get(x.category) ?? 0) + 1));
  return {
    projects: d.projects.length,
    shipped: d.projects.filter((p) => p.status === 'Shipped').length,
    avgProgress: avg,
    streak,
    commits: elapsed.reduce((s, x) => s + (x.commits ?? 0), 0),
    dayNumber: elapsed.length,
    totalDays: d.days.length,
    today: d.days.find((x) => x.status === 'Today') ?? null,
    next: d.days.find((x) => x.status === 'Planned') ?? null,
    categories: [...byCat.entries()].map(([category, v]) => ({ category, projects: v.n, avg: v.sum / v.n / 100 }))
      .sort((a, b) => b.projects - a.projects || b.avg - a.avg),
    tracks: [...tracks.entries()].map(([category, days]) => ({ category, days })).sort((a, b) => b.days - a.days),
  };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const parseDay = (s: string) => new Date(`${s.slice(0, 10)}T00:00:00Z`);
export const fmtDate = (s: string) => { const d = parseDay(s); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`; };
export const fmtWeekday = (s: string) => `${WEEKDAYS[parseDay(s).getUTCDay()]} ${fmtDate(s)}`;
export const fmtPct = (v: number) => `${Math.round(v * 100)}%`;
export const fmtUpdated = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
