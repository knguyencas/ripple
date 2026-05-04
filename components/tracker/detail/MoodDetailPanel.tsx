import { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { activityPanelStyles as s } from '../../../styles/tracker/activity-detail.styles';
import { moodChartStyles as m } from '../../../styles/tracker/mood-chart.styles';
import {
  DEFAULT_TRACKER_PERIOD,
  type TrackerPeriod,
  periodDays,
} from '../../../constants/tracker/period.constants';
import PeriodSelector from './PeriodSelector';
import { toDateKey } from '../../../utils/shared/date.utils';

interface Props {
  active: boolean;
  scoreByDate: Record<string, number>;
}

interface BarPoint {
  key: string;
  label: string;
  score: number | null;
}

const WEEKDAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function buildDailyPoints(scoreByDate: Record<string, number>, days: number): BarPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const out: BarPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toDateKey(d);
    const score = scoreByDate[key];
    const label = days <= 7 ? WEEKDAYS_VI[d.getDay()] : `${d.getDate()}/${d.getMonth() + 1}`;
    out.push({ key, label, score: score == null ? null : score });
  }
  return out;
}

function buildWeeklyPoints(scoreByDate: Record<string, number>, days: number): BarPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets: BarPoint[] = [];
  const numBuckets = Math.ceil(days / 7);
  for (let i = numBuckets - 1; i >= 0; i--) {
    const end = new Date(today);
    end.setDate(today.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const scores: number[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      const v = scoreByDate[toDateKey(cur)];
      if (v != null) scores.push(v);
      cur.setDate(cur.getDate() + 1);
    }
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    buckets.push({
      key: `${toDateKey(start)}_${toDateKey(end)}`,
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      score: avg,
    });
  }
  return buckets;
}

function emojiForScore(score: number | null): string {
  if (score == null) return '·';
  if (score >= 4.5) return '😄';
  if (score >= 3.5) return '🙂';
  if (score >= 2.5) return '😐';
  if (score >= 1.5) return '😕';
  return '😢';
}

function colorForScore(score: number | null): { bar: string; emojiBg: string } {
  if (score == null) return { bar: '#E5E7EA', emojiBg: '#E5E7EA' };
  if (score >= 4.5) return { bar: '#7DC289', emojiBg: '#7DC289' };
  if (score >= 3.5) return { bar: '#A5D6A7', emojiBg: '#A5D6A7' };
  if (score >= 2.5) return { bar: '#F4D88E', emojiBg: '#F4D88E' };
  if (score >= 1.5) return { bar: '#F4B08A', emojiBg: '#F4B08A' };
  return { bar: '#C7CDD3', emojiBg: '#C7CDD3' };
}

export default function MoodDetailPanel({ active, scoreByDate }: Props) {
  const [period, setPeriod] = useState<TrackerPeriod>(DEFAULT_TRACKER_PERIOD);

  const points = useMemo(() => {
    if (!active) return [];
    const days = periodDays(period);
    if (days <= 30) return buildDailyPoints(scoreByDate, days);
    return buildWeeklyPoints(scoreByDate, days);
  }, [active, period, scoreByDate]);

  const validScores = points
    .map((p) => p.score)
    .filter((v): v is number => v != null);
  const avg = validScores.length
    ? validScores.reduce((a, b) => a + b, 0) / validScores.length
    : null;

  const labelStep = Math.max(1, Math.ceil(points.length / 7));
  const showLabel = (i: number) =>
    points.length <= 14 || i % labelStep === 0 || i === points.length - 1;

  return (
    <>
      <PeriodSelector value={period} onChange={setPeriod} />

      <View style={s.visualRow}>
        <View style={s.visualText}>
          <Text style={s.metricBig}>{avg != null ? avg.toFixed(1) : '—'}</Text>
          <Text style={s.metricUnit}>điểm trung bình / 5</Text>
          <Text style={s.metricCaption}>
            {validScores.length}/{points.length}{' '}
            {periodDays(period) <= 30 ? 'ngày' : 'tuần'} có dữ liệu
          </Text>
        </View>
      </View>

      <View style={m.chartWrap}>
        <View style={m.chartArea}>
          {points.map((point, idx) => {
            const ratio = point.score != null ? Math.min(1, Math.max(0, (point.score - 1) / 4)) : 0;
            const color = colorForScore(point.score);
            const emoji = emojiForScore(point.score);
            return (
              <View key={point.key} style={m.column}>
                <View style={m.barColumn}>
                  <View style={m.barBg} />
                  {point.score != null && (
                    <>
                      <View
                        style={[
                          m.barFill,
                          {
                            height: `${Math.max(8, ratio * 100)}%`,
                            backgroundColor: color.bar,
                          },
                        ]}
                      >
                        <View style={[m.emojiBubble, { backgroundColor: color.emojiBg }]}>
                          <Text style={m.emojiText}>{emoji}</Text>
                        </View>
                      </View>
                    </>
                  )}
                  {point.score == null && (
                    <View style={[m.barEmpty]}>
                      <Text style={m.emojiTextEmpty}>{emoji}</Text>
                    </View>
                  )}
                </View>
                <Text style={m.label}>{showLabel(idx) ? point.label : ''}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </>
  );
}
