export type TrackerPeriod = '7d' | '1m' | '3m' | '6m';

export const TRACKER_PERIOD_OPTIONS: { id: TrackerPeriod; label: string; days: number }[] = [
  { id: '7d', label: '7 ngày', days: 7 },
  { id: '1m', label: '1 tháng', days: 30 },
  { id: '3m', label: '3 tháng', days: 90 },
  { id: '6m', label: '6 tháng', days: 180 },
];

export const DEFAULT_TRACKER_PERIOD: TrackerPeriod = '7d';

export function periodDays(period: TrackerPeriod): number {
  const opt = TRACKER_PERIOD_OPTIONS.find((p) => p.id === period);
  return opt?.days ?? 7;
}
