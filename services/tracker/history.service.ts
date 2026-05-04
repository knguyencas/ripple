import api from '../core/api';

export interface DailyPoint {
  date: string;
  value: number | null;
}

export interface HistorySummary {
  points: DailyPoint[];
  average: number | null;
  daysWithData: number;
  totalDays: number;
}

interface RawWaterItem { date: string; glasses: number; goal: number; }
interface RawHealthDay { date: string; steps: number | null; sleepMinutes: number | null; }
interface RawMeditationItem { date: string; minutes: number; sessions: number; }

function fillDays(
  days: number,
  byDate: Map<string, number | null>,
  refDate: Date = new Date()
): DailyPoint[] {
  const points: DailyPoint[] = [];
  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    points.push({ date: key, value: byDate.has(key) ? byDate.get(key) ?? null : null });
  }
  return points;
}

function summarize(points: DailyPoint[]): HistorySummary {
  const valid = points.filter((p) => p.value != null) as { date: string; value: number }[];
  const avg = valid.length
    ? valid.reduce((sum, p) => sum + p.value, 0) / valid.length
    : null;
  return {
    points,
    average: avg,
    daysWithData: valid.length,
    totalDays: points.length,
  };
}

export async function fetchWaterHistory(days: number): Promise<HistorySummary> {
  try {
    const res = await api.get('/water/history', { params: { days } });
    const items: RawWaterItem[] = res.data?.items ?? [];
    const map = new Map<string, number | null>();
    for (const it of items) map.set(it.date, it.glasses);
    return summarize(fillDays(days, map));
  } catch {
    return summarize(fillDays(days, new Map()));
  }
}

export async function fetchStepsHistory(days: number): Promise<HistorySummary> {
  try {
    const res = await api.get('/health/summary', { params: { days } });
    const daily: RawHealthDay[] = res.data?.dailyData ?? [];
    const map = new Map<string, number | null>();
    for (const it of daily) map.set(it.date, it.steps);
    return summarize(fillDays(days, map));
  } catch {
    return summarize(fillDays(days, new Map()));
  }
}

export async function fetchSleepHistory(days: number): Promise<HistorySummary> {
  try {
    const res = await api.get('/health/summary', { params: { days } });
    const daily: RawHealthDay[] = res.data?.dailyData ?? [];
    const map = new Map<string, number | null>();
    for (const it of daily) map.set(it.date, it.sleepMinutes);
    return summarize(fillDays(days, map));
  } catch {
    return summarize(fillDays(days, new Map()));
  }
}

export async function fetchMeditationHistory(days: number): Promise<HistorySummary> {
  try {
    const res = await api.get('/meditation/history', { params: { days } });
    const items: RawMeditationItem[] = res.data?.items ?? [];
    const map = new Map<string, number | null>();
    for (const it of items) map.set(it.date, it.minutes);
    return summarize(fillDays(days, map));
  } catch {
    return summarize(fillDays(days, new Map()));
  }
}
